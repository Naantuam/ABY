import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function EditUserModal({
  selectedUser,
  selectedCategory,
  categories,
  setSelectedUser,
  handleSaveUser,
  handleRevokePermissions,
  handleChangeCategory,
}) {
  if (!selectedUser) return null;

  const [editableUser, setEditableUser] = useState(selectedUser);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "User Info", icon: UserIcon },
    { name: "Roles & Permissions", icon: ShieldCheckIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-auto p-4">
        <h2 className="text-lg font-semibold mb-2">{editableUser.name}</h2>

        {/* ==== Tabs Header ==== */}
        <div className="flex justify-around border-b pb-2 mb-2">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg transition ${
                activeTab === i
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* ==== Sliding Content ==== */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 0 && (
                <div className="">
                  {/* ===== User Profile Section ===== */}
                  <div className="bg-white p-2 rounded-xl shadow-lg"> {/* Added white background, padding, rounded corners, and shadow */}
                      <div className="flex flex-row"> {/* Grid for two-column layout */}
                          {/* Profile Picture */}
                          <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-gray-100 border border-blue-300">
                            {editableUser.picture ? (
                              <img
                                src={editableUser.picture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                Image
                              </span>
                            )}
                          </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4"> {/* Grid for two-column layout */}          

                          {/* Email */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email
                              </label>
                              <input
                                  type="email"
                                  value={editableUser.email}
                                  onChange={(e) =>
                                      setEditableUser({ ...editableUser, email: e.target.value })
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                  placeholder="example@domain.com" // Placeholder updated for style
                              />
                          </div>

                          {/* Phone */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Phone
                              </label>
                              <input
                                  type="text"
                                  value={editableUser.phone}
                                  onChange={(e) =>
                                      setEditableUser({ ...editableUser, phone: e.target.value })
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                  placeholder="+1-999-999-9999" // Placeholder updated for style
                              />
                          </div>

                          {/* Department */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Department
                              </label>
                              <input
                                  type="text" // Keeping original type but renaming label for visual match
                                  value={editableUser.department} // Still bound to department data
                                  onChange={(e) =>
                                      setEditableUser({ ...editableUser, department: e.target.value })
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                  placeholder="Marketing" // Placeholder updated for style
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Role
                              </label>
                              <input
                                  type="text" // Keeping original type but renaming label for visual match
                                  value={editableUser.role} // Still bound to department data
                                  onChange={(e) =>
                                      setEditableUser({ ...editableUser, role: e.target.value })
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              />
                          </div>
                          {/* Submit Button */}
                          {/* <div className="md:col-span-2 mt-2"> Centers the button and adds top margin */}
                              {/* <button
                                  type="submit"
                                  className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                              >
                                  Submit
                              </button>
                          </div> */}
                        </div>
                      </div>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  {/* ===== Roles & Permissions Section ===== */}
                <div className="overflow-x-auto mb-4">
                    {/* Move User to Another Category */}
                    <div className="w-auto flex flex-col gap-1">
                      <select
                        onChange={(e) =>
                          handleChangeCategory(editableUser, e.target.value)
                        }
                        value={selectedCategory}
                        className="w-40 px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                      >
                        {categories.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                      <tr>
                          <th className="border p-2 text-left">Section</th>
                          <th className="border p-2 text-left">Access Level</th>
                      </tr>
                  </thead>
                  <tbody>
                      {["Projects", "Equipment", "Users", "Inventory", "Safety", "Production"].map(
                          (mod, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                  <td className="border p-2 font-medium">{mod}</td>
                                  <td className="border p-2">
                                      <select
                                          value={editableUser.permissions?.[mod] || "None"}
                                          onChange={(e) =>
                                              setEditableUser({
                                                  ...editableUser,
                                                  permissions: {
                                                      ...editableUser.permissions,
                                                      [mod]: e.target.value,
                                                  },
                                              })
                                          }
                                          className="border rounded px-2 py-1 text-sm w-full focus:ring focus:ring-blue-200"
                                      >
                                          {["None", "View", "Edit", "Full"].map((level, i) => (
                                              <option key={i} value={level}>
                                                  {level}
                                              </option>
                                          ))}
                                      </select>
                                  </td>
                              </tr>
                          )
                      )}
                      {/* ===== Correctly placed button row ===== */}
                      <tr>
                          <td colSpan="2" className="p-2">
                              <button
                                  onClick={() => handleRevokePermissions(editableUser.email)}
                                  className="w-auto px-2 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                  Revoke Permissions
                              </button>
                          </td>
                      </tr>
                  </tbody>
              </table>
              {/* ==== Footer Buttons ==== */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-2 py-2 rounded-lg border text-sm hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSaveUser(editableUser)}
                    className="px-2 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
                </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
