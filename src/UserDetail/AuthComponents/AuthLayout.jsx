import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      
      {/* BACKGROUND LAYER (Visible on ALL screens now) */}
      <div 
        className="
          fixed inset-0 
          z-0 
          bg-[url('/assets/photo_2025-10-01_22-35-45.jpg')] 
          bg-cover bg-center bg-no-repeat
        "
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex items-center justify-center min-h-screen w-full">
         {children}
      </div>

    </div>
  );
};

export default AuthLayout;