/**
 * useTabPermissions
 *
 * Returns true if the current user has the `view_<modelName>` permission,
 * or is a superuser, or if no matching permission exists in the system
 * (fail-open so brand-new installations don't lock everyone out).
 *
 * Usage:
 *   const canViewOperation = useTabPermission('operationrecord');
 */
import { useOutletContext } from "react-router-dom";

export function useTabPermission(modelName) {
    const context = useOutletContext();

    // No layout context (e.g. in tests) → allow everything
    if (!context) return true;

    const { user, roles, appPermissions } = context;

    // No user loaded yet → deny (prevents flicker then allow)
    if (!user) return false;

    // Superuser always has access
    if (user.is_superuser || user.superuser) return true;

    const userRoleId = typeof user?.role === 'object' ? user?.role?.id : user?.role;
    const userRole = roles?.find(r => r.id === userRoleId);
    const userPermIds = userRole?.permissions || [];

    // Build flat permissions list
    const allPerms = Object.values(appPermissions || {}).flat();

    // Find all permissions matching the model name (e.g. view_operationrecord, add_operationrecord, etc.)
    const modelPerms = allPerms.filter(p => p.codename && p.codename.includes(`_${modelName.toLowerCase()}`));

    // If those permissions don't exist in the system yet → fail-open
    if (modelPerms.length === 0) return true;

    return modelPerms.some(p => userPermIds.includes(p.id));
}
