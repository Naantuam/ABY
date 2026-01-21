import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
  CameraIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";
import api from "../../api";

export default function EditUserModal({
  selectedUser,
  categories,
  setSelectedUser,
  handleSaveUser,
  handleDeleteUser,
}) {
  if (!selectedUser) return null;

  // Initialize local state
  const [editableUser, setEditableUser] = useState({
    ...selectedUser,
    role_id: selectedUser.role, // Assuming 'role' is the ID
  });

  const [activeTab, setActiveTab] = useState(0);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Fetch all available permissions on mount (for display names)
  useEffect(() => {
    const fetchPerms = async () => {
      setLoadingPerms(true);
      try {
        const apps = ['users', 'projects', 'equipment', 'inventory', 'safety', 'production'];
        const permsResList = await Promise.all(
          apps.map(app => api.get(`/users/permissions/${app}/`).catch(e => ({ data: [] })))
        );

        const data = permsResList.flatMap(res =>
          Array.isArray(res.data) ? res.data : (res.data.results || [])
        );
        setAllPermissions(data);
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      } finally {
        setLoadingPerms(false);
      }
    };
    if (activeTab === 1) { // Only fetch when tab is active or pre-fetch
      fetchPerms();
    }
  }, [activeTab]);

  const tabs = [
    { name: "User Info", icon: UserIcon },
    { name: "Roles & Permissions", icon: ShieldCheckIcon },
  ];

  // --- Permission Helpers ---

  // Find the currently selected Role object to see what permissions it has
  const activeRole = categories.find(c => c.key == editableUser.role_id);
  const rolePermissions = activeRole ? (activeRole.permissions || []) : [];

  const hasPermission = (permId) => {
    return rolePermissions.includes(permId);
  };

  const handleRoleChange = (e) => {
    const newRoleId = Number(e.target.value);
    setEditableUser({
      ...editableUser,
      role_id: newRoleId
    });
  };

  // Helper to format codename
  const formatPermissionName = (codename) => {
    const REPLACEMENTS = {
      'customuser': 'User',
      'rolemodulepermission': 'Role Permission',
      'role': 'Role',
      'add': 'Add',
      'change': 'Edit',
      'delete': 'Delete',
      'view': 'View'
    };
    return codename.split('_')
      .map(part => REPLACEMENTS[part] || part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* ==== Header ==== */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editableUser.username}</h2>
            <p className="text-xs text-gray-500">ID: {editableUser.id}</p>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* ==== Tabs ==== */}
        <div className="flex border-b border-gray-100 px-6 pt-2 gap-6">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors relative ${activeTab === idx ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {activeTab === idx && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ==== Content Area (Scrollable) ==== */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

              {/* --- TAB 0: USER INFO --- */}
              {activeTab === 0 && (
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Avatar */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden group">
                      {editableUser.profile_image ? (
                        <img src={editableUser.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <CameraIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Change Photo</span>
                  </div>

                  {/* Right: Inputs */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editableUser.username || ""}
                        onChange={(e) => setEditableUser({ ...editableUser, username: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={editableUser.email || ""}
                        onChange={(e) => setEditableUser({ ...editableUser, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                        <input
                          type="text"
                          value={editableUser.phone_number || ""}
                          onChange={(e) => setEditableUser({ ...editableUser, phone_number: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                        <input
                          type="text"
                          value={editableUser.department || ""}
                          onChange={(e) => setEditableUser({ ...editableUser, department: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 1: ROLES & PERMISSIONS (UPDATED) --- */}
              {activeTab === 1 && (
                <div className="space-y-6">

                  {/* 1. Role Selector */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Assigned Role
                    </label>
                    <div className="relative">
                      <select
                        value={editableUser.role_id}
                        onChange={handleRoleChange}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                      >
                        {categories.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                      <ShieldCheckIcon className="w-3 h-3 text-blue-500" />
                      Role determines access permissions.
                    </p>
                  </div>

                  {/* 2. Permissions Manager */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[300px] shadow-sm">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Effective Permissions</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <LockClosedIcon className="w-3 h-3" /> Inherited from {activeRole?.label}
                        </p>
                      </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {loadingPerms ? (
                        <div className="p-4 text-center text-xs text-gray-500">Loading permissions...</div>
                      ) : (
                        allPermissions.map((perm) => {
                          const active = hasPermission(perm.id);
                          return (
                            <div
                              key={perm.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 opacity-80 cursor-default ${active
                                ? "bg-blue-50/50 border-blue-200 shadow-sm"
                                : "bg-white border-transparent"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Custom Checkbox UI - Read Only */}
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${active ? "bg-blue-600 border-blue-600" : "bg-gray-100 border-gray-300"
                                  }`}>
                                  {active && <ShieldCheckIcon className="w-3.5 h-3.5 text-white" />}
                                </div>

                                <div>
                                  <p className={`text-sm font-semibold ${active ? "text-blue-900" : "text-gray-700"}`}>
                                    {formatPermissionName(perm.codename)}
                                  </p>
                                  <p className="text-[10px] text-gray-500 font-mono">{perm.codename}</p>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                                }`}>
                                {active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ==== Footer ==== */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center sticky bottom-0">
          <button
            onClick={() => handleDeleteUser(editableUser.id)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" /> Delete User
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveUser(editableUser)}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
