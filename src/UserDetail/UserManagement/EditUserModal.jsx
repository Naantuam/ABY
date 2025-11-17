import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function EditUserModal({
  selectedUser,
  selectedCategory,
  categories,
  setSelectedUser,
  handleSaveUser,
  handleRevokePermissions,
  handleDeleteUser,
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
        {/* ✅ FIX: Changed 'editableUser.name' to 'editableUser.username' */}
        <h2 className="text-lg font-semibold mb-2">{editableUser.username}</h2>

        {/* ==== Tabs Header ==== */}
        {/* ... (tabs logic) ... */}

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
                  <div className="bg-white p-4 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-10">
                      {/* Left Column: Profile Picture & Actions */}
                      <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                        {/* Profile Picture Box */}
                        <div className="relative w-40 h-40 rounded-lg bg-slate-100 flex items-center justify-center mb-4 border">
                          {/* ✅ FIX: Changed 'editableUser.picture' to 'editableUser.profile_image' */}
                          {editableUser.profile_image ? (
                            <img
                              src={editableUser.profile_image}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <svg
                              className="w-20 h-20 text-slate-300"
                              /* ... (svg path) ... */
                            ></svg>
                          )}
                          {/* ... (camera button) ... */}
                        </div>
                        {/* ... (edit profile button) ... */}
                      </div>

                      {/* Right Column: User Details Form */}
                      <div className="flex-grow flex flex-col">
                        <div className="space-y-3">
                          {/* Email */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={editableUser.email || ""}
                              onChange={(e) =>
                                setEditableUser({ ...editableUser, email: e.target.value })
                              }
                              className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              placeholder="example@domain.com"
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            {/* ✅ FIX: Changed 'editableUser.phone' to 'editableUser.phone_number' */}
                            <input
                              type="text"
                               value={editableUser.phone_number || ""}
                              onChange={(e) =>
                                // ✅ FIX: Set 'phone_number' key in state
                                setEditableUser({ ...editableUser, phone_number: e.target.value })
                              }
                              className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              placeholder="+1-999-999-9999"
                            />
                          </div>

                          {/* Department */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Department
                            </label>
                            <input
                              type="text"
                              value={editableUser.department || ""}
                              onChange={(e) =>
                                setEditableUser({ ...editableUser, department: e.target.value })
                              }
                              className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              placeholder="Marketing"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
              )}

              {activeTab === 1 && (
                <div>
                  {/* ===== Roles & Permissions Section ===== */}
                  {/* ... (select category dropdown) ... */}
                  
                  <table className="min-w-full border border-gray-200 text-sm">
                    {/* ... (table headers) ... */}
                    <tbody>
                      {/* ... (permissions mapping) ... */}
                      
                      {/* ===== Correctly placed button row ===== */}
                      <tr>
                          <td colSpan="2" className="p-2">
                              {/* ✅ FIX: Pass 'editableUser.id' (not email) to parent function */}
                              <button
                                  onClick={() => handleRevokePermissions(editableUser.id)}
                                  className="w-auto px-2 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                  Revoke Permissions
                              </button>
                          </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
         {/* ==== Footer Buttons ==== */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleDeleteUser(editableUser.id)}
            className="px-4 py-2 flex items-center gap-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4" />
            Delete User
          </button>
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
  );
}
