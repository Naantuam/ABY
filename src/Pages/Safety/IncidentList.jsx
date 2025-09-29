import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function IncidentList() {
  const [Incidents, setIncidents] = useState([
    {
      id: "INC-001",
      date: "2025-09-15",
      project: "Downtown Tower",
      description: "Minor fall from height",
      severity: "Low",
      status: "Reported",
    },
    {
      id: "INC-002",
      date: "2025-09-14",
      project: "Riverside Apartment",
      description: "Power outage on site",
      severity: "Medium",
      status: "Resolving",
    },
    {
      id: "INC-003",
      date: "2025-09-13",
      project: "Greenfield Shopping",
      description: "Equipment malfunction",
      severity: "High",
      status: "Resolved",
    },
    {
      id: "INC-004",
      date: "2025-09-10",
      project: "Hillside Residential",
      description: "Near-miss with excavation equipment",
      severity: "Low",
      status: "Reported",
    },
    {
      id: "INC-005",
      date: "2025-09-08",
      project: "Downtown Tower",
      description: "Small fire in a storage unit",
      severity: "Medium",
      status: "Resolving",
    },
  ]);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => row[field]).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({
    id: "",
    idMin: "",
    idMax: "",
    dateMin: "",
    dateMax: "",
    date: "",
    project: "",
    severity: "",
    status: "",
  });

  // For modals
  const [idModalOpen, setIdModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // For ranges
  const [idRange, setIdRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Inside IncidentList component, right after state declarations:
  const isEditingExisting = editing && Incidents.find(it => it.id === editing.id);


  // 🔹 Status color badges
  const getStatusColor = (status) => {
    switch (status) {
      case "Reported":
        return "bg-red-500 text-white";
      case "Resolving":
        return "bg-blue-400 text-white";
      case "Resolved":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // 🔹 Export CSV
  const handleExport = () => {
    if (filteredIncidents.length === 0) return alert("No Incidents to export!");
    const csv = convertToCSV(filteredIncidents);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Incident_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredIncidents = Incidents.filter((incident) => {
  // ✅ ID filter
  const matchID =
    filters.idMin && filters.idMax
      ? Number(incident.id) >= Number(filters.idMin) &&
        Number(incident.id) <= Number(filters.idMax)
      : filters.idMin && !filters.idMax
      ? Number(incident.id) === Number(filters.idMin)
      : true;

  // ✅ Date filter
  const matchDate =
    filters.dateMin && filters.dateMax
      ? incident.date >= filters.dateMin && incident.date <= filters.dateMax
      : filters.dateMin && !filters.dateMax
      ? incident.date === filters.dateMin
      : true;

  // ✅ Other filters…
  const matchProject = filters.project
    ? incident.project.toLowerCase().includes(filters.project.toLowerCase())
    : true;
  const matchSeverity = filters.severity ? incident.severity === filters.severity : true;
  const matchStatus = filters.status ? incident.status === filters.status : true;

  return matchID && matchDate && matchProject && matchSeverity && matchStatus;
});


  // 🔹 Add new Incident
  const handleAdd = () => {
    const newIncident = {
      id: `INC-${Incidents.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      project: "",
      description: "",
      severity: "Low",
      status: "Reported",
    };
    setEditing(newIncident);
  };

  // 🔹 Save edited or new Incident
  const handleSave = () => {
    if (Incidents.find((incident) => incident.id === editing.id)) {
      setIncidents((prev) =>
        prev.map((incident) => (incident.id === editing.id ? editing : incident))
      );
    } else {
      setIncidents((prev) => [...prev, editing]);
    }
    setEditing(null);
  };

  useEffect(() => {
  if (!editing || !isEditingExisting) return;

  // If any of these fields changed, update the date automatically
  if (
    editing.description !== isEditingExisting.description ||
    editing.severity !== isEditingExisting.severity ||
    editing.status !== isEditingExisting.status
  ) {
    setEditing(prev => ({
      ...prev,
      date: new Date().toISOString().slice(0, 10)
    }));
  }
}, [
  editing?.description,
  editing?.severity,
  editing?.status
]);
return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {/* Add New Incident */}
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Incident
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 font-medium">
             <th className="px-2 py-2">
                  <button
                    onClick={() => setIdModalOpen(true)}
                    className={`hover:bg-gray-300 w-10 rounded-lg px-1 py-1 ${
                      idModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                  >
                    ID
                  </button>
                </th>

                <th className="px-2 py-2">
                  <button
                    onClick={() => setDateModalOpen(true)}
                    className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                      dateModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                  >
                      Date
                  </button>
                </th>          
                <th className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Project"
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                  className="px-1 py-1 w-auto rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </th>
              <th className="px-2 py-2">Description</th>
              <th className="px-2 py-2">
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="border rounded-lg px-1 py-1 text-xs"
                >
                  <option value="">Severity</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </th>
              <th className="px-2 py-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border rounded-lg px-1 py-1 text-xs"
                >
                  <option value="">Status</option>
                  <option value="Reported">Reported</option>
                  <option value="Resolving">Resolving</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((incident) => (
              <tr
                key={incident.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-2 py-2">{incident.id}</td>
                <td className="px-2 py-2">{incident.date}</td>
                <td className="px-2 py-2">{incident.project}</td>
                <td className="px-2 py-2">{incident.description}</td>
                <td className="px-2 py-2">{incident.severity}</td>
                <td className="px-2 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      incident.status
                    )}`}
                  >
                    {incident.status}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => setEditing(incident)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ID Modal */}
      {idModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single ID */}
              <div>
                <select
                  value={filters.idMin && !filters.idMax ? filters.idMin : ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      idMin: e.target.value,
                      idMax: "",
                    });
                    setIdRange({ min: "", max: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select ID</option>
                  {Incidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-gray-500 text-sm">— OR —</div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={idRange.min}
                    onChange={(e) => setIdRange({ ...idRange, min: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {Incidents.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={idRange.max}
                    onChange={(e) => setIdRange({ ...idRange, max: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {Incidents.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setIdModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (idRange.min && idRange.max) {
                    setFilters({ ...filters, idMin: idRange.min, idMax: idRange.max });
                  } else if (filters.idMin && !filters.idMax) {
                    setFilters({ ...filters, idMin: filters.idMin, idMax: "" });
                  } else {
                    setFilters({ ...filters, idMin: "", idMax: "" });
                  }
                  setIdModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Date Modal */}
    {dateModalOpen && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
          <div className="space-y-3">
            {/* Single Date */}
            <div>
              <select
                value={filters.dateMin && !filters.dateMax ? filters.dateMin : ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    dateMin: e.target.value,
                    dateMax: "",
                  });
                  setDateRange({ start: "", end: "" });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select Date</option>
                {Array.from(new Set(Incidents.map((incident) => incident.date))).map(
                  (date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm">— OR —</div>

            {/* Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Start</option>
                  {Array.from(new Set(Incidents.map((incident) => incident.date))).map(
                    (date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <select
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">End</option>
                  {Array.from(new Set(Incidents.map((incident) => incident.date))).map(
                    (date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button
              onClick={() => setDateModalOpen(false)}
              className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (dateRange.start && dateRange.end) {
                  // ✅ Range selected
                  setFilters({
                    ...filters,
                    dateMin: dateRange.start,
                    dateMax: dateRange.end,
                  });
                } else if (filters.dateMin && !filters.dateMax) {
                  // ✅ Single date selected
                  setFilters({
                    ...filters,
                    dateMin: filters.dateMin,
                    dateMax: "",
                  });
                } else {
                  // ✅ Nothing selected — clear filter
                  setFilters({
                    ...filters,
                    dateMin: "",
                    dateMax: "",
                  });
                }
                setDateModalOpen(false);
              }}
              className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    )}


      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {Incidents.find((i) => i.id === editing.id)
                ? `${editing.project || "Project"} Incident Details`
                : "Add New Incident"}
            </h2>

            {/* Grid of form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3">
              
              {/* Date */}
              <div>
                <input
                  type="date"
                  value={editing.date}
                  readOnly
                  disabled
                  className="w-auto text-sm border border-gray-100 rounded-lg px-4 py-2 bg-gray-100 text-black"
                />
              </div>


              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                  rows="3"
                />
              </div>

              <div className="flex flex-row justify-start items-center gap-x-3 w-full">
              {/* Severity */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={editing.severity}
                  onChange={(e) => setEditing({ ...editing, severity: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>

                {(() => {
                  // Decide background + text color based on status
                  let statusClass = "";
                  switch (editing.status) {
                    case "Reported":
                      statusClass = "bg-red-100 text-red-700 border-red-300";
                      break;
                    case "Resolving":
                      statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
                      break;
                    case "Resolved":
                      statusClass = "bg-green-100 text-green-700 border-green-300";
                      break;
                    default:
                      statusClass = "bg-gray-100 text-gray-700 border-gray-300";
                  }

                  return (
                    <select
                      value={editing.status}
                      onChange={(e) =>
                        setEditing({ ...editing, status: e.target.value })
                      }
                      className={`text-sm rounded-lg px-4 py-2 border ${statusClass}`}
                    >
                      <option value="Reported">Reported</option>
                      <option value="Resolving">Resolving</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  );
                })()}
              </div>

            </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}