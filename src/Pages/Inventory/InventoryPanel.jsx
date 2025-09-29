import { useState } from "react";
import {
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import InventoryList from "./InventoryList";


export default function InventoryPanel() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Inventory List", icon: ArchiveBoxIcon, component: <InventoryList /> },
    // { name: "Register Inventory", icon: UsersIcon, component: <Employees /> },
  ];

  return (
    <div className="p-6 bg-gray-50">
      {/* Tabs */}
      <div className="flex justify-around border-b pb-2 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg transition ${
              activeTab === i
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sliding Content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {tabs[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
