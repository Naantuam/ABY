// 🔹 RolesAndPermissions.jsx
export default function RolesAndPermissions() {
  const categories = [
    "Safety Officers",
    "Inventory Manager",
    "Project Manager",
    "Accounts Manager",
    "Equipment Manager",
  ];

  const modules = ["Projects", "Equipment", "Users", "Inventory", "Safety", "Production"];
  const accessLevels = ["None", "View", "Edit", "Full"];

  return (
    <div className="roles-permissions p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Roles & Permissions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-2 text-left">User Category</th>
              {modules.map((mod, idx) => (
                <th key={idx} className="border p-2 text-left">{mod}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2 font-medium">{category}</td>
                {modules.map((mod, j) => (
                  <td key={j} className="border p-2">
                    <select className="border rounded px-2 py-1 text-sm w-full focus:ring focus:ring-blue-200">
                      {accessLevels.map((level, i) => (
                        <option key={i} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
