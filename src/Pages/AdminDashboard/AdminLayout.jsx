import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import TopBar from "../../Reusable/Topbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen font-mono flex flex-col relative">
      {/* Fixed TopBar */}
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden transition-all duration-300 ease-in-out relative">
        
        {/* MOBILE OVERLAY (Backdrop)
            - Visible only on mobile (md:hidden)
            - Visible only when sidebar is OPEN
            - Click to close sidebar
        */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar 
            - We wrap it in a div to ensure it sits above the backdrop (z-30) 
            - On desktop, z-index resets (md:z-auto) 
        */}
        <div className="">
            <AdminSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            />
        </div>

        {/* Main Content 
            - Removed direct 'ml-55' on mobile.
            - Added 'md:ml-55': This ensures the "push" only happens on Desktop.
            - On Mobile, it stays 'ml-0' so the content remains full width behind the sidebar.
        */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-x-auto ${
            sidebarOpen ? "md:ml-55" : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}