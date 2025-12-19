import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="
      /* Mobile: Full Screen Overlay */
      w-full 
      h-[100dvh] /* dynamic viewport height for mobile browsers */
      flex flex-col 
      bg-black/60 /* Slightly darker on mobile for better text contrast */
      backdrop-blur-md
      p-6
      
      /* Desktop: Centered Card */
      md:h-auto 
      md:min-h-fit 
      md:w-full 
      md:max-w-md 
      md:rounded-3xl 
      md:bg-white/10 
      md:border md:border-white/20 
      md:shadow-2xl
      md:p-8
    ">
      {children}
    </div>
  );
};

export default AuthCard;
// bg-gradient-to-b from-sky-300 to-blue-600