import { Users } from "lucide-react";

export default function UsersCard() {
  return (
    <div className="w-full bg-gray-50 flex justify-center items-center py-3">
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between w-[96%]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
        </div>
        <div className="bg-blue-100 p-2 rounded-full">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* Status tags */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 mt-4">
        <div className="flex flex-col items-center text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          <span>4</span>
          <span className="bg-green-100 rounded-2xl p-0.5">Active</span>
        </div>
        <div className="flex flex-col items-center text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
          <span>1</span>
          <span className="bg-red-100 rounded-2xl p-0.5">Inactive</span>
        </div>
        <div className="flex flex-col items-center text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
          <span>35</span>
          <span className="bg-gray-100 rounded-2xl p-0.5">Employees</span>
        </div>
      </div>
    </div>
    </div>
  );
}
