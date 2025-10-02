import { useState } from "react";
import {Download} from "lucide-react";


export default function ProjectList() {
  const [projects, setProjects] = useState([
    {
      id: "Pr-1",
      name: "Building Magazine house",
      location: "Jos",
      startDate: "2022-05-15",
      endDate: "2022-05-15",
      budget: "$120,000",
      status: "Completed",
    },
    {
      id: "Pr-2",
      name: "Opening New Site",
      location: "Taraba",
      startDate: "2022-05-15",
      endDate: "2022-05-15",
      budget: "$120,000",
      status: "Active",
    },
    {
      id: "Pr-3",
      name: "Fencing Yard",
      location: "Bauchi",
      startDate: "2022-05-15",
      endDate: "2022-05-15",
      budget: "$120,000",
      status: "Cancelled",
    },
    {
      id: "Pr-4",
      name: "Concrete Mixer",
      location: "Gombe",
      startDate: "2022-05-15",
      endDate: "2022-05-10",
      budget: "$130,000",
      status: "Active",
    },
    {
      id: "Pr-5",
      name: "Building Down tower",
      location: "Kaduna",
      startDate: "2021-05-15",
      endDate: "2022-05-15",
      budget: "$120,000",
      status: "Active",
    },
  ]);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => row[field]).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editingRowId, setEditingRowId] = useState(null);

  const [filters, setFilters] = useState({ 
    status: "", 
    sn: "",
    snMin: "",
    snMax: "", 
    name: "",      
    location: "",  
    budget: "",       
    budgetMin: "",    
    budgetMax: "",  
    startDate: "",
    endDate: ""  
  });

  // Modal states for filters 
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Range states
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

  // 🔹 Status color badges
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500 text-white";
      case "Active":
        return "bg-blue-400 text-black";
      case "Delayed":
      return "bg-yellow-400 text-black";
      case "Cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // 🔹 Export CSV
  const handleExport = () => {
    if (filteredProjects.length === 0) return alert("No projects to export!");
    const csv = convertToCSV(filteredProjects);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "project_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

const filteredProjects = projects.filter((pr) => {
  // --- 🔹 Budget filters ---
  const budgetNum = Number(pr.budget.replace(/[^0-9]/g, "")); // clean numbers only

  const budgetSingle = filters.budget
    ? Number(filters.budget.replace(/[^0-9]/g, ""))
    : null;

  const budgetMin = filters.budgetMin
    ? Number(filters.budgetMin.replace(/[^0-9]/g, ""))
    : null;

  const budgetMax = filters.budgetMax
    ? Number(filters.budgetMax.replace(/[^0-9]/g, ""))
    : null;

  let matchBudget = true;
  if (budgetSingle !== null) {
    matchBudget = budgetNum === budgetSingle; // single cost match
  } else if (budgetMin !== null || budgetMax !== null) {
    const min = budgetMin !== null ? budgetMin : -Infinity;
    const max = budgetMax !== null ? budgetMax : Infinity;
    matchBudget = budgetNum >= min && budgetNum <= max; // range match
  }

  // --- 🔹 Project ID (sn) filters ---
  const snSingle = filters.sn
    ? Number(filters.sn.replace(/\D/g, ""))
    : null;
  const snMin = filters.snMin
    ? Number(filters.snMin.replace(/\D/g, ""))
    : null;
  const snMax = filters.snMax
    ? Number(filters.snMax.replace(/\D/g, ""))
    : null;

  const projectIdNum = Number(pr.id.replace(/\D/g, ""));

  let matchProject = true;
  if (snSingle !== null) {
    matchProject = projectIdNum === snSingle;
  } else if (snMin !== null || snMax !== null) {
    const min = snMin !== null ? snMin : -Infinity;
    const max = snMax !== null ? snMax : Infinity;
    matchProject = projectIdNum >= min && projectIdNum <= max;
  }

  // --- 🔹 Name filter ---
  const matchName = filters.name
    ? pr.name.toLowerCase().includes(filters.name.toLowerCase())
    : true;

  // --- 🔹 Location filter ---
  const matchLocation = filters.location
    ? pr.location.toLowerCase().includes(filters.location.toLowerCase())
    : true;

  // --- 🔹 Status filter ---
  const matchStatus = filters.status ? pr.status === filters.status : true;

  // --- 🔹 Start Date filter ---
  const matchStartDate = filters.startDate
    ? pr.startDate === filters.startDate
    : true;

  // --- 🔹 End Date filter ---
  const matchEndDate = filters.endDate
    ? pr.endDate === filters.endDate
    : true;

  // --- ✅ Combine all ---
  return (
    matchBudget &&
    matchProject &&
    matchName &&
    matchLocation &&
    matchStatus &&
    matchStartDate &&
    matchEndDate
  );
});


const handleAddProject = () => {
  const newPr = {
    id: `TEMP-${Date.now()}`,
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "Planned" // or default
  };
  setProjects([...projects, newPr]);
  setEditingRowId(newPr.id); // auto-edit
};

const handleFieldChange = (id, field, value) => {
  setProjects(projects.map(pr =>
    pr.id === id ? { ...pr, [field]: value } : pr
  ));
};

const handleSaveRow = (id) => {
  setEditingRowId(null); // exit edit mode
};




  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
       {/* Add New Operation */}
        <button
          onClick={handleAddProject}
          className="bg-blue-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Project
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          {/* Export */}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 font-medium">
              <th className="px-2 py-2">
                <button
                  onClick={() => setSnModalOpen(true)}
                  className={`hover:bg-gray-300 w-10 rounded-lg px-1 py-1 ${
                    snModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  S/N
                </button>
              </th>
               <th className="px-1 py-1">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={filters.name}
                  onChange={(e) => {
                    // remove leading/trailing spaces & any characters you don’t want
                    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "").trimStart();
                    setFilters({ ...filters, name: cleanValue });
                  }}
                  className="px-1 py-1 w-auto rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </th>

              <th className="px-1 py-1">
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => {
                    // remove leading/trailing spaces & any characters you don’t want
                    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "").trimStart();
                    setFilters({ ...filters, location: cleanValue });
                  }}
                  className="px-1 py-1 w-24 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </th>

              <th className="px-2 py-2">
                <select
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate: e.target.value,
                    })
                  }
                  className=" border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Start Date</option>
                  {[...new Map(
                    projects.map((pr) => [pr.startDate, pr.startDate])
                  ).entries()].map(([value], idx) => (
                    <option key={idx} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                </th>

              <th className="px-2 py-2">
                <select
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      endDate: e.target.value,
                    })
                  }
                  className="border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">End Date</option>
                  {[...new Map(
                    projects.map((pr) => [pr.endDate, pr.endDate])
                  ).entries()].map(([value], idx) => (
                    <option key={idx} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
 
              <th className="px-1 py-1">
                <button
                  onClick={() => setBudgetModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    budgetModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Budget
                </button>
              </th>
              <th className="px-2 py-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border rounded-lg px-1 py-1 text-xs"
                >
                  <option value="">All Status</option>
                  <option value="On Schedule">On Schedule</option>
                  <option value="Behind Schedule">Behind Schedule</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {projects.map((pr) => (
            <tr key={pr.id} className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              
            {/* ID */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <input
                    value={pr.id}
                    onChange={(e) => handleFieldChange(pr.id, "name", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  pr.id
                )}
              </td>
              
              {/* name */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <input
                    value={pr.name}
                    onChange={(e) => handleFieldChange(pr.id, "name", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  pr.name
                )}
              </td>

              {/* location */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <input
                    value={pr.location}
                    onChange={(e) => handleFieldChange(pr.id, "location", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  pr.location
                )}
              </td>

              {/* startDate */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <input
                    type="date"
                    value={pr.startDate}
                    onChange={(e) =>
                      handleFieldChange(pr.id, "startDate", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  pr.startDate
                )}
              </td>

              {/* endDate */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <input
                    type="date"
                    value={pr.endDate}
                    onChange={(e) =>
                      handleFieldChange(pr.id, "endDate", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  pr.endDate
                )}
              </td>

              {/* budget */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <input
                    type="number"
                    value={pr.budget}
                    onChange={(e) =>
                      handleFieldChange(pr.id, "budget", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  pr.budget
                )}
              </td>

              {/* status */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <select
                    value={pr.status}
                    onChange={(e) =>
                      handleFieldChange(pr.id, "status", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      pr.status
                    )}`}
                  >
                    {pr.status}
                  </span>
                )}
              </td>

              {/* Edit / Save button */}
              <td className="px-2 py-2">
                {editingRowId === pr.id ? (
                  <button
                    onClick={() => handleSaveRow(pr.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingRowId(pr.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Project S/N Modal */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single Project ID */}
              <div>
                <select
                  value={filters.snMin && !filters.snMax ? filters.snMin : ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      snMin: e.target.value,
                      snMax: "", // reset max if single selected
                    });
                    setSnRange({ min: "", max: "" }); // reset range
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Project ID</option>
                  {projects.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-gray-500 text-sm">— OR —</div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={snRange.min}
                    onChange={(e) =>
                      setSnRange({
                        ...snRange,
                        min: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {projects.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={snRange.max}
                    onChange={(e) =>
                      setSnRange({
                        ...snRange,
                        max: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {projects.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setSnModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (snRange.min && snRange.max) {
                    // Range selected
                    setFilters({
                      ...filters,
                      sn: "",
                      snMin: snRange.min,
                      snMax: snRange.max,
                    });
                  } else if (filters.snMin && !filters.snMax) {
                    // Single selected from dropdown
                    setFilters({
                      ...filters,
                      sn: filters.snMin,
                      snMin: "",
                      snMax: "",
                    });
                  } else {
                    // Clear
                    setFilters({
                      ...filters,
                      sn: "",
                      snMin: "",
                      snMax: "",
                    });
                  }
                  setSnModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {budgetModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single Budget */}
              <div>
                <select
                  value={filters.budgetMin && !filters.budgetMax ? filters.budgetMin : ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      budgetMin: e.target.value,
                      budgetMax: "", // reset max if single selected
                    });
                    setBudgetRange({ min: "", max: "" }); // reset range
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Budget</option>
                  {[...new Map(
                    projects.map((pr) => [
                      pr.budget.replace(/[^0-9]/g, ""), // key (number only)
                      pr.budget // value to display
                    ])
                  ).entries()].map(([value, display], idx) => (
                    <option key={idx} value={value}>
                      {display}
                    </option>
                  ))}
                </select>

              </div>

              <div className="text-center text-gray-500 text-sm">— OR —</div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={budgetRange.min}
                    onChange={(e) =>
                      setBudgetRange({
                        ...budgetRange,
                        min: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {[...new Map(
                      projects.map((pr) => [
                        pr.budget.replace(/[^0-9]/g, ""), // key
                        pr.budget // display
                      ])
                    ).entries()].map(([value, display], idx) => (
                      <option key={idx} value={value}>
                        {display}
                      </option>
                    ))}
                  </select>

                </div>
                <div>
                  <select
                    value={budgetRange.max}
                    onChange={(e) =>
                      setBudgetRange({
                        ...budgetRange,
                        max: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {[...new Map(
                      projects.map((pr) => [
                        pr.budget.replace(/[^0-9]/g, ""), // key
                        pr.budget // display
                      ])
                    ).entries()].map(([value, display], idx) => (
                      <option key={idx} value={value}>
                        {display}
                      </option>
                    ))}
                  </select>

                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (budgetRange.min && budgetRange.max) {
                    // Range selected
                    setFilters({
                      ...filters,
                      budget: "",
                      budgetMin: budgetRange.min,
                      budgetMax: budgetRange.max,
                    });
                  } else if (filters.budgetMin && !filters.budgetMax) {
                    // Single budget selected
                    setFilters({
                      ...filters,
                      budget: filters.budgetMin,
                      budgetMin: "",
                      budgetMax: "",
                    });
                  } else {
                    // Nothing selected, clear
                    setFilters({
                      ...filters,
                      budget: "",
                      budgetMin: "",
                      budgetMax: "",
                    });
                  }
                  setBudgetModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
