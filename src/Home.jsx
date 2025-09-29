
import { useState } from "react";
import Dashboard from './Pages/Dashboard/Dashboard';
import Sidebar from './Reusable/NavBar';
import TopBar from './Reusable/Topbar';

export default function Home(params) {
      const [sidebarOpen, setSidebarOpen] = useState(true); // state to toggle

    return (
        <>
        <div className="flex flex-col h-screen font-mono">
        <TopBar />

        <div className="flex flex-1 relative bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}
        >
          <Dashboard />
        </main>
        </div>
        </div>
        </>
    )
}