import StatCard from "./StatCard";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  FolderIcon,
  ShieldExclamationIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";

export default function StatInfo() {
  return (
    <div className="w-full flex justify-center items-center bg-gray-50">
      <div className="w-[93%] md:w-[96%] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Users"
          count={40} // total = 4 + 1 + 35
          icon={UserGroupIcon}
          badges={[
            { label: "Active", color: "green", number: 4 },
            { label: "Inactive", color: "red", number: 1 },
            { label: "Employees", color: "blue", number: 35 },
          ]}
        />

        <StatCard
          title="Equipments"
          count={16} // total = 10 + 3 + 2 + 1
          icon={Cog6ToothIcon}
          badges={[
            { label: "Available", color: "green", number: 10 },
            { label: "Active", color: "blue", number: 3 },
            { label: "Repair", color: "yellow", number: 2 },
            { label: "Retired", color: "red", number: 1 },
          ]}
        />

        <StatCard
          title="Projects"
          count={15} // total = 5 + 6 + 4
          icon={FolderIcon}
          badges={[
            { label: "Completed", color: "green", number: 5 },
            { label: "Active", color: "blue", number: 6 },
            { label: "Delayed", color: "yellow", number: 6 },
            { label: "Cancelled", color: "red", number: 4 },
          ]}
        />

        <StatCard
          title="Safety Incidents"
          count={9} // total = 3 + 4 + 2
          icon={ShieldExclamationIcon}
          badges={[
            { label: "Recent", color: "blue", number: 3 },
            { label: "Resolved", color: "green", number: 4 },
            { label: "Investigation", color: "yellow", number: 2 },
          ]}
        />

        <StatCard
          title="Inventory"
          count={14} // total = 8 + 2 + 4
          icon={ArchiveBoxIcon}
          badges={[
            { label: "In Stock", color: "green", number: 8 },
            { label: "Restocking", color: "yellow", number: 2 },
            { label: "Low stock", color: "red", number: 4 },
          ]}
        />
      </div>
    </div>
  );
}
