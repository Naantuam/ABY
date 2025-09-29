import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md">
      {children}
    </div>
  );
};

export default AuthCard; 

// bg-gradient-to-b from-sky-300 to-blue-600