import React, { useState, useEffect } from "react";
import {
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  XMarkIcon, // Added missing icon
} from "@heroicons/react/24/outline";
import EditUserModal from "./EditUserModal";
import api from "../../api"; // Import the api helper

export default function UserCategories() {
  const [categories, setCategories] = useState([]); // Will be fetched from /api/categories/user-categories/
  const [usersByCategory, setUsersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserTempPassword, setNewUserTempPassword] = useState("");

  // Fetch all categories and users on component mount
  const fetchData = async () => {
    try {
      setLoading(true);
      // FIXED: Changed endpoint from /users/roles/ to /categories/user-categories/
      const [rolesRes, usersRes] = await Promise.all([
        api.get("/api/users/roles/"),
        api.get("/api/users/"),
      ]);

      const rolesData = rolesRes.data;
      const users = usersRes.data;

      const rolesList = Array.isArray(rolesData) ? rolesData : rolesData.results || [];

      // Set categories from the categories endpoint
      setCategories(rolesList);

      // Group users by the role name
      const groupedUsers = rolesList.reduce((acc, role) => {
        // Use role.name as the key for grouping
        acc[role.key] = users.filter(
          (user) => user.role === role.key
        );
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
        // FIXED: Changed endpoint from /roles/create/ to /categories/user-categories/
        await api.post("/api/users/roles/", {
          name: newCategory.trim(),
        });
        setNewCategory("");
        setShowForm(false);
        fetchData(); // Refetch all data to show the new category
      } catch (err) {
        console.error("Failed to create category", err);
        alert("Error: Could not create the new category.");
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // 💡 Assume selectedCategory is the role name (e.g., "Admin")
    // and the backend expects this string key.
    
    const newUser = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        department: form.department.value,
        
        // ✅ FIX 1: Provide the missing 'username' field (using email is common)
        username: form.email.value, 
        
        // ✅ FIX 2: Since role is a string key, use the selected category name.
        role: selectedCategory.key
    };

    try {
        // Double-check the payload before sending (optional, but helpful for debugging)
        console.log("Sending User Payload:", newUser); 
        
        await api.post('/api/users/', newUser); 
        
        alert(`User ${newUser.name} created for role ${selectedCategory.label}.`);
        closeAddUserModal();
        fetchData(); // Refresh list to show the new user
    } catch(err) {
        console.error("Failed to create user:", err);

        // Extract the specific validation errors from the API response
        const apiErrors = err.response?.data;
        
        let errorMessage = "Could not create the new user.";

        if (apiErrors) {
            // Log the full error object for detailed debugging
            console.error("API Validation Errors:", apiErrors);
            
            // Try to construct a user-friendly message
            const errorKeys = Object.keys(apiErrors);
            if (errorKeys.length > 0) {
                // Example: "username: This field must be unique. role: Invalid key."
                errorMessage = errorKeys.map(key => 
                    `${key}: ${Array.isArray(apiErrors[key]) ? apiErrors[key].join(' ') : apiErrors[key]}`
                ).join(' ');
            }
        }

        alert(`Error: ${errorMessage}`);
    }
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      // CORRECT: This endpoint /users/<id>/update/ matches your list
      await api.put(`/users/${updatedUser.id}/update/`, updatedUser);
      setSelectedUser(null);
      fetchData(); // Refetch to show updated info
      alert("User updated successfully.");
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Error: Could not update user.");
    }
  };

  const handleRevokePermissions = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to revoke all permissions for this user?"
      )
    ) {
      try {
        // Find the user to get their data, then update with empty permissions
        let userToUpdate;
        for (const category in usersByCategory) {
          userToUpdate = usersByCategory[category].find((u) => u.id === userId);
          if (userToUpdate) break;
        }

        if (!userToUpdate) {
          alert("Error: Could not find user.");
          return;
        }

        const updatedUser = { ...userToUpdate, permissions: {} }; // Set permissions to empty object

        // CORRECT: This endpoint /users/<id>/update/ matches your list
        await api.put(`/users/${updatedUser.id}/update/`, updatedUser);

        // Refetch data to show changes
        fetchData();
        // Update the user in the modal
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
            // 🎯 FIX 2: Use the unique ID for the key.
            key={category.key} 
            // 🎯 FIX 3: Set the selected category to the *name* (string).
            onClick={() => setSelectedCategory(category)}
            className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-700" />
              {/* 🎯 FIX 4: Display the 'name' (label) property. */}
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
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h2 className="text-base font-semibold ml-4">{selectedCategory.label}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-2 text-left text-sm">Names</th>
                  <th className="border px-2 py-2 text-left text-sm">Emails</th>
                  <th className="border px-2 py-2 text-left text-sm">Phone No</th>
                  <th className="border px-2 py-2 text-left text-sm">Department</th>
                  {/* <th className="border px-2 py-2 text-left text-sm">Role</th> */}
                </tr>
              </thead>
              <tbody>
                {usersByCategory[selectedCategory.key]?.map((u) => (
                  <tr
                    key={u.id || u.email}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-gray-50 cursor-pointer text-xs md:text-sm"
                  >
                    <td className="border px-2 py-2">{u.name}</td>
                    <td className="border px-2 py-2">{u.email}</td>
                    <td className="border px-2 py-2">{u.phone}</td>
                    <td className="border px-2 py-2">{u.department}</td>
                    {/* <td className="border px-2 py-2">{u.role}</td> */}
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
          // FIXED: Removed undefined handleChangeCategory prop
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
              {/* <input
                name="role"
                placeholder="Role"
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              /> */}

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

