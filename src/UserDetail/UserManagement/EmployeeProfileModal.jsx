import React from "react";
import { X, Camera } from "lucide-react";

export default function UserProfileModal({
  selectedEmployee,
  editingEmployee,
  setEditingEmployee,
  handleSaveModal,
  setSelectedEmployee,
}) {
  if (!selectedEmployee || !editingEmployee) return null;

  const handleChange = (field, value) => {
    setEditingEmployee({ ...editingEmployee, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-500 font-mono">ID: {editingEmployee.id}</p>
          </div>
          <button
            onClick={() => setSelectedEmployee(null)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row gap-6">

            {/* Left Column: Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                {editingEmployee.picture ? (
                  <img
                    src={editingEmployee.picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-300">
                    {editingEmployee.name?.charAt(0) || "U"}
                  </span>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Change Photo</span>
            </div>

            {/* Right Column: Form Fields */}
            <div className="flex-1 space-y-4">

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingEmployee.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full text-sm border-b border-gray-300 py-1 focus:border-blue-500 focus:outline-none transition-colors bg-transparent placeholder-gray-300"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingEmployee.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full text-sm border-b border-gray-300 py-1 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editingEmployee.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full text-sm border-b border-gray-300 py-1 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rank</label>
                  <select
                    value={editingEmployee.rank || ""}
                    onChange={(e) => handleChange("rank", e.target.value)}
                    className="w-full text-sm border-b border-gray-300 py-1 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                  >
                    <option value="">Select Rank</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    value={editingEmployee.amount || ""}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="w-full text-sm border-b border-gray-300 py-1 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => { setSelectedEmployee(null); setEditingEmployee(null); }}
            className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSaveModal(editingEmployee)}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}