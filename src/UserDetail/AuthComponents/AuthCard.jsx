import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="bg-black/50 md:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-5 w-full max-w-md">
      {children}
    </div>
  );
};

export default AuthCard; 

// bg-gradient-to-b from-sky-300 to-blue-600