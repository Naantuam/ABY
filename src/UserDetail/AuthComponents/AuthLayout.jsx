import React from "react";

const AuthLayout = ({ children }) => {
  return (
    // 1. Outermost Layer: Your original gradient color (acts as a base or fallback)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-blue-800">
      
      {/* 2. Second Layer (The Fixed Overlay)
        - It's now the fixed container holding the background image.
        - We remove 'bg-black/30' from here so the image is visible.
        - The 'bg-[url(...)]' classes apply the image.
      */}
      <div 
        // 1. HIDDEN by default (less than md)
        className="hidden 
                  // 2. FLEX from md breakpoint and up
                  md:flex 
                  // All other original classes
                  fixed inset-0 bg-[url('src/assets/photo_2025-10-01_22-35-45.jpg')] bg-cover bg-center 
                  backdrop-blur-sm items-center justify-center z-50 
                  mx-5 sm:mx-20 my-20 sm:my-10 py-8 rounded-3xl"
      >
        {/* 3. Inner Overlay for Darkness (This creates the black/30 effect on top of the image)
          - This layer ensures the image is visible but darkens it for contrast.
        */}
        <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>
        
        {/* The children (AuthCard and its content) must be on top of the dark overlay, so they need z-index */}
        <div className="z-10 flex items-center justify-center w-full h-full">
            {children}
        </div>
      </div>
      <div className="md:hidden flex items-center justify-center w-full h-full z-10">
          {children}
      </div>
    </div>
  );
};
export default AuthLayout;
