import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import api from "../../api";

export default function UsersCard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    employee: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/users/stats/");
        const data = response.data;

        setStats({
          total: data.total_users || 0,
          active: data.active_users || 0,
          inactive: data.inactive_users || 0,
          employee: data.employees || 0,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="w-full bg-gray-50 flex justify-center items-center py-3">
      <div
        onClick={() => navigate('/admin/users')}
        className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between w-[96%] cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Users</h3>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.loading ? "..." : stats.total}
            </p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Status tags */}
        <div className="grid grid-cols-3 mt-4 gap-2">
          <div className="flex flex-col items-center gap-1 text-green-700 px-1 py-1 text-sm font-semibold">
            <span>{stats.loading ? "-" : stats.active}</span>
            <span className="bg-green-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-red-600 px-1 py-1 text-sm font-semibold">
            <span>{stats.loading ? "-" : stats.inactive}</span>
            <span className="bg-red-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Inactive</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-700 px-1 py-1 text-sm font-semibold">
            <span>{stats.loading ? "-" : stats.employee}</span>
            <span className="bg-gray-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Employees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
