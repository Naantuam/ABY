import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import api from "../../api"; // Ensure this path is correct

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Future-proofing: Permission logic
  // In a real app, you might check: const { user } = useAuth(); const canEdit = user.role === 'admin';
  const canEdit = true; 

  // 🔹 Fetch Data from API
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/safety/safety-incidents/");
      setIncidents(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
    if (!data || !data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => JSON.stringify(row[field] || "")).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editing, setEditing] = useState(null);
  
  // Filter States
  const [filters, setFilters] = useState({
    idMin: "", idMax: "",
    dateMin: "", dateMax: "",
    project: "",
    severity: "",
    status: "",
  });

  // For modals (Filters)
  const [idModalOpen, setIdModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // For ranges (Filters)
  const [idRange, setIdRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [visibleCount, setVisibleCount] = useState(10);

  // Check if we are editing an existing item (has an ID) or creating a new one
  const isEditingExisting = editing && editing.id;

  // 🔹 Status color badges
  const getStatusColor = (status) => {
    // API returns lowercase usually, but let's handle both
    const s = status?.toLowerCase();
    switch (s) {
      case "reported":
        return "bg-red-500 text-white";
      case "resolving":
        return "bg-blue-400 text-white";
      case "resolved":
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

  // 🔹 Filter Logic
  const filteredIncidents = incidents.filter((incident) => {
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
        ? incident.incident_date >= filters.dateMin && incident.incident_date <= filters.dateMax
        : filters.dateMin && !filters.dateMax
        ? incident.incident_date === filters.dateMin
        : true;

    // ✅ Other filters
    const matchProject = filters.project
      ? incident.project?.toLowerCase().includes(filters.project.toLowerCase())
      : true;
    
    // Exact match for dropdowns
    const matchSeverity = filters.severity 
      ? incident.severity?.toLowerCase() === filters.severity.toLowerCase() 
      : true;
      
    const matchStatus = filters.status 
      ? incident.incident_status?.toLowerCase() === filters.status.toLowerCase() 
      : true;

    return matchID && matchDate && matchProject && matchSeverity && matchStatus;
  });

  // 🔹 Add new Incident Template
  const handleAdd = () => {
    // Schema matching the POST request structure
    const newIncident = {
      incident_date: new Date().toISOString().slice(0, 10),
      description: "",
      actions_taken: "",
      incident_status: "reported",
      severity: "low",
      location: "",
      project: "",
      reported_by: null // API might auto-fill this based on token
    };
    setEditing(newIncident);
  };

  // 🔹 Save edited or new Incident via API
  const handleSave = async () => {
    if (!editing) return;

    try {
      if (editing.id) {
        // UPDATE existing
        const response = await api.put(`/api/safety/safety-incidents/${editing.id}/`, editing);
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === editing.id ? response.data : inc))
        );
      } else {
        // CREATE new
        const response = await api.post("/api/safety/safety-incidents/", editing);
        setIncidents((prev) => [response.data, ...prev]);
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving incident:", error);
      alert("Failed to save incident. Please check your inputs.");
    }
  };

  // 🔹 Handle Row Click (Open Modal)
  const handleRowClick = (incident) => {
    setEditing({ ...incident });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {/* Add New Incident - Only if permission allows */}
        {canEdit ? (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Incident
          </button>
        ) : (
           <h2 className="text-lg font-semibold text-gray-800">Safety Incidents</h2>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto relative">
        {loading && <div className="p-4 text-center text-gray-500">Loading incidents...</div>}
        
        {!loading && (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                {/* ID Filter Column */}
                <th className="px-2 py-2 w-16">
                  <button
                    onClick={() => setIdModalOpen(true)}
                    className={`hover:bg-gray-300 w-full rounded px-1 py-1 text-left flex justify-between items-center ${
                      idModalOpen ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <span>ID</span>
                  </button>
                </th>

                {/* Date Filter Column */}
                <th className="px-2 py-2 w-28">
                  <button
                    onClick={() => setDateModalOpen(true)}
                    className={`hover:bg-gray-300 w-full rounded px-1 py-1 text-left ${
                      dateModalOpen ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    Date
                  </button>
                </th>          
                
                {/* Project Filter */}
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Project"
                    value={filters.project}
                    onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                    className="px-2 py-1 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </th>

                <th className="px-2 py-2">Description</th>

                {/* Severity Filter */}
                <th className="px-2 py-2 w-24">
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="w-full border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none"
                  >
                    <option value="">Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                  </select>
                </th>

                {/* Status Filter */}
                <th className="px-2 py-2 w-28">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none"
                  >
                    <option value="">Status</option>
                    <option value="reported">Reported</option>
                    <option value="resolving">Resolving</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...filteredIncidents].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => handleRowClick(incident)}
                  className="border-b hover:bg-blue-50 cursor-pointer transition-colors text-xs sm:text-sm group"
                >
                  <td className="px-2 py-3 font-medium text-gray-700">#{incident.id}</td>
                  <td className="px-2 py-3">{incident.incident_date}</td>
                  <td className="px-2 py-3 font-medium">{incident.project}</td>
                  <td className="px-2 py-3 truncate max-w-[200px]" title={incident.description}>
                    {incident.description}
                  </td>
                  <td className="px-2 py-3 capitalize">{incident.severity}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                        incident.incident_status
                      )}`}
                    >
                      {incident.incident_status}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {[...filteredIncidents].length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-gray-500">
                    No incidents found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold text-xs sm:text-sm">
                {visibleCount < filteredIncidents.length && (
                  <td colSpan={6} className="px-2 py-4 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 10)}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs hover:bg-gray-50 transition shadow-sm"
                    >
                      View More
                    </button>
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* ID Filter Modal */}
      {idModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIdModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
             {/* Filter Content (Same as previous, just simplified for brevity) */}
             <div className="space-y-4">
               <h3 className="font-semibold text-gray-700">Filter by ID</h3>
               <div className="grid grid-cols-2 gap-2">
                 <input 
                   type="number" placeholder="Min ID" 
                   className="border rounded p-2 text-sm"
                   value={idRange.min} onChange={e => setIdRange({...idRange, min: e.target.value})}
                 />
                 <input 
                   type="number" placeholder="Max ID" 
                   className="border rounded p-2 text-sm"
                   value={idRange.max} onChange={e => setIdRange({...idRange, max: e.target.value})}
                 />
               </div>
               <div className="flex justify-end gap-2">
                 <button onClick={() => setIdModalOpen(false)} className="px-3 py-1.5 bg-gray-200 rounded text-sm">Close</button>
                 <button 
                    onClick={() => {
                        setFilters({...filters, idMin: idRange.min, idMax: idRange.max});
                        setIdModalOpen(false);
                    }} 
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
                 >Apply</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Date Filter Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
             <div className="space-y-4">
               <h3 className="font-semibold text-gray-700">Filter by Date</h3>
               <div className="grid grid-cols-2 gap-2">
                 <input 
                   type="date" 
                   className="border rounded p-2 text-sm"
                   value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})}
                 />
                 <input 
                   type="date" 
                   className="border rounded p-2 text-sm"
                   value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})}
                 />
               </div>
               <div className="flex justify-end gap-2">
                 <button onClick={() => setDateModalOpen(false)} className="px-3 py-1.5 bg-gray-200 rounded text-sm">Close</button>
                 <button 
                    onClick={() => {
                        setFilters({...filters, dateMin: dateRange.start, dateMax: dateRange.end});
                        setDateModalOpen(false);
                    }} 
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
                 >Apply</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Detail/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editing.id ? `Incident #${editing.id}` : "New Incident Report"}
              </h2>
              {/* If view only, show a badge */}
              {!canEdit && <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">View Only</span>}
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Incident Date</label>
                <input
                  type="date"
                  value={editing.incident_date}
                  onChange={(e) => setEditing({ ...editing, incident_date: e.target.value })}
                  disabled={!canEdit}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  disabled={!canEdit}
                  placeholder="e.g. Lab 2, Site B"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Project</label>
                <input
                  type="text"
                  value={editing.project}
                  onChange={(e) => setEditing({ ...editing, project: e.target.value })}
                  disabled={!canEdit}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Severity</label>
                <select
                  value={editing.severity}
                  onChange={(e) => setEditing({ ...editing, severity: e.target.value })}
                  disabled={!canEdit}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Description - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  disabled={!canEdit}
                  rows="3"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Actions Taken - Full Width (New Field) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Actions Taken</label>
                <textarea
                  value={editing.actions_taken || ""}
                  onChange={(e) => setEditing({ ...editing, actions_taken: e.target.value })}
                  disabled={!canEdit}
                  rows="2"
                  placeholder="Steps taken to mitigate the incident..."
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Status</label>
                <select
                  value={editing.incident_status}
                  onChange={(e) => setEditing({ ...editing, incident_status: e.target.value })}
                  disabled={!canEdit}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 uppercase"
                >
                  <option value="reported">Reported</option>
                  <option value="resolving">Resolving</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Read Only Metadata */}
              {editing.id && (
                <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400">Created At:</span>
                    <p className="text-xs text-gray-600">{new Date(editing.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Last Updated:</span>
                    <p className="text-xs text-gray-600">{new Date(editing.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                {canEdit ? "Cancel" : "Close"}
              </button>
              
              {canEdit && (
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Incident
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}