import {
  EnvelopeIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
// import logo from "/assets/ABY.png";

export default function TopBar({
  sidebarOpen = true,
  setSidebarOpen = () => {},
}) {
  return (
    <header className="w-full bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left section (Bars button) */}
      <div className="flex items-center">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md bg-transparent text-black"
          >
            {/* <div className="flex flex-col items-center h-8 justify-center">
              <img src={logo} alt="Logo" className="w-20 mb-1" />
            </div> */}
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Right section (Search + Icons) */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Notification Bell */}
        <button className="relative text-gray-600 hover:text-black">
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
          <EnvelopeIcon className="h-6 w-6" />
        </button>

        {/* User Icon */}
        <button className="text-gray-600 hover:text-black">
          <UserCircleIcon className="h-7 w-7" />
        </button>
      </div>
    </header>
  );
}
