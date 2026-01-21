import { useState, useEffect } from "react";
import {
  Briefcase, Truck, Users, Archive, ShieldCheck,
  Factory, Save, RotateCcw, Loader2, CheckCircle, XCircle
} from "lucide-react";
import api from "../../api";

export default function RolesAndPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editedRolePermissions, setEditedRolePermissions] = useState([]); // IDs of permissions for selected role
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ────────────────────────────────
  // 1️⃣ Fetch Data
  // ────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Define the apps we need permissions for
        const apps = ['users', 'projects', 'equipment', 'inventory', 'safety', 'production'];

        // Fetch roles and all app permissions in parallel
        const [rolesRes, ...permsResList] = await Promise.all([
          api.get("/users/roles/"),
          ...apps.map(app => api.get(`/users/permissions/${app}/`).catch(e => ({ data: [] }))) // Catch specific app errors
        ]);

        const rolesDataRaw = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data.results || []);
        const rolesData = rolesDataRaw.map(r => ({
          ...r,
          id: r.key ?? r.id,
          name: r.label ?? r.name,
          permissions: r.permissions || []
        }));

        // Flatten all permission arrays
        const permsData = permsResList.flatMap(res =>
          Array.isArray(res.data) ? res.data : (res.data.results || [])
        );

        setRoles(rolesData);
        setPermissions(permsData);

        // Select first role by default
        if (rolesData.length > 0) {
          setSelectedRoleId(rolesData[0].id);
          setEditedRolePermissions(rolesData[0].permissions || []);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
        alert("Failed to load roles and permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Sync state when switching roles
  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    const role = roles.find(r => r.id === roleId);
    setEditedRolePermissions(role ? (role.permissions || []) : []);
  };

  // ────────────────────────────────
  // 2️⃣ Logic
  // ────────────────────────────────

  const handleTogglePermission = (permId) => {
    setEditedRolePermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(id => id !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const role = roles.find(r => r.id === selectedRoleId);

      const payload = {
        name: role.name, // Keep existing name
        permissions: editedRolePermissions
      };

      // PUT /api/users/roles/<id>/update/
      await api.put(`/users/roles/${selectedRoleId}/update/`, payload);

      // Update local state to reflect saved changes as "current"
      setRoles(prev => prev.map(r =>
        r.id === selectedRoleId ? { ...r, permissions: editedRolePermissions } : r
      ));

      alert("Role updated successfully.");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const role = roles.find(r => r.id === selectedRoleId);
    if (role) {
      setEditedRolePermissions(role.permissions || []);
    }
  };

  // Group Permissions by 'content_type' or 'app_label' inferred from codename or provided field
  // Assuming structure has 'codename', 'name', 'id'
  // We'll try to guess groupings or just list them all. 
  // Better: Extract the first word of codename or use a known list if available.
  // Actually, standard Django permissions usually have `content_type` ID. 
  // We'll group by a simple heuristic if 'app_label' isn't explicitly there.

  const GROUP_MAPPING = {
    'Customuser': 'User Management',
    'Role': 'Roles',
    'Rolemodulepermission': 'Permission Configuration',
    'Project': 'Projects',
    'Equipment': 'Equipment',
    'Inventory': 'Inventory',
    'Safety': 'Safety',
    'Production': 'Production',
    'Maintenance': 'Maintenance',
    'Operation': 'Operations'
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    // Try to find a group name. E.g. "auth | user" or just "user" from "add_user"
    // Heuristic: Use the last word of codename (usually the model)
    const parts = perm.codename.split('_');
    const groupRaw = parts.length > 1 ? parts.slice(1).join(' ') : 'Other';
    // capitalize
    const groupKey = groupRaw.charAt(0).toUpperCase() + groupRaw.slice(1).replace(/\s/g, '');

    // Use mapping or fallback to capitalized raw string
    const groupName = GROUP_MAPPING[groupKey] || (groupRaw.charAt(0).toUpperCase() + groupRaw.slice(1));

    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(perm);
    return acc;
  }, {});


  // Helper to format codename to clean name
  const formatPermissionName = (codename) => {
    // Map of specific keyword replacements
    const REPLACEMENTS = {
      'customuser': 'User',
      'rolemodulepermission': 'Role Permission',
      'role': 'Role',
      'add': 'Add',
      'change': 'Edit',
      'delete': 'Delete',
      'view': 'View'
    };

    return codename.split('_')
      .map(part => REPLACEMENTS[part] || part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full h-full flex flex-col md:flex-row">

      {/* 👈 SIDEBAR: ROLES LIST */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Roles</h3>
          <p className="text-xs text-gray-500">Select a role to edit</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRoleId === role.id
                ? "bg-white shadow-sm text-blue-600 border border-gray-200"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      {/* 👉 MAIN: PERMISSIONS MATRIX */}
      <div className="flex-1 flex flex-col min-h-[400px]">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Editing: <span className="text-blue-600">{roles.find(r => r.id === selectedRoleId)?.name}</span>
            </h2>
            <p className="text-xs text-gray-500">
              {editedRolePermissions.length} permissions enabled
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </button>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

            {Object.keys(groupedPermissions).sort().map(group => (
              <div key={group} className="break-inside-avoid bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-200 pb-2 capitalize">
                  {group}
                </h4>
                <div className="space-y-2">
                  {groupedPermissions[group].map(perm => {
                    const isChecked = editedRolePermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? "bg-white shadow-sm border border-blue-100" : "hover:bg-gray-200/50"
                          }`}
                      >
                        <div className="relative flex items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="peer h-4 w-4 appearance-none rounded border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                          <CheckCircle className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${isChecked ? "text-gray-900" : "text-gray-600"}`}>
                            {formatPermissionName(perm.codename)}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{perm.codename}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}