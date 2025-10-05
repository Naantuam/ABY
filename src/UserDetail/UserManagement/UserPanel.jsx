import { useState } from "react";
import {
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import UserCategories from "./UserCategories";
import Employees from "./Employees";
import RolesAndPermissions from "./RolesAndPermissions";

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "User Categories", icon: UserIcon, component: <UserCategories /> },
    { name: "Employees", icon: UsersIcon, component: <Employees /> },
    {
      name: "Roles & Permission",
      icon: ShieldCheckIcon,
      component: <RolesAndPermissions />,
    },
  ];

  return (
    <div className="p-2 bg-gray-50">
      {/* Tabs */}
      <div className="flex justify-around border-b pb-2 mb-4 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center text-sm md:text-base gap-1.5 px-2 py-2 rounded-t-lg transition ${
              activeTab === i
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <tab.icon className="h-4 w-4" />
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
