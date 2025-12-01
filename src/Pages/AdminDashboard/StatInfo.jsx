import StatCard from "./StatCard";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  FolderIcon,
  ShieldExclamationIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react"; 
import api from "../../api"

export default function StatInfo() {
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    employee: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchUserStats() {
      try {
        // 2. Use api.get() instead of fetch()
        // The baseURL (e.g., your Render domain) is handled by the api instance.
        const response = await api.get("/api/users/stats/"); 
        
        // Axios automatically parses the JSON, so we access data directly
        const data = response.data; 

        // Check the data structure to see what was returned
        console.log("Fetched User Data:", data);

        setUserStats({
          total: data.total_users,
          active: data.active_users,
          inactive: data.inactive_users,
          employee: data.employees,
          loading: false,
        });
      } catch (error) {
        // Axios errors are usually logged in your response interceptor, 
        // but catch here for state management.
        console.error("❌ Failed to fetch user stats via API:", error.message);
        setUserStats(prev => ({ ...prev, loading: false }));
        
        // Optional: Add logic to display user-friendly error message if needed
      }
    }
    
    fetchUserStats();
  }, []);
  // Empty dependency array means this runs only once on mount

  // Optional: Display a loading message
  if (userStats.loading) {
    return <div className="text-center p-8">Loading user statistics...</div>;
  }

  // 3. Render the StatCard using the fetched data
  return (
    <div className="w-full flex justify-center items-center bg-gray-50">
      <div className="w-[93%] md:w-[96%] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* User Stats Card: Uses API Data */}
        <StatCard
          title="Users"
          count={userStats.total} // 👈 Dynamic total count
          icon={UserGroupIcon}
          href="/admin/users"
          badges={[
            { label: "Active", color: "green", number: userStats.active }, // 👈 Dynamic active count
            { label: "Inactive", color: "red", number: userStats.inactive }, // 👈 Dynamic inactive count
            { label: "Employees", color: "blue", number: userStats.employee }, // 👈 Dynamic employee count
          ]}
        />

        <StatCard
          title="Equipments"
          count={16} // total = 10 + 3 + 2 + 1
          icon={Cog6ToothIcon}
          href="/admin/equipments"
          badges={[
            { label: "Available", color: "green", number: 10 },
            { label: "Active", color: "blue", number: 3 },
            { label: "Repair", color: "yellow", number: 2 },
            { label: "Retired", color: "red", number: 1 },
          ]}
        />

        <StatCard
          title="Projects"
          count={15} // total = 5 + 6 + 4
          icon={FolderIcon}
          href="/admin/projects"
          badges={[
            { label: "Completed", color: "green", number: 5 },
            { label: "Active", color: "blue", number: 6 },
            { label: "Delayed", color: "yellow", number: 6 },
            { label: "Cancelled", color: "red", number: 4 },
          ]}
        />

        <StatCard
          title="Safety Incidents"
            count={9}
          icon={ShieldExclamationIcon}
            href="/admin/safety"
          badges={[
            { label: "Recent", color: "blue", number: 3 },
            { label: "Resolved", color: "green", number: 4 },
            { label: "Investigation", color: "yellow", number: 2 },
          ]}
        />

        <StatCard
          title="Inventory"
            count={14}
          icon={ArchiveBoxIcon}
            href="/admin/inventory"
          badges={[
            { label: "In Stock", color: "green", number: 8 },
            { label: "Restocking", color: "yellow", number: 2 },
            { label: "Low stock", color: "red", number: 4 },
          ]}
        />
      </div>
    </div>
  );
}
