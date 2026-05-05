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
      if (user.superuser || user.is_superuser) return children;

      const userRole = roles?.find(r => r.id === user?.role?.id);
      const userPermIds = userRole?.permissions || [];

      // Build a flat list of all permissions across all apps
      const allPerms = Object.values(appPermissions).flat();

      let hasAccess = false;

      if (app === 'admin_only') {
        // Dashboard: check for specific view_dashboardaccess permission
        const dashPerm = allPerms.find(p => p.codename === 'view_dashboardaccess');
        if (dashPerm) {
          hasAccess = userPermIds.includes(dashPerm.id);
        }
      } else {
        const modulePerms = appPermissions?.[app] || [];
        const viewPerm = modulePerms.find(p => p.codename && p.codename.includes('view'));
        if (viewPerm) {
          hasAccess = userPermIds.includes(viewPerm.id);
        } else {
          hasAccess = modulePerms.some(perm => userPermIds.includes(perm.id));
        }
      }

      // Role-name fallbacks (in case permissions not yet explicitly configured)
      const roleName = user.role?.name?.toLowerCase() || '';
      if (!hasAccess) {
        if ((roleName.includes('admin') || roleName.includes('project')) && (app === 'users' || app === 'projects' || app === 'admin_only')) hasAccess = true;
        if (roleName.includes('safety') && app === 'safety') hasAccess = true;
        if (roleName.includes('inventory') && app === 'inventory') hasAccess = true;
        if ((roleName.includes('production') || roleName.includes('financial') || roleName.includes('finance')) && app === 'production') hasAccess = true;
        if (roleName.includes('equipment') && app === 'equipment') hasAccess = true;
      }

      if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
      }
  }

  // Otherwise, render the protected page
  return children;
};

export default ProtectedRoute;
