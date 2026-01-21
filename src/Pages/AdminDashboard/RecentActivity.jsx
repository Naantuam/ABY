import React from "react";
import { 
  UsersIcon, 
  BriefcaseIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon, 
  ArchiveBoxIcon, 
  ChartBarSquareIcon,
  ClockIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

// 1️⃣ CONFIGURATION: Map Types to Icons & Colors
// Based on your specific navigation array
const CATEGORY_CONFIG = {
  user: {
    icon: UsersIcon,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100"
  },
  equipment: {
    icon: BriefcaseIcon,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100"
  },
  project: {
    icon: WrenchScrewdriverIcon,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100"
  },
  safety: {
    icon: ShieldCheckIcon,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100"
  },
  inventory: {
    icon: ArchiveBoxIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100"
  },
  production: {
    icon: ChartBarSquareIcon,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100"
  },
};

// 2️⃣ MOCK DATA (Ideally comes from API)
const activities = [
  {
    id: 1,
    type: "project",
    title: "New Project Created",
    description: 'Project "Down Tower" has been initialized.',
    time: "10 min ago",
    user: "Vincent A."
  },
  {
    id: 2,
    type: "safety",
    title: "Safety Incident Reported",
    description: 'Hazard reported at "Riverside Site". Severity: Medium.',
    time: "25 min ago",
    user: "System"
  },
  {
    id: 3,
    type: "equipment",
    title: "Maintenance Completed",
    description: 'Excavator #EX-205 is now back in service.',
    time: "1 hour ago",
    user: "Maint. Team"
  },
  {
    id: 4,
    type: "inventory",
    title: "Low Stock Alert",
    description: "Cement supply below threshold (15 bags left).",
    time: "2 hours ago",
    user: "System"
  },
  {
    id: 5,
    type: "user",
    title: "New User Registration",
    description: "Sarah J. joined as Safety Officer.",
    time: "4 hours ago",
    user: "Admin"
  },
  {
    id: 6,
    type: "production",
    title: "Daily Report Submitted",
    description: "Site A production metrics submitted for review.",
    time: "5 hours ago",
    user: "Site Manager"
  },
];

export default function RecentActivity() {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 py-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-7xl mx-auto h-[400px] flex flex-col"> 
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Recent Activity</h3>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-full text-black hover:text-blue-700 transition-colors">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Activity List - Scrollable */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar p-0">
          {activities.map((activity, index) => {
            const config = CATEGORY_CONFIG[activity.type] || CATEGORY_CONFIG.project;
            const Icon = config.icon;

            return (
              <div 
                key={activity.id}
                className="group flex items-start gap-4 px-6 py-4 hover:bg-gray-50 border hover:border-blue-700 transition-colors border-b border-gray-50 last:border-0 cursor-pointer relative"
              >
                {/* Visual Connector Line (Timeline Effect) */}
                {index !== activities.length - 1 && (
                  <span className="absolute left-[35px] top-10 bottom-0 w-px bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                )}

                {/* Icon Container */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} border ${config.border}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-900 truncate pr-2">
                      {activity.title}
                    </p>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      {activity.time}
                    </span>
                  </div>
                  
                  <p className="text-xs font-semibold text-gray-700 mt-0.5 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  <p className="text-[10px] text-black mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors"></span>
                    by {activity.user}
                  </p>
                </div>

                {/* Hover Action Arrow */}
                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
                  <ChevronRightIcon className="h-4 w-4 text-blue-700" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer (Optional) */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl text-center">
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            View All History
          </button>
        </div>

      </div>
    </div>
  );
}