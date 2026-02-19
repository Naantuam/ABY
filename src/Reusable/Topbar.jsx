import React, { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { UserCircle } from 'lucide-react';
import api from "../api"

export default function TopBar({ sidebarOpen = true, setSidebarOpen = () => { } }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define hardcoded roles mapping for frontend display
  const ROLE_MAP = {
    0: "Project Manager",
    1: "Safety Officer",
    2: "Inventory Manager",
    3: "Production Manager",
    4: "Equipment Manager"
  };

  // Find the full role object by matching the ID
  const roleObject = roles.find(r => r.id === currentUser?.role);
  const roleLabel = ROLE_MAP[currentUser?.role] || (roleObject ? roleObject.label : (currentUser?.role || "Unknown Role"));

  // Fetch current user data and all roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both user and roles in parallel
        const [userResponse, rolesResponse] = await Promise.all([
          api.get('/users/me/'),
          api.get('/users/roles/')
        ]);

        // Set user data
        setCurrentUser(userResponse.data);

        // Set roles data (handles paginated or simple array)
        const rolesData = rolesResponse.data;
        const rolesList = Array.isArray(rolesData) ? rolesData : rolesData.results || [];
        setRoles(rolesList);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <header className="w-full bg-white shadow-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Left section (Bars button) */}
        <div className="flex items-center">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md bg-transparent text-gray-600 hover:text-black transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Right section (Icons & User Info) */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative text-gray-500 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-gray-50">
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            <EnvelopeIcon className="h-6 w-6" />
          </button>

          {/* User Info & Icon */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="hidden md:flex flex-col items-end">
              {loading ? (
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-1"></div>
              ) : (
                <span className="text-sm font-bold text-gray-800 leading-none">{currentUser?.email || "User"}</span>
              )}

              {loading ? (
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
              ) : (
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                  {roleLabel}
                </span>
              )}
            </div>

            <div className="relative group cursor-default">
              <div className="text-gray-400 bg-gray-50 rounded-full p-1 border border-gray-100 group-hover:border-blue-200 group-hover:text-blue-500 transition-all">
                {currentUser?.picture ? (
                  <img src={currentUser.picture} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-9 w-9" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}