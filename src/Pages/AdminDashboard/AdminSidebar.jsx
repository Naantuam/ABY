import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  UsersIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  ChartBarSquareIcon,
  Squares2X2Icon
} from '@heroicons/react/24/solid'
import logo from "../../assets/ABY.png";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/Admin', icon: Squares2X2Icon },
    { name: 'User Management', href: '/Admin/users', icon: UsersIcon },
    { name: 'Equipment Management', href: '/Admin/equipment', icon: BriefcaseIcon },
    { name: 'Project Management', href: '/Admin/project', icon: WrenchScrewdriverIcon },
    { name: 'Safety Management', href: '/Admin/safety', icon: ShieldCheckIcon },
    { name: 'Inventory Management', href: '/Admin/inventory', icon: ArchiveBoxIcon },
    { name: 'Production', href: '/Admin/production', icon: ChartBarSquareIcon },
  ];

  return (
    <div className="flex relative font-sans h-screen">
      <div
        className={`fixed top-0 left-0 h-screen w-55 bg-white px-2 transform transition-transform duration-300 ease-in-out shadow-md z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with logo */}
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-30 w-30 object-contain"
          />
        </div>

        {/* Navigation links */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  isActive
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:text-blue-700",
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-colors"
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? "text-white" : "text-blue-700",
                    "h-5 w-5"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}


