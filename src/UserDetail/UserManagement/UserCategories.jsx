import { useState } from "react";
import {
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import EditUserModal from "./EditUserModal";

export default function UserCategories() {
  const [categories, setCategories] = useState([
    "Safety Officers",
    "Inventory Manager",
    "Project Manager",
    "Accounts Manager",
    "Equipment Manager",
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // Dummy users mapped by category
  const [usersByCategory, setUsersByCategory] = useState({
    "Safety Officers": [
      {
        name: "Adamu Joshua",
        email: "adamu@example.com",
        phone: "08123456789",
        department: "Management",
        role: "Safety Officer 1",
        permissions: ["View Reports", "Manage Safety"],
      },
      {
        name: "Deborah Aliyu",
        email: "deborah@example.com",
        phone: "08123456789",
        department: "Management",
        role: "Safety Officer 2",
        permissions: ["View Reports"],
      },
    ],
    "Inventory Manager": [],
    "Project Manager": [],
    "Accounts Manager": [],
    "Equipment Manager": [],
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setUsersByCategory({ ...usersByCategory, [newCategory.trim()]: [] });
      setNewCategory("");
      setShowForm(false);
    }
  };

  const handleSaveUser = (updatedUser) => {
    setUsersByCategory((prev) => {
      const updated = { ...prev };
      updated[selectedCategory] = updated[selectedCategory].map((u) =>
        u.email === updatedUser.email ? updatedUser : u
      );
      return updated;
    });
    setSelectedUser(null);
  };

  const handleRevokePermissions = (email) => {
    if (confirm("Are you sure you want to revoke this user's permissions?")) {
      setUsersByCategory((prev) => {
        const updated = { ...prev };
        updated[selectedCategory] = updated[selectedCategory].map((u) =>
          u.email === email ? { ...u, permissions: [] } : u
        );
        return updated;
      });
    }
  };

  const handleChangeCategory = (user, newCategory) => {
    setUsersByCategory((prev) => {
      const updated = { ...prev };
      // remove from current category
      updated[selectedCategory] = updated[selectedCategory].filter(
        (u) => u.email !== user.email
      );
      // add to new category
      updated[newCategory] = [...updated[newCategory], user];
      return updated;
    });
    setSelectedUser(null);
  };

  return (
    <div className="p-4 bg-gray-50">
      {!selectedCategory ? (
        // Categories Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => setSelectedCategory(category)}
              className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 cursor-pointer hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-700" />
                <span className="font-medium text-gray-700">{category}</span>
              </div>
              <ChevronRightIcon className="h-3 w-3 text-gray-400" />
            </div>
          ))}

          {/* Add Category Card */}
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-row items-center justify-center bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl hover:bg-blue-100 transition"
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
            <h2 className="text-lg font-semibold ml-4">{selectedCategory}</h2>
          </div>

          <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Names</th>
                <th className="border px-3 py-2 text-left">Emails</th>
                <th className="border px-3 py-2 text-left">Phone No</th>
                <th className="border px-3 py-2 text-left">Department</th>
                <th className="border px-3 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {usersByCategory[selectedCategory]?.map((u, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="border px-3 py-2">{u.name}</td>
                  <td className="border px-3 py-2">{u.email}</td>
                  <td className="border px-3 py-2">{u.phone}</td>
                  <td className="border px-3 py-2">{u.department}</td>
                  <td className="border px-3 py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Staff Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowAddUserForm(true)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Add Staff
            </button>
          </div>
        </div>
      )}
      <EditUserModal
        selectedUser={selectedUser}
        selectedCategory={selectedCategory}
        categories={categories}
        setSelectedUser={setSelectedUser}
        handleSaveUser={handleSaveUser}
        handleRevokePermissions={handleRevokePermissions}
        handleChangeCategory={handleChangeCategory}
      />


      {/* Modal for adding new category */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold mb-4">Add User Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[500px] p-6">
            <h2 className="text-lg font-semibold mb-4">Add Staff</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newUser = {
                  name: e.target.name.value,
                  email: e.target.email.value,
                  phone: e.target.phone.value,
                  department: e.target.department.value,
                  role: e.target.role.value,
                  permissions: [],
                };
                setUsersByCategory((prev) => {
                  const updated = { ...prev };
                  updated[selectedCategory] = [
                    ...updated[selectedCategory],
                    newUser,
                  ];
                  return updated;
                });
                setShowAddUserForm(false);
              }}
              className="space-y-3"
            >
              <input
                name="name"
                placeholder="Full Name"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="email"
                placeholder="Email"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="department"
                placeholder="Department"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="role"
                placeholder="Role"
                className="w-full border rounded-lg px-3 py-2"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



