import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";

const MfaSelector = ({ onSelect }) => {
  const [active, setActive] = useState(null);

  const handleSelect = (method) => {
    setActive(method);
    onSelect(method);
  };

  const baseStyle =
    "flex items-center justify-center gap-2 py-3 px-6 rounded-lg border cursor-pointer transition";
  const activeStyle = "bg-blue-500 text-white border-blue-600";
  const inactiveStyle = "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200";

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => handleSelect("email")}
        className={`${baseStyle} ${active === "email" ? activeStyle : inactiveStyle}`}
      >
        <Mail size={18} /> Email
      </button>
      <button
        onClick={() => handleSelect("sms")}
        className={`${baseStyle} ${active === "sms" ? activeStyle : inactiveStyle}`}
      >
        <Phone size={18} /> SMS
      </button>
    </div>
  );
};

export default MfaSelector;
