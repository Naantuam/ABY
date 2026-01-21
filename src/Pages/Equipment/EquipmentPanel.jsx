import { useState } from "react";
import {
  BriefcaseIcon
  // UsersIcon,
  // ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import EquipmentList from "./EquipmentList";


export default function EquipmentPanel() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Equipment List", icon: BriefcaseIcon, component: <EquipmentList /> },
    // { name: "Register Equipment", icon: UsersIcon, component: <Employees /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">

      {/* 📌 Sticky Tabs Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:flex md:justify-around md:gap-8 px-2 md:px-6">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`
                  relative flex flex-col md:flex-row items-center justify-center md:justify-start 
                  gap-1 md:gap-2 py-3 px-1 
                  text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wide transition-all
                  ${activeTab === i
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === i ? "text-blue-600" : "text-gray-400"}`} />
                <span>{tab.name}</span>

                {activeTab === i && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full mx-2 md:mx-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔄 Sliding Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-6 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          >
            {tabs[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
