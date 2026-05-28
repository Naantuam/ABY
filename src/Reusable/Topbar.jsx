import React, { useState, useEffect, useRef } from "react";
import {
  EnvelopeIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { UserCircle, LogOut, Send, Loader2 } from 'lucide-react';
import api from "../api"

export default function TopBar({ sidebarOpen = true, setSidebarOpen = () => { }, user = null, roles = [], loadingAuth = true }) {

  const userRoleId = typeof user?.role === 'object' ? user?.role?.id : user?.role;
  const roleObject = roles.find(r => r.id === userRoleId);
  // Give priority to superuser label
  const isAdmin = (user?.superuser || user?.is_superuser || (roleObject && roleObject.name?.toLowerCase().includes('admin')));
  const roleLabel = (user?.superuser || user?.is_superuser) ? "Admin"
    : (roleObject ? (roleObject.label ?? roleObject.name) : (user?.role || "Unknown Role"));

  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAnnouncementsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAnnouncements = async () => {
    setLoadingMsg(true);
    try {
      const res = await api.get('/users/announcements/');
      // res.data could be array or paginated object, handle array for now
      setAnnouncements(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setLoadingMsg(false);
    }
  };

  useEffect(() => {
    if (announcementsOpen) {
      fetchAnnouncements();
    }
  }, [announcementsOpen]);

  const handleSendAnnouncement = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post('/users/announcements/', { message: newMessage });
      setNewMessage("");
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to send announcement", err);
      alert("Failed to send announcement.");
    }
  };

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

          {/* Notification / Announcement Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAnnouncementsOpen(!announcementsOpen)}
              className="relative text-gray-500 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-gray-50"
            >
              <EnvelopeIcon className="h-6 w-6" />
            </button>

            {/* Announcement Dropdown */}
            {announcementsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col max-h-[80vh] overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800">Announcements</h3>
                </div>

                {/* Admin Input Area */}
                {isAdmin && (
                  <div className="p-3 border-b border-gray-100 bg-white flex gap-2">
                    <textarea
                      className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                      rows={2}
                      placeholder="Type a new announcement..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    ></textarea>
                    <button
                      onClick={handleSendAnnouncement}
                      className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition flex items-center justify-center self-end"
                      title="Send"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-2 bg-white min-h-[150px] max-h-[300px]">
                  {loadingMsg ? (
                    <div className="flex justify-center items-center h-full text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm mt-8">No announcements yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {announcements.map(ann => (
                        <div key={ann.id} className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{ann.created_by_name}</span>
                            <span className="text-[10px] text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ann.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {announcements.length > 0 && (
                  <div className="border-t border-gray-100 p-2 text-center bg-gray-50">
                    <button className="text-xs text-blue-600 font-bold hover:underline">View All</button>
                  </div>
                )}
              </div>
            )}
          </div>

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