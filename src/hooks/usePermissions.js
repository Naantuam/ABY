import { useOutletContext } from "react-router-dom";

export function usePermissions(appName) {
    const context = useOutletContext();
    
    // Fallback if not rendered inside Layout's Outlet (e.g. testing or standalone components)
    if (!context) return { canAdd: true, canEdit: true, canDelete: true, canView: true, isSuperuser: true };

    const { user, roles, appPermissions } = context;
    
    // Strict fallback if user is not loaded
    if (!user) return { canAdd: false, canEdit: false, canDelete: false, canView: false, isSuperuser: false };
    
    const userRole = roles?.find(r => r.id === user?.role);
    const isAdmin = userRole?.name?.toLowerCase().includes('admin');

    // Superuser or Admin overrides everything
    if (user.superuser || user.is_superuser || isAdmin) return { canAdd: true, canEdit: true, canDelete: true, canView: true, isSuperuser: true };

    const userPermIds = userRole?.permissions || [];
    const modulePerms = appPermissions?.[appName] || [];

    // Helper to check if the user's role array includes the ID of the requested action's permission
    const hasPermission = (action) => {
        // Find permission directly associated with action
        const targetPerm = modulePerms.find(p => p.codename && p.codename.includes(`${action}_`));
        if (targetPerm) {
            return userPermIds.includes(targetPerm.id);
        }
        
        // If checking for 'view' and specific view perm doesn't exist, generic fallback:
        // Do they have ANY permission for this app?
        if (action === 'view' && modulePerms.length > 0) {
            return modulePerms.some(perm => userPermIds.includes(perm.id));
        }
        
        return false;
    };

    return {
        canAdd: hasPermission('add'),
        canEdit: hasPermission('change'),
        canDelete: hasPermission('delete'),
        canView: hasPermission('view'),
        isSuperuser: (user.superuser || user.is_superuser)
    };
}
