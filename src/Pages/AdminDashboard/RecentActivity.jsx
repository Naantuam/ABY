import { Users, Wrench, ShieldAlert } from "lucide-react";

export default function RecentActivity() {
  // Example activity data
  const activities = [
    {
      id: 1,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      text: `New Project "down tower" created`,
      time: "10 minutes ago",
    },
    {
      id: 2,
      icon: <ShieldAlert className="h-5 w-5 text-green-600" />,
      text: `Safety incident reported at "Riverside Site"`,
      time: "10 minutes ago",
    },
    {
      id: 3,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      text: `New Project "down tower" created`,
      time: "10 minutes ago",
    },
    {
      id: 4,
      icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
      text: `Safety incident reported at "Riverside Site"`,
      time: "10 minutes ago",
    },
    {
      id: 5,
      icon: <Wrench className="h-5 w-5 text-cyan-600" />,
      text: `Excavator #EX-205 maintenance completed`,
      time: "10 minutes ago",
    },
  ];

  return (
    <div className="bg-gray-50 w-full flex justify-center items-center">
    <div className="bg-white rounded-2xl shadow-md w-[93%] md:w-[96%] p-4"> 
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black">Recent Activity</h3>
        <div className="bg-blue-100 p-2 rounded-full">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* Activity List with Scroll */}
      <div className="max-h-64 overflow-y-auto pr-2">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 py-2">
              {/* Icon */}
              <div className="mt-1">{activity.icon}</div>
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>

            {/* Divider (skip after last item) */}
            {index < activities.length - 1 && (
              <hr className="border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
