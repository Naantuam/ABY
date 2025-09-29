import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-blue-800 p-4">
      {children}
    </div>
  );
};

export default AuthLayout;
