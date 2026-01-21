import { useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../api";

export default function InventoryCard() {
  const navigate = useNavigate();
  // Static stats for now as per StatInfo.jsx
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    restocking: 0,
    lowStock: 0
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get("/inventory/summary/");
      // Assuming response.data has keys matching what we need or we map them
      // If backend returns { total_items, in_stock, restocking, low_stock }
      // I need to know the backend structure or guess it. 
      // Based on previous task context, user provided: 
      // GET /api/inventory/summary/ -> inventory summary (totals, low stock, critical items)
      // I'll assume snake_case mapping similar to items.
      const data = response.data;
      setStats({
        total: data.total_items || data.total || 0,
        inStock: data.in_stock || data.inStock || 0,
        restocking: data.restocking || 0,
        lowStock: data.low_stock || data.lowStock || 0
      });
    } catch (err) {
      console.error("Failed to fetch inventory summary:", err);
    }
  };

  return (
    <div className="w-full bg-gray-50 flex justify-center items-center py-3">
      <div
        onClick={() => navigate('/admin/inventory')}
        className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between w-[96%] cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <Boxes className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Status tags */}
        <div className="grid grid-cols-3 mt-4 gap-2">
          <div className="flex flex-col items-center gap-1 text-green-700 px-1 py-1 text-sm font-semibold">
            <span>{stats.inStock}</span>
            <span className="bg-green-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">In Stock</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-yellow-600 px-1 py-1 text-sm font-semibold">
            <span>{stats.restocking}</span>
            <span className="bg-yellow-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Restocking</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-red-700 px-1 py-1 text-sm font-semibold">
            <span>{stats.lowStock}</span>
            <span className="bg-red-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Low Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}