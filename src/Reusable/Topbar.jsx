import React from "react";
import {
  EnvelopeIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { UserCircle, LogOut } from 'lucide-react';

export default function TopBar({ sidebarOpen = true, setSidebarOpen = () => { }, user = null, roles = [], loadingAuth = true }) {

  const roleObject = roles.find(r => r.id === user?.role);
  // Give priority to superuser label
  const roleLabel = (user?.superuser || user?.is_superuser) ? "Admin" 
                    : (roleObject ? (roleObject.label ?? roleObject.name) : (user?.role || "Unknown Role"));

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
            <div className="flex flex-col items-end">
              {loadingAuth ? (
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-1"></div>
              ) : (
                <span className="text-sm font-bold text-gray-800 leading-none">{user?.username || user?.email || "User"}</span>
              )}

              {loadingAuth ? (
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
              ) : (
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                  {roleLabel}
                </span>
              )}
            </div>

            <div className="relative group cursor-pointer">
              <div className="text-gray-400 bg-gray-50 rounded-full p-1 border border-gray-100 group-hover:border-blue-200 group-hover:text-blue-500 transition-all">
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-9 w-9" />
                )}
              </div>

              {/* Logout Dropdown */}
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/";
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}