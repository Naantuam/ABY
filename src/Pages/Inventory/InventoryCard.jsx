import { Boxes } from "lucide-react";

export default function InventoryCard() {
  return (
    <div className="w-full bg-gray-50 flex justify-center items-center py-3">
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between w-[96%]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
        </div>
        <div className="bg-blue-100 p-2 rounded-full">
          <Boxes className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* Status tags */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 mt-4">
        <div className="flex flex-col items-center gap-1 text-green-700 px-3 py-1 text-sm font-semibold">
          <span>4</span>
          <span className="bg-green-100 rounded-full">In Stock</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-yellow-600 px-3 py-1 text-sm font-semibold">
          <span>35</span>
          <span className="bg-yellow-100 rounded-full">Restocking</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-red-700 px-3 py-1 text-sm font-semibold">
          <span>35</span>
          <span className="bg-red-100 rounded-full">Low Stock</span>
        </div>
      </div>
    </div>
    </div>
  );
}