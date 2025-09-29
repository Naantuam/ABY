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
            <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-gray-100 border border-blue-300">
              {editingEmployee.picture ? (
                <img
                  src={editingEmployee.picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  Image
                </span>
              )}
            </div>
            {/* <input
              type="file"
              accept="image/*"
              className="mt-3 text-xs"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () =>
                    setEditingEmployee({
                      ...editingEmployee,
                      picture: reader.result,
                    });
                  reader.readAsDataURL(file);
                }
              }}
            /> */}
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
            {/* ID */}
            <div>
              <p className="text-gray-400 text-xs font-sm">ID Number:</p>
              <input
                type="text"
                value={editingEmployee.id || ""}
                readOnly
                className="w-full rounded-lg px-0.5 text-sm text-black"
              />
            </div>

            {/* Name */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Full Name:</p>
              <input
                type="text"
                value={editingEmployee.name || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-lg px-0.5 text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Phone Number:</p>
              <input
                type="text"
                value={editingEmployee.phone || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-lg px-0.5 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Email:</p>
              <input
                type="email"
                value={editingEmployee.email || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-lg px-0.5 text-sm"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Date of Birth:</p>
              <input
                type="date"
                value={editingEmployee.dateOfBirth || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    dateOfBirth: e.target.value,
                  })
                }
                className="w-30 rounded-lg px-05 text-sm"
              />
            </div>

            {/* Blood Group */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Blood Group:</p>
              <input
                type="text"
                value={editingEmployee.bloodGroup || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    bloodGroup: e.target.value,
                  })
                }
                className="w-full rounded-lg px-0.5 text-sm"
              />
            </div>

            {/* Department */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Department:</p>
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
                className= "w-full rounded-lg px-0.5 text-sm"  
              />
            </div>

            {/* Rank */}
            <div>
              <p className="text-gray-400 text-xs font-sm">Rank:</p>
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
                className= "w-full rounded-lg px-0.5 text-sm"              />
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
