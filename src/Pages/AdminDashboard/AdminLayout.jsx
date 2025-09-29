import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import TopBar from "../../Reusable/Topbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen font-mono flex flex-col relative">
      {/* Fixed TopBar, receives sidebar state */}
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* This parent div now prevents itself from overflowing */}
      <div className="flex flex-1 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Sidebar */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main content shifts AND is now scrollable on its own */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-x-auto ${ // THE FIX IS HERE
            sidebarOpen ? "ml-55" : "ml-0"
          }`}
        >
          {/* Now, if Dashboard is too wide, only this main area will scroll */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

