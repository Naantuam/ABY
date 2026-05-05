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

    const userRole = roles?.find(r => r.id === user?.role?.id);
    const userPermIds = userRole?.permissions || [];

    // Build flat permissions list
    const allPerms = Object.values(appPermissions || {}).flat();

    // Find the view_<modelName> permission
    const codename = `view_${modelName.toLowerCase()}`;
    const perm = allPerms.find(p => p.codename === codename);

    // If that permission doesn't exist in the system yet → fail-open
    if (!perm) return true;

    return userPermIds.includes(perm.id);
}
