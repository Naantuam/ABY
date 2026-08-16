import React, { useState, useEffect, useRef } from "react";
import {
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import EditUserModal from "./EditUserModal";
import api from "../../api";
import { exportToExcel } from "../../utils/exportUtils";
import { importFromExcel } from "../../utils/importUtils";
import { usePermissions } from "../../hooks/usePermissions";

export default function UserCategories() {
  const { canAdd, canEdit, canDelete } = usePermissions('users');
  const [categories, setCategories] = useState([]);
  const [usersByCategory, setUsersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserTempPassword, setNewUserTempPassword] = useState("");

  // ──────────────────────────────────────────────
  // 1️⃣ FETCH DATA
  // ──────────────────────────────────────────────
  // ──────────────────────────────────────────────
  // 1️⃣ FETCH DATA
  // ──────────────────────────────────────────────
  const UNASSIGNED_KEY = '__unassigned__';

  const fetchData = async () => {
    try {
      setLoading(true);

      // 🔹 Fetch Roles dynamically
      const rolesRes = await api.get("/users/roles/");
      const rolesData = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data.results || []);

      const rolesList = rolesData.map(role => ({
        key: role.key ?? role.id,
        label: role.label ?? role.name,
        permissions: role.permissions || []
      }));

      // Always add an Unassigned bucket at the end
      const allCategories = [
        ...rolesList,
        { key: UNASSIGNED_KEY, label: 'Unassigned', permissions: [] }
      ];
      setCategories(allCategories);

      // Fetch ALL users (handle pagination)
      let allUsers = [];
      let nextUrl = "/users/";
      while (nextUrl) {
        const res = await api.get(nextUrl);
        const data = res.data;
        const pageUsers = Array.isArray(data) ? data : (data.results || []);
        allUsers = [...allUsers, ...pageUsers];
        if (data.next) {
          try {
            const urlObj = new URL(data.next);
            nextUrl = urlObj.pathname + urlObj.search;
          } catch {
            nextUrl = null;
          }
        } else {
          nextUrl = null;
        }
      }

      // Group users by role, and collect unassigned users
      const groupedUsers = rolesList.reduce((acc, category) => {
        acc[category.key] = allUsers.filter((user) => {
          const userRole = user.role;
          if (!userRole) return false;
          if (typeof userRole === 'object' && userRole !== null) {
            return userRole.id === category.key;
          }
          return String(userRole) === String(category.key);
        });
        return acc;
      }, {});

      // Users with no role go into Unassigned
      const assignedUserIds = new Set(
        Object.values(groupedUsers).flat().map(u => u.id)
      );
      groupedUsers[UNASSIGNED_KEY] = allUsers.filter(u => !assignedUserIds.has(u.id));

      setUsersByCategory(groupedUsers);
      setError(null);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // ──────────────────────────────────────────────
  // 2️⃣ HANDLERS
  // ──────────────────────────────────────────────

  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategory) return;

    try {
      const data = await importFromExcel(file, [
        "^(name|username)$",
        "^email$",
        "^(phone|phone number)$",
        "^department$"
      ]);
      const newItems = data.map((row, index) => {
        return {
          id: `TEMP-${Date.now()}-${index}`,
          username: row["Name"] || row["Username"] || "",
          email: row["Email"] || "",
          phone_number: row["Phone"] || "",
          department: row["Department"] || "",
          role_id: selectedCategory.key // Set role to current category
        };
      });

      setUsersByCategory(prev => ({
        ...prev,
        [selectedCategory.key]: [...newItems, ...(prev[selectedCategory.key] || [])]
      }));
    } catch (err) {
      console.error("Import error:", err);
      alert(err.message || "Failed to import file.");
    } finally {
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!canAdd) return alert("You don't have permission to add users.");
    const form = e.target;
    const roleKey = selectedCategory.key;
    const isUnassigned = roleKey === UNASSIGNED_KEY;

    // Build payload – only include role_id when a real role is selected
    const payload = {
      username: form.name.value.trim(),
      email: form.email.value.trim(),
      phone_number: form.phone.value.trim(),
      department: form.department.value.trim(),
      password: "TEMP_" + Math.random().toString(36).slice(-8), // Dummy password for backend validation
    };
    if (!isUnassigned) {
      payload.role_id = roleKey;
    }

    try {
      if (isUnassigned) {
        // Use standard create endpoint
        await api.post('/users/', payload);
      } else {
        await api.post('/users/create-with-role/', payload);
      }
      
      setNewUserTempPassword("ACTIVATION_EMAIL_SENT");
      fetchData();
    } catch (err) {
      console.error("Create user error:", err.response?.data || err);
      const errMsg = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
        : err.message;
      alert(`Creation failed:\n${errMsg}`);
    }
  };

  // ✅ DELETE USER HANDLER
  const handleDeleteUser = async (userId) => {
    if (!canDelete) return alert("You don't have permission to delete users.");
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      await api.delete(`/users/${userId}/delete/`); // Check your API for exact endpoint
      // Update UI
      const updatedList = { ...usersByCategory };
      // Remove user from the current category list
      if (selectedCategory) {
        updatedList[selectedCategory.key] = updatedList[selectedCategory.key].filter(u => u.id !== userId);
      }
      setUsersByCategory(updatedList);
      setSelectedUser(null); // Close modal
      alert("User deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!canAdd) return alert("You don't have permission to add roles.");
    if (newCategory.trim()) {
      try {
        await api.post("/users/roles/create/", { name: newCategory.trim() });
        setNewCategory("");
        setShowForm(false);
        fetchData();
      } catch (err) { 
        console.error("Create Category Error:", err.response?.data || err);
        alert("Failed to create category"); 
      }
    }
  };

  const handleSaveUser = async (updatedUser) => {
    if (!canEdit && !updatedUser.id?.toString().startsWith('TEMP-')) return alert("You don't have permission to edit users.");
    try {
      const isTemp = updatedUser.id && String(updatedUser.id).startsWith("TEMP-");
      if (isTemp) {
        if (!canAdd) return alert("You don't have permission to add users.");
        const payload = {
          username: updatedUser.username,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          department: updatedUser.department,
          password: "TEMP_" + Math.random().toString(36).slice(-8),
          role_id: updatedUser.role_id !== undefined ? updatedUser.role_id : selectedCategory.key
        };
        await api.post('/users/create-with-role/', payload);
        alert(`Created ${updatedUser.username}! An activation email has been sent to them.`);
      } else {
        await api.put(`/users/${updatedUser.id}/update/`, {
          username: updatedUser.username,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          department: updatedUser.department,
        });

        if (updatedUser.role_id !== undefined) {
          await api.put(`/users/${updatedUser.id}/assign-role/`, {
            role_id: updatedUser.role_id
          });
        }
        alert("Updated.");
      }
      setSelectedUser(null);
      fetchData();
    } catch (err) { alert("Failed to save."); }
  };

  const handleRevokePermissions = async (userId) => {
    if (window.confirm("Revoke permissions?")) {
      try {
        let userToUpdate;
        for (const category in usersByCategory) {
          userToUpdate = usersByCategory[category].find((u) => u.id === userId);
          if (userToUpdate) break;
        }
        if (!userToUpdate) return;

        const updatedUser = { ...userToUpdate, permissions: {} };
        await api.put(`/users/${updatedUser.id}/update/`, updatedUser);
        fetchData();
        setSelectedUser(updatedUser);
        alert("Revoked.");
      } catch (err) { alert("Error."); }
    }
  };

  const handleExport = () => {
    if (!selectedCategory) return;
    const users = usersByCategory[selectedCategory.key] || [];
    if (users.length === 0) return alert("No users to export in this category!");

    const exportData = users.map(u => ({
      "Name": u.username,
      "Email": u.email,
      "Phone": u.phone_number || "-",
      "Department": u.department || "-",
      "Role": selectedCategory.label
    }));
    exportToExcel(exportData, `${selectedCategory.label}_Users`);
  };

  const closeAddUserModal = () => {
    setShowAddUserForm(false);
    setNewUserTempPassword("");
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* VIEW 1: CATEGORIES GRID */}
      {!selectedCategory ? (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">User Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => {
              const isUnassigned = category.key === UNASSIGNED_KEY;
              const count = usersByCategory[category.key]?.length || 0;
              return (
                <div
                  key={category.key}
                  onClick={() => setSelectedCategory(category)}
                  className={`group flex items-center justify-between rounded-lg shadow-sm border px-4 py-3 cursor-pointer hover:shadow-md transition-all ${
                    isUnassigned
                      ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md transition-colors ${
                      isUnassigned
                        ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{category.label}</h3>
                      <p className={`text-[10px] font-medium ${isUnassigned && count > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {count} {isUnassigned ? 'need a role' : 'Staff'}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className={`h-3 w-3 ${isUnassigned ? 'text-amber-300 group-hover:text-amber-500' : 'text-gray-300 group-hover:text-blue-500'}`} />
                </div>
              );
            })}

            {canAdd && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Add Role</span>
              </button>
            )}
          </div>
        </div>
      ) : (

        /* VIEW 2: SELECTED USER LIST (TIGHT TABLE) */
        <div className="max-w-7xl mx-auto">

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedCategory(null)} className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm">
                <ArrowLeftIcon className="h-3 w-3" />
              </button>
              <h2 className="text-base font-bold text-gray-800">{selectedCategory.label}</h2>
            </div>
            <div className="flex gap-2">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImport}
              />
              {canAdd && (
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 flex items-center gap-1 shadow-sm">
                  <ArrowUpTrayIcon className="h-3 w-3" /> Import
                </button>
              )}
              <button onClick={handleExport} className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm">
                <ArrowUpTrayIcon className="h-3 w-3" /> Export
              </button>
              {canAdd && (
                <button onClick={() => setShowAddUserForm(true)} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm">
                  <PlusIcon className="h-3 w-3" /> Add User
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

            {/* 🖥️ DESKTOP: Tight Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 w-16">S/N</th>
                    <th className="px-4 py-2">NAME</th>
                    <th className="px-4 py-2">EMAIL</th>
                    <th className="px-4 py-2">PHONE</th>
                    <th className="px-4 py-2">DEPARTMENT</th>
                    <th className="px-4 py-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {usersByCategory[selectedCategory.key]?.length > 0 ? (
                    usersByCategory[selectedCategory.key].map((u, index) => (
                      <tr
                        key={u.id || u.email}
                        onClick={() => setSelectedUser(u)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-2.5 text-black font-mono">{index + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-black flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          {u.username}
                        </td>
                        <td className="px-4 py-2.5 text-black">{u.email}</td>
                        <td className="px-4 py-2.5 text-black">{u.phone_number || "-"}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-black border border-gray-200">
                            {u.department}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <ChevronRightIcon className="h-3 w-3 text-gray-300 group-hover:text-blue-500 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-600 italic">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 📱 MOBILE: Tight List */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {usersByCategory[selectedCategory.key]?.length > 0 ? (
                usersByCategory[selectedCategory.key].map((u) => (
                  <div
                    key={u.id || u.email}
                    onClick={() => setSelectedUser(u)}
                    className="p-3 active:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{u.username}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <BuildingOfficeIcon className="w-3 h-3" /> {u.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm italic">No users found.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────── */}
      {/* MODALS (Simplified for Brevity)        */}
      {/* ────────────────────────────────────── */}

      {selectedUser && (
        <EditUserModal
          selectedUser={selectedUser}
          selectedCategory={selectedCategory}
          categories={categories}
          setSelectedUser={setSelectedUser}
          handleSaveUser={handleSaveUser}
          handleRevokePermissions={handleRevokePermissions}
          handleDeleteUser={handleDeleteUser}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xs p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">New Role</h2>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Role Name" className="w-full border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" autoFocus />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddUserForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-900">Add User</h2>
              <button onClick={closeAddUserModal}><XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              {newUserTempPassword !== "ACTIVATION_EMAIL_SENT" ? (
                <>
                  <input name="name" placeholder="Full Name" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <input name="email" type="email" placeholder="Email" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input name="phone" placeholder="Phone" className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    <input name="department" placeholder="Dept" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </>
              ) : (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center my-4">
                  <p className="text-sm text-green-700 font-medium">✅ Success! An activation email has been sent to the user.</p>
                </div>
              )}
              <div className="pt-2 flex justify-end">
                {newUserTempPassword !== "ACTIVATION_EMAIL_SENT" ? (
                  <button type="submit" className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">Create Account</button>
                ) : (
                  <button type="button" onClick={closeAddUserModal} className="w-full py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200">Done</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}