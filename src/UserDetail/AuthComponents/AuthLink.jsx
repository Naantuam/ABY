import React from "react";
import { Link } from "react-router-dom";

const AuthLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-sm text-white hover:text-blue-400 hover:underline"
    >
      {children}
    </Link>
  );
};

export default AuthLink;
