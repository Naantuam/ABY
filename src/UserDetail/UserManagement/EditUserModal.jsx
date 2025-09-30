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
                  <div className="bg-white p-4 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-10">
                      {/* Left Column: Profile Picture & Actions */}
                      <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                        {/* Profile Picture Box */}
                        <div className="relative w-40 h-40 rounded-lg bg-slate-100 flex items-center justify-center mb-4 border">
                          {editableUser.picture ? (
                            <img
                              src={editableUser.picture}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <svg
                              className="w-20 h-20 text-slate-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          )}
                          <button className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                        </div>
                        {/* Edit Profile Button */}
                        <div className="mt-8">
                          <button
                            type="button" // Use type="submit" if this is inside a <form> tag
                            className="px-6 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                          >
                            EDIT PROFILE
                          </button>
                        </div>
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
                              value={editableUser.email}
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
                            <input
                              type="text"
                              value={editableUser.phone}
                              onChange={(e) =>
                                setEditableUser({ ...editableUser, phone: e.target.value })
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
                              value={editableUser.department}
                              onChange={(e) =>
                                setEditableUser({ ...editableUser, department: e.target.value })
                              }
                              className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              placeholder="Marketing"
                            />
                          </div>

                          {/* Role */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <input
                              type="text"
                              value={editableUser.role}
                              onChange={(e) =>
                                setEditableUser({ ...editableUser, role: e.target.value })
                              }
                              className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              placeholder="Manager"
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
                </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
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
  );
}
