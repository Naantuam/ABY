import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({ id, type = "text", placeholder, value, onChange, Icon }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Determine if this field is a password type
  const isPassword = type === "password";
  // Toggle between "password" and "text" for visibility
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="relative flex items-center w-full">
        {/* Left-side icon */}
        {Icon && (
          <div className="absolute left-3 text-gray-500 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        {/* Input field */}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full p-2 sm:p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            Icon ? "pl-10 sm:pl-10" : ""
          } ${isPassword ? "pr-10" : ""}`} // extra space for the eye icon
        />

        {/* Right-side eye toggle (only for password fields) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
