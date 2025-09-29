import React from "react";

export default function AuthButton({ label,children, ...props }) {
  return (
    <button
      className="w-full h-12 bg-sky-200 hover:bg-blue-800 text-white text-lg font-bold font-mono flex items-center justify-center rounded-lg transition-colors"
      {...props}
    >
      {label || children}
    </button>
  );
}
