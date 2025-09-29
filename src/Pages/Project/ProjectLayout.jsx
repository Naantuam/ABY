import { useState } from "react";
import ProjectDashboard from "./ProjectDashboard";
// import ProjectSidebar from "./ProjectSidebar";
import TopBar from "../../Reusable/Topbar";

export default function ProjectLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen font-mono flex flex-col relative">
      {/* Fixed TopBar, receives sidebar state */}
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* This parent div now prevents itself from overflowing */}
      <div className="flex flex-1 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Sidebar */}
        {/* <ProjectSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        /> */}

        {/* Main content shifts AND is now scrollable on its own */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-x-auto ${ // THE FIX IS HERE
            sidebarOpen ? "ml-60" : "ml-0"
          }`}
        >
          {/* Now, if Dashboard is too wide, only this main area will scroll */}
          <ProjectDashboard />
        </main>
      </div>
    </div>
  );
}