import React, { useState, useEffect } from "react";
import {
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import EditUserModal from "./EditUserModal";
import api from "../../api";

export default function UserCategories() {
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

      setCategories(rolesList);

      let allUsers = [];
      let nextUrl = "/users/";

      while (nextUrl) {
        const res = await api.get(nextUrl);
        const data = res.data;
        const pageUsers = Array.isArray(data) ? data : data.results || [];
        allUsers = [...allUsers, ...pageUsers];

        if (data.next) {
          const urlObj = new URL(data.next);
          nextUrl = urlObj.pathname + urlObj.search;
        } else {
          nextUrl = null;
        }
      }

      const groupedUsers = rolesList.reduce((acc, category) => {
        acc[category.key] = allUsers.filter((user) => {
          // Check both role name (label) and ID (key)
          // The backend might return role_label or just role ID
          if (user.role_label && user.role_label === category.label) return true;
          if (user.role === category.key) return true;
          if (String(user.role) === String(category.key)) return true;
          // Also check nested role object if applicable
          if (user.role && typeof user.role === 'object' && user.role.id === category.key) return true;
          return false;
        });
        return acc;
      }, {});

      setUsersByCategory(groupedUsers);
      setError(null);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      // Fallback or empty state
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    let roleToAssign = selectedCategory.key;

    if (roleToAssign === undefined || roleToAssign === null) return;

    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

    const newUserPayload = {
      username: form.name.value,
      email: form.email.value,
      phone_number: form.phone.value,
      department: form.department.value,
      password: tempPassword,
      // Pass role ID if creating user with role directly is supported, 
      // otherwise we might need to assign it after creation
      role: roleToAssign
    };

    try {
      // 🔹 Use atomic Create with Role endpoint
      const res = await api.post('/users/create-with-role/', {
        ...newUserPayload,
        role_id: roleToAssign // Backend likely expects role_id for this specific endpoint
      });

      // No need for second API call
      // The response usually contains the created user

      setNewUserTempPassword(tempPassword);

      setNewUserTempPassword(tempPassword);
      fetchData();
      alert(`User created!`);
    } catch (err) {
      console.error(err);
      alert("Creation failed.");
    }
  };
  // ✅ DELETE USER HANDLER
  const handleDeleteUser = async (userId) => {
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
    if (newCategory.trim()) {
      try {
        await api.post("/users/roles/create/", { name: newCategory.trim() });
        setNewCategory("");
        setShowForm(false);
        fetchData();
      } catch (err) { alert("Failed to create category"); }
    }
  };

  const handleSaveUser = async (updatedUser) => {
    try {
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
      setSelectedUser(null);
      fetchData();
      alert("Updated.");
    } catch (err) { alert("Failed to update."); }
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
            {categories.map((category) => (
              <div
                key={category.key}
                onClick={() => setSelectedCategory(category)}
                className="group flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{category.label}</h3>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {usersByCategory[category.key]?.length || 0} Staff
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-3 w-3 text-gray-300 group-hover:text-blue-500" />
              </div>
            ))}

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Add Role</span>
            </button>
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
            <button onClick={() => setShowAddUserForm(true)} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm">
              <PlusIcon className="h-3 w-3" /> Add User
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

            {/* 🖥️ DESKTOP: Tight Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {usersByCategory[selectedCategory.key]?.length > 0 ? (
                    usersByCategory[selectedCategory.key].map((u) => (
                      <tr
                        key={u.id || u.email}
                        onClick={() => setSelectedUser(u)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                      >
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
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-600 italic">No users found.</td>
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
              <input name="name" placeholder="Full Name" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input name="email" type="email" placeholder="Email" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-2">
                <input name="phone" placeholder="Phone" className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <input name="department" placeholder="Dept" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              {newUserTempPassword && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center">
                  <p className="text-xs text-green-700 mb-1">Success! Password:</p>
                  <code className="bg-white px-2 py-1 rounded border border-green-200 text-green-800 font-bold text-sm">{newUserTempPassword}</code>
                </div>
              )}
              <div className="pt-2 flex justify-end">
                {!newUserTempPassword && <button type="submit" className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">Create Account</button>}
                {newUserTempPassword && <button type="button" onClick={closeAddUserModal} className="w-full py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200">Done</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}