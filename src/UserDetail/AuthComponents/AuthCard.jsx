import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="bg-black/50 md:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl 
     p-5 w-full max-w-md min-h-[70vh] max-h-[90vh] overflow-y-auto md:min-h-fit">
      {children}
    </div>
  );
};

export default AuthCard; 

// bg-gradient-to-b from-sky-300 to-blue-600