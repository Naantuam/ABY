import React from 'react';
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const colors = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  red: 'bg-rose-50 text-rose-700 border-rose-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
};

export default function StatCard({ title, count, icon: Icon, badges, href }) {
  return (
    <a
      href={href}
      className="group relative flex flex-col justify-between w-full h-full bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-blue-600 transition-colors">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">
              {count}
            </h2>
            {/* Mobile-only Arrow (Visual cue) */}
            <ArrowRightIcon className="w-3 h-3 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
          </div>
        </div>
        
        <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-50 my-2" />

      {/* Badges Grid - Compact */}
      <div className="grid grid-cols-2 gap-2">
        {badges.map((b, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-50/50 rounded px-2 py-1 group-hover:bg-white transition-colors"
          >
            <span className="text-[10px] font-medium text-gray-500">{b.label}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${colors[b.color] || 'bg-gray-100 text-gray-600'}`}
            >
              {b.number}
            </span>
          </div>
        ))}
      </div>
    </a>
  );
}