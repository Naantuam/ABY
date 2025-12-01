import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="
      /* Mobile Base Styles */
      bg-black/50 backdrop-blur-xl border border-white/20 shadow-xl 
      p-5 md:w-full sm:w-[80%] w-full  overflow-y-auto h-full sm:h-[90%] max-h-full
      
      /* Desktop/Medium Adjustments */
      md:bg-white/10 
      sm:rounded-2xl 
      md:min-h-fit 
      
      md:max-w-md
    ">
      {children}
    </div>
  );
};

export default AuthCard;
// bg-gradient-to-b from-sky-300 to-blue-600