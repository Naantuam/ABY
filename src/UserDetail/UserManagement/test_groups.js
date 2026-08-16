const permissions = [
  { codename: 'add_customuser', id: 1 },
  { codename: 'add_employee', id: 2 },
  { codename: 'add_role', id: 3 },
  { codename: 'view_dashboardaccess', id: 4 },
];

const GROUP_MAPPING = {
  'Customuser': 'User Management',
  'Role': 'Roles',
  'Rolemodulepermission': 'Permission Configuration',
  'Dashboardaccess': 'Dashboard',
};

const groupedPermissions = permissions.reduce((acc, perm) => {
  const parts = perm.codename.split('_');
  const groupRaw = parts.length > 1 ? parts.slice(1).join(' ') : 'Other';
  const groupKey = groupRaw.charAt(0).toUpperCase() + groupRaw.slice(1).replace(/\s/g, '');
  const groupName = GROUP_MAPPING[groupKey] || (groupRaw.charAt(0).toUpperCase() + groupRaw.slice(1));

  if (!acc[groupName]) acc[groupName] = [];
  acc[groupName].push(perm);
  return acc;
}, {});
