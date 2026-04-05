import { useOutletContext } from "react-router-dom";

export function usePermissions(appName) {
    const context = useOutletContext();
    
    // Fallback if not rendered inside Layout's Outlet (e.g. testing or standalone components)
    if (!context) return { canAdd: true, canEdit: true, canDelete: true, isSuperuser: true };

    const { user, roles, appPermissions } = context;
    
    // Strict fallback if user is not loaded
    if (!user) return { canAdd: false, canEdit: false, canDelete: false, isSuperuser: false };
    
    // Superuser overrides everything
    if (user.is_superuser) return { canAdd: true, canEdit: true, canDelete: true, isSuperuser: true };

    const userRole = roles?.find(r => r.id === user?.role);
    const userPermIds = userRole?.permissions || [];
    const modulePerms = appPermissions?.[appName] || [];

    // Helper to check if the user's role array includes the ID of the requested action's permission
    const hasPermission = (action) => {
        const targetPerm = modulePerms.find(p => p.codename && p.codename.includes(`${action}_`));
        return targetPerm ? userPermIds.includes(targetPerm.id) : false;
    };

    return {
        canAdd: hasPermission('add'),
        canEdit: hasPermission('change'),
        canDelete: hasPermission('delete'),
        isSuperuser: user.is_superuser
    };
}
