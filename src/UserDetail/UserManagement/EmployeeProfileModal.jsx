import React from "react";

export default function UserProfileModal({
  selectedEmployee,
  editingEmployee,
  setEditingEmployee,
  handleSaveModal,
  setSelectedEmployee,
//   isAdmin,
}) {
  if (!selectedEmployee || !editingEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="items-center md:items-start">
            {/* Profile Picture Box */}
            <div className="relative w-40 h-40 rounded-lg bg-slate-100 flex items-center justify-center mb-4 border">
              {editingEmployee.picture ? (
                <img
                  src={editingEmployee.picture}
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
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
            {/* ID */}
            <div>
              <p className="text-gray-700 text-xs font-sm">ID Number:</p>
              <input
                type="text"
                value={editingEmployee.id || ""}
                readOnly
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Name */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Full Name:</p>
              <input
                type="text"
                value={editingEmployee.name || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    name: e.target.value,
                  })
                }
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Phone */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Phone Number:</p>
              <input
                type="text"
                value={editingEmployee.phone || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    phone: e.target.value,
                  })
                }
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Email:</p>
              <input
                type="email"
                value={editingEmployee.email || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    email: e.target.value,
                  })
                }
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Date of Birth:</p>
              <input
                type="date"
                value={editingEmployee.dateOfBirth || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    dateOfBirth: e.target.value,
                  })
                }
                className="w-35 text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Blood Group */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Blood Group:</p>
              <input
                type="text"
                value={editingEmployee.bloodGroup || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    bloodGroup: e.target.value,
                  })
                }
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Department */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Department:</p>
              <input
                type="text"
                value={editingEmployee.department || ""}
                onChange={(e) =>
                  isAdmin &&
                  setEditingEmployee({
                    ...editingEmployee,
                    department: e.target.value,
                  })
                }
                // readOnly={!isAdmin}
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Rank */}
            <div>
              <p className="text-gray-700 text-xs font-sm">Rank:</p>
              <input
                type="text"
                value={editingEmployee.rank || ""}
                onChange={(e) =>
                //   isAdmin &&
                  setEditingEmployee({
                    ...editingEmployee,
                    rank: e.target.value,
                  })
                }
                // readOnly={!isAdmin}
                className="w-full text-sm rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => handleSaveModal(editingEmployee)}
                className="px-2 py-2 rounded-lg border border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition-colors"
              >
                Save Profile
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setEditingEmployee(null);
                }}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
