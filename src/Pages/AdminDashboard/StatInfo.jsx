import React, { useState, useEffect } from "react";
import api from "../../api"; 
import StatCard from "./StatCard";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  FolderIcon, 
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

  // 3. STATE FOR PROJECT STATS
  const [projectStats, setProjectStats] = useState({
    total: 0, active: 0, completed: 0, delayed: 0, cancelled: 0, archived: 0, loading: true,
  });

  // 4. NEW STATE FOR SAFETY STATS
  const [safetyStats, setSafetyStats] = useState({
    total: 0, recent: 0, resolved: 0, investigating: 0, loading: true,
  });

  // --- EFFECT FOR USER STATS ---
  useEffect(() => {
    async function fetchUserStats() {
      try {
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
        const response = await api.get("/api/equipment/stats/"); 
        const data = response.data; 
        
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

  // --- EFFECT FOR PROJECT STATS ---
  useEffect(() => {
    async function fetchProjectStats() {
      try {
        const response = await api.get("/api/projects/stats/");
        const data = response.data; 
        
        setProjectStats({
          total: data.total_projects,
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

  // --- NEW EFFECT FOR SAFETY STATS ---
  useEffect(() => {
    async function fetchSafetyStats() {
      try {
        const response = await api.get("/api/safety/safety-incidents/stats/"); 
        const data = response.data; 
        
        setSafetyStats({
          total: data.total_incidents,
          recent: data.recent_incidents,
          resolved: data.resolved_incidents,
          investigating: data.investigating_incidents,
          loading: false,
        });
      } catch (error) {
        console.error("❌ Failed to fetch safety stats via API:", error.message);
        setSafetyStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchSafetyStats();
  }, []);

  // Optional: Display a loading message if ANY are loading
  if (userStats.loading || equipmentStats.loading || projectStats.loading || safetyStats.loading) {
    return <div className="text-center p-8">Loading dashboard statistics...</div>;
  }

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

        {/* Projects Card */}
        <StatCard
          title="Projects"
          count={projectStats.total}
          icon={FolderIcon}
          href="/admin/projects"
          badges={[
            { label: "Completed", color: "green", number: projectStats.completed },
            { label: "Active", color: "blue", number: projectStats.active },
            { label: "Delayed", color: "yellow", number: projectStats.delayed }, 
            { label: "Cancelled", color: "red", number: projectStats.cancelled }, 
          ]}
        />

        {/* Safety Incidents Card (Dynamic Data) */}
        <StatCard
          title="Safety Incidents"
          count={safetyStats.total}
          icon={ShieldExclamationIcon}
          href="/admin/safety"
          badges={[
            { label: "Recent", color: "blue", number: safetyStats.recent },
            { label: "Resolved", color: "green", number: safetyStats.resolved },
            { label: "Investigation", color: "yellow", number: safetyStats.investigating },
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