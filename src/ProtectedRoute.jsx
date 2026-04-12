import React from "react";
import { Navigate, useOutletContext } from "react-router-dom";

const ProtectedRoute = ({ children, app }) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const context = useOutletContext();
  
  // If no context yet (e.g. Layout is still fetching), we just render children 
  // or return null/loading. To prevent flicker, Layout handles loading state globally.
  if (context && app) {
      const { user, roles, appPermissions, loadingAuth } = context;
      
      // Wait for authentication checks to finish before deciding to kick the user out
      if (loadingAuth) {
          return (
              <div className="flex justify-center items-center h-full min-h-[50vh]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
          );
      }
      
      if (!user) return <Navigate to="/" replace />;
      if (user.is_superuser) return children;

      const userRole = roles?.find(r => r.id === user?.role);
      const userPermIds = userRole?.permissions || [];
      
      const modulePerms = appPermissions?.[app] || [];
      // Do they have ANY permission for this app? Or explicitly 'view'?
      const viewPerm = modulePerms.find(p => p.codename && p.codename.includes('view'));
      let hasAccess = false;
      
      if (viewPerm) {
          hasAccess = userPermIds.includes(viewPerm.id);
      } else {
          // Fallback if no specific view permission: do they have ANY permission in this module?
          hasAccess = modulePerms.some(perm => userPermIds.includes(perm.id));
      }

      // Explicit hardcoded fallbacks just like the Sidebar has 
      // (in case backend doesn't explicitly link "admin_only" modules yet)
      const roleId = Number(user.role);
      if (!hasAccess) {
        if (roleId === 0 && (app === 'users' || app === 'projects' || app === 'admin_only')) hasAccess = true;
        if (roleId === 1 && app === 'safety') hasAccess = true;
        if (roleId === 2 && app === 'inventory') hasAccess = true;
        if (roleId === 3 && app === 'production') hasAccess = true;
        if (roleId === 4 && app === 'equipment') hasAccess = true;
      }

      if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
      }
  }

  // Otherwise, render the protected page
  return children;
};

export default ProtectedRoute;
