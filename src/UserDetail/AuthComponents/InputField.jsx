import React from 'react';
// Import other necessary icons here as you add them

// Add a 'Icon' prop (capitalized because it's a component)
const InputField = ({ id, type = "text", placeholder, value, onChange, Icon }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      {/* Container to hold the icon and the input */}
      <div className="relative flex items-center w-full">
        {/* Render the Icon component if it's provided */}
        {Icon && (
          <div className="absolute left-3 text-gray-500 pointer-events-none">
            {/* The size prop ensures consistent icon size */}
            <Icon size={20} />
          </div>
        )}
        
        {/* The input field */}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          // Conditionally adjust padding based on whether an Icon is present
          className={`w-full p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${Icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
};

export default InputField;