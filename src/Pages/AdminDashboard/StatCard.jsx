

const colors = {
  green: 'bg-green-100 text-green-900',
  red: 'bg-red-100 text-red-900',
  yellow: 'bg-yellow-100 text-yellow-900',
  blue: 'bg-blue-100 text-blue-900',
};

export default function StatCard({ title, count, icon: Icon, badges }) {
  return (
    <div className="bg-white p-2 rounded-lg shadow-md w-full flex flex-col justify-between h-full">
      {/* Top section */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <h2 className="text-2xl font-bold text-gray-900">{count}</h2>
        </div>
        <Icon className="h-6 w-6 text-blue-500" />
      </div>

      <div className="flex-grow" />

      {/* Badges at the bottom */}
      <div className="w-full flex flex-wrap justify-between mt-3 gap-1">
        {badges.map((b, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center min-w-[50px]"
          >
            {/* Number above — plain */}
            <span className="text-xs font-bold text-gray-900">{b.number}</span>

            {/* Label below — with background color */}
            <span
              className={`text-[9px] font-medium px-1 py-0.5 rounded-full ${colors[b.color]}`}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
