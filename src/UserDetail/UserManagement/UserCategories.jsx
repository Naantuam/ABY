import React, { useState, useEffect } from "react";
import {
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
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

  // --- FETCH ALL PAGES (Fixes the "Invisible User" bug) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Roles
      const rolesRes = await api.get("/users/roles/");
      // Handle array vs paginated response for roles
      let rolesList = Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.results || [];
      
      // Remove Staff
      rolesList = rolesList.filter(role => role.label !== "Staff" && role.key !== "staff");
      setCategories(rolesList);

      // 2. Fetch ALL Users (Loop through pages automatically)
      let allUsers = [];
      let nextUrl = "/users/"; // Start at page 1
      
      console.log("⏳ Starting User Fetch...");

      while (nextUrl) {
        // We use api.get(nextUrl)
        const res = await api.get(nextUrl);
        const data = res.data;

        // Add this page of users to our list
        const pageUsers = Array.isArray(data) ? data : data.results || [];
        allUsers = [...allUsers, ...pageUsers];

        // Check if backend says there is a "next" page
        if (data.next) {
            // Extract the relative link (e.g., "/users/?page=2")
            const urlObj = new URL(data.next);
            nextUrl = urlObj.pathname + urlObj.search;
            console.log("🔄 Found more users... Fetching next page:", nextUrl);
        } else {
            nextUrl = null; // No more pages, stop looping
        }
      }

      console.log(`✅ Total Users Fetched: ${allUsers.length}`);

      // 3. Group Users (Using backend labels/keys)
      const groupedUsers = rolesList.reduce((acc, category) => {
        acc[category.key] = allUsers.filter((user) => {
          // Label Match (Best reliability)
          if (user.role_label && user.role_label === category.label) return true;
          // Key Match
          if (user.role === category.key) return true;
          // ID Match
          if (category.id && user.role === category.id) return true;

          return false;
        });
        return acc;
      }, {});

      setUsersByCategory(groupedUsers);
      setError(null);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Could not load user and role data.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      try {
        await api.post("/users/roles/", {
          name: newCategory.trim(),
        });
        setNewCategory("");
        setShowForm(false);
        fetchData(); 
      } catch (err) {
        console.error("Failed to create category", err);
        alert("Error: Could not create the new category.");
      }
    }
  };

  // ✅ CREATE USER (Trusting Backend Mapping)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const form = e.target;

    // 1. Resolve Role
    // If the category has an ID (e.g. 1), use it.
    // If not, use the Key (e.g. "project_manager") and let backend map it.
    let roleToAssign = selectedCategory.id || selectedCategory.key;

    if (!roleToAssign) {
      alert(`Error: The category '${selectedCategory.label}' has no ID or Key. Cannot create user.`);
      return;
    }

    // 2. Generate Temp Password
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

    // 3. Payload
    const newUserPayload = {
      username: form.name.value,
      email: form.email.value,
      phone_number: form.phone.value,
      department: form.department.value,
      password: tempPassword,
      role: roleToAssign // Sends ID (1) OR String ("project_manager")
    };

    try {
      console.log("🚀 Sending Creation Request:", newUserPayload);
      
      const response = await api.post('/users/create-with-role/', newUserPayload);
      
      console.log("✅ Success:", response.data);
      
      setNewUserTempPassword(tempPassword);
      
      // Refresh list
      fetchData(); 
      
      alert(`User ${newUserPayload.username} created successfully!`);

    } catch (err) {
      console.error("❌ Creation Failed:", err);
      let errorMessage = "Could not create the new user.";
      
      if (err.response?.data) {
          const apiErrors = err.response.data;
          if (typeof apiErrors === 'object') {
             errorMessage = Object.entries(apiErrors)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
              .join("\n");
          } else {
             errorMessage = apiErrors;
          }
      }
      alert(`Error:\n${errorMessage}`);
    }
  };
  
  const handleSaveUser = async (updatedUser) => {
    try {
      // 1️⃣ Update Basic Info
      await api.put(`/users/${updatedUser.id}/update/`, {
        username: updatedUser.username,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        department: updatedUser.department,
      });

      // 2️⃣ Update Role (if changed)
      if (updatedUser.role_id) { 
         await api.put(`/users/${updatedUser.id}/assign-role/`, {
           role_id: updatedUser.role_id
         });
      }

      setSelectedUser(null);
      fetchData(); 
      alert("User updated successfully.");
    } catch (err) {
      console.error("Failed to update user:", err);
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join("\n") 
        : "Could not update user.";
      alert(`Error:\n${errorMsg}`);
    }
  };

  const handleRevokePermissions = async (userId) => {
    if (window.confirm("Are you sure you want to revoke all permissions for this user?")) {
      try {
        let userToUpdate;
        for (const category in usersByCategory) {
          userToUpdate = usersByCategory[category].find((u) => u.id === userId);
          if (userToUpdate) break;
        }

        if (!userToUpdate) {
          alert("Error: Could not find user.");
          return;
        }

        const updatedUser = { ...userToUpdate, permissions: {} }; 

        await api.put(`/users/${updatedUser.id}/update/`, updatedUser);

        fetchData();
        setSelectedUser(updatedUser);
        alert("User permissions revoked successfully.");
      } catch (err) {
        console.error("Failed to revoke permissions:", err);
        alert("Error: Could not revoke permissions.");
      }
    }
  };

  const closeAddUserModal = () => {
    setShowAddUserForm(false);
    setNewUserTempPassword("");
  };

  if (loading) return <div className="p-4">Loading user data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      {!selectedCategory ? (
        // Categories Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.key} 
            onClick={() => setSelectedCategory(category)}
            className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-700" />
              <span className="font-medium text-gray-700">{category.label}</span>
            </div>
            <ChevronRightIcon className="h-3 w-3 text-gray-400" />
          </div>
          ))}

          {/* Add Category Card */}
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-row items-center justify-center p-2 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl hover:bg-blue-100 transition"
          >
            <span className="text-blue-600 font-medium">Add Category</span>
          </button>
        </div>
      ) : (
       // Selected Category Table
        <div className="bg-white rounded-xl shadow-md p-4">
          
          {/* Header Row with Back Button */}
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Back to Categories"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-base font-semibold">{selectedCategory.label}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-2 text-left text-sm">Names</th>
                  <th className="border px-2 py-2 text-left text-sm">Emails</th>
                  <th className="border px-2 py-2 text-left text-sm">Phone No</th>
                  <th className="border px-2 py-2 text-left text-sm">Department</th>
                </tr>
              </thead>
              <tbody>
                {usersByCategory[selectedCategory.key]?.map((u) => (
                  <tr
                    key={u.id || u.email}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-gray-50 cursor-pointer text-xs md:text-sm"
                  >
                    <td className="border px-2 py-2">{u.username}</td>
                    <td className="border px-2 py-2">{u.email}</td>
                    <td className="border px-2 py-2">{u.phone_number}</td>
                    <td className="border px-2 py-2">{u.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Add Staff Button */}
                <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddUserForm(true)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" /> {`Add ${selectedCategory.label}`}
                </button>
                </div>
              </div>
              )}

              {selectedUser && (
              <EditUserModal
                selectedUser={selectedUser}
                selectedCategory={selectedCategory}
                categories={categories}
                setSelectedUser={setSelectedUser}
                handleSaveUser={handleSaveUser}
                handleRevokePermissions={handleRevokePermissions}
        />
      )}

      {/* Modal for adding new category */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold mb-4">Add User Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adding user */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {`Add ${selectedCategory.label}`}
              </h2>
              <button
                onClick={closeAddUserModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <input
                name="name"
                placeholder="Full Name"
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                name="department"
                placeholder="Department"
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />

              {newUserTempPassword && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-700">
                    User created! Temporary password:
                  </p>
                  <p className="font-mono font-semibold text-blue-900 bg-blue-100 rounded mt-1 px-2 py-1 inline-block">
                    {newUserTempPassword}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}