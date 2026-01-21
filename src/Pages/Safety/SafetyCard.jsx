import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api from "../../api";

export default function SafetyCard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    resolved: 0,
    investigating: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/safety/safety-incidents/stats/");
        const data = response.data;

        setStats({
          total: data.total_incidents || 0,
          recent: data.recent_incidents || 0,
          resolved: data.resolved_incidents || 0,
          investigating: data.investigating_incidents || 0,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch safety stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="w-full bg-gray-50 flex justify-center items-center py-3">
      <div
        onClick={() => navigate('/admin/safety')}
        className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between w-[96%] cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Safety Incidents</h3>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.loading ? "..." : stats.total}
            </p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Status tags */}
        <div className="grid grid-cols-3 mt-4 gap-2">
          <div className="flex flex-col items-center gap-1 text-blue-600 px-1 py-1 text-sm font-semibold">
            <span>{stats.loading ? "-" : stats.recent}</span>
            <span className="bg-blue-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Recent</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-green-700 px-1 py-1 text-sm font-semibold">
            <span>{stats.loading ? "-" : stats.resolved}</span>
            <span className="bg-green-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Resolved</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-yellow-600 px-1 py-1 text-sm font-semibold">
            <span>{stats.loading ? "-" : stats.investigating}</span>
            <span className="bg-yellow-100 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Investigation</span>
          </div>
        </div>
      </div>
    </div>
  );
}