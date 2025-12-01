import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="
      min-h-screen flex items-center justify-center 
      bg-gradient-to-b sm:from-sky-400 sm:to-blue-800 from-blue-700 to-blue-950
    ">

      {/* IMAGE LAYER 
         - hidden on mobile
         - md:flex ensures it APPEARS on medium screens and above
      */}
      <div 
        className="
          hidden 
          md:flex 
          fixed inset-0 
          /* Make sure this path is correct! */
          bg-[url('/assets/photo_2025-10-01_22-35-45.jpg')] 
          bg-contain bg-center 
          items-center justify-center z-50 
          mx-5 sm:mx-20 my-20 sm:my-10 py-8 rounded-3xl
        "
      >
        {/* Dark overlay to make text readable over the image */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl"></div>
        
        {/* Card Container */}
        <div className="z-10 flex items-center justify-center w-full h-full">
            {children}
        </div>
      </div>

      {/* MOBILE LAYER (No Image, just gradient) */}
     <div className="
        md:hidden 
        w-full 
        h-screen         /* Set height explicitly to 100vh */
        z-10 pt-4 
        flex items-start justify-center /* Use items-start to place card at top */
        overflow-y-auto  /* Ensures the entire mobile page can scroll if necessary */
      ">
          {children}
      </div>
    </div>
  );
};

export default AuthLayout;
