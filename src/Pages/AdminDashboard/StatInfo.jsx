import React, { useState, useEffect } from "react";
import api from "../../api"; 
import StatCard from "./StatCard";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  FolderIcon, // Used for Projects
  ShieldExclamationIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";

export default function StatInfo() {
  // 1. STATE FOR USER STATS
  const [userStats, setUserStats] = useState({
    total: 0, active: 0, inactive: 0, employee: 0, loading: true,
  });
  
  // 2. STATE FOR EQUIPMENT STATS
  const [equipmentStats, setEquipmentStats] = useState({
    total: 0, available: 0, active: 0, repair: 0, retired: 0, loading: true,
  });

  // 3. NEW STATE FOR PROJECT STATS
  const [projectStats, setProjectStats] = useState({
    total: 0, active: 0, completed: 0, delayed: 0, cancelled: 0, archived: 0, loading: true,
  });

  // --- EFFECT FOR USER STATS ---
  useEffect(() => {
    async function fetchUserStats() {
      try {
        // CORRECTED PATH: api.get("/api/users/stats/")
        const response = await api.get("/api/users/stats/"); 
        const data = response.data; 

        setUserStats({
          total: data.total_users,
          active: data.active_users,
          inactive: data.inactive_users,
          employee: data.employees,
          loading: false,
        });
      } catch (error) {
        console.error("❌ Failed to fetch user stats via API:", error.message);
        setUserStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchUserStats();
  }, []);
  
  // --- EFFECT FOR EQUIPMENT STATS ---
  useEffect(() => {
    async function fetchEquipmentStats() {
      try {
        // CORRECTED PATH: api.get("/api/equipment/stats/")
        const response = await api.get("/api/equipment/stats/"); 
        const data = response.data; 
        
        // Calculate the total (assuming total_equipment means available/in-stock)
        const total = data.total_equipment + data.active_equipment + data.repair_equipment + data.retired_equipment;

        setEquipmentStats({
          total: total,
          available: data.total_equipment,
          active: data.active_equipment,
          repair: data.repair_equipment,
          retired: data.retired_equipment,
          loading: false,
        });
      } catch (error) {
        console.error("❌ Failed to fetch equipment stats via API:", error.message);
        setEquipmentStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchEquipmentStats();
  }, []);

  // --- NEW EFFECT FOR PROJECT STATS ---
  useEffect(() => {
    async function fetchProjectStats() {
      try {
        const response = await api.get("/api/projects/stats/"); // 👈 New Endpoint
        const data = response.data; 
        
        // Calculate total projects from all reported statuses
        const total = data.total_projects; // Use the direct total provided by the API

        setProjectStats({
          total: total,
          active: data.active_projects,
          completed: data.completed_projects,
          delayed: data.delayed_projects,
          cancelled: data.cancelled_projects,
          archived: data.archived_projects,
          loading: false,
        });
      } catch (error) {
        console.error("❌ Failed to fetch project stats via API:", error.message);
        setProjectStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchProjectStats();
  }, []);

  // Optional: Display a loading message
  if (userStats.loading || equipmentStats.loading || projectStats.loading) {
    return <div className="text-center p-8">Loading dashboard statistics...</div>;
  }

  // 3. Render the StatCard using the fetched data
  return (
    <div className="w-full flex justify-center items-center bg-gray-50">
      <div className="w-[93%] md:w-[96%] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* User Stats Card */}
        <StatCard
          title="Users"
          count={userStats.total} 
          icon={UserGroupIcon}
          href="/admin/users"
          badges={[
            { label: "Active", color: "green", number: userStats.active }, 
            { label: "Inactive", color: "red", number: userStats.inactive }, 
            { label: "Employees", color: "blue", number: userStats.employee }, 
          ]}
        />

        {/* Equipment Stats Card */}
        <StatCard
          title="Equipments"
          count={equipmentStats.total}
          icon={Cog6ToothIcon}
          href="/admin/equipments"
          badges={[
            { label: "Available", color: "green", number: equipmentStats.available },
            { label: "Active", color: "blue", number: equipmentStats.active },
            { label: "Repair", color: "yellow", number: equipmentStats.repair },
            { label: "Retired", color: "red", number: equipmentStats.retired },
          ]}
        />

        {/* PROJECTS CARD (Uses newly fetched data) */}
        <StatCard
          title="Projects"
          count={projectStats.total} // 👈 Dynamic Total
          icon={FolderIcon}
          href="/admin/projects"
          badges={[
            { label: "Completed", color: "green", number: projectStats.completed },
            { label: "Active", color: "blue", number: projectStats.active },
            // Note: Your static data had 'Delayed' and 'Cancelled' mixed up
            { label: "Delayed", color: "yellow", number: projectStats.delayed }, 
            { label: "Cancelled", color: "red", number: projectStats.cancelled }, 
            // Optional: You could add 'Archived' here if desired.
          ]}
        />

        {/* Safety Incidents (Still static) */}
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

        {/* Inventory (Still static) */}
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