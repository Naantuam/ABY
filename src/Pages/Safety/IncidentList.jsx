import { useState, useEffect } from "react";
import {
  Download, Trash2, Plus, Edit, X, Calendar,
  AlertCircle, Search, Filter, Hash, ChevronDown, MapPin
} from "lucide-react";
import api from "../../api";

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit = true;

  // ────────────────────────────────
  // 1️⃣ Fetch Data (GET)
  // ────────────────────────────────
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/safety/safety-incidents/");
      setIncidents(response.data.results || response.data || []);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // ────────────────────────────────
  // 2️⃣ Filter Logic & State
  // ────────────────────────────────

  function convertToCSV(data) {
    if (!data || !data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => JSON.stringify(row[field] || "")).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editing, setEditing] = useState(null);

  // ✅ Updated Filter State: Added 'id' and 'date' for specific matches
  const [filters, setFilters] = useState({
    id: "", idMin: "", idMax: "",
    date: "", dateMin: "", dateMax: "",
    project: "",
    severity: "",
    status: "",
  });

  // Mobile State
  const [mobileSearch, setMobileSearch] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Desktop Modal Visibility
  const [idModalOpen, setIdModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // Local Range States (for inputs inside desktop modals)
  const [idRange, setIdRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [visibleCount, setVisibleCount] = useState(10);

  // Check active filters for badge
  const hasActiveFilters =
    filters.id || filters.idMin || filters.idMax ||
    filters.date || filters.dateMin || filters.dateMax ||
    filters.severity || filters.status;

  // Helpers for Styling
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "reported": return "bg-red-100 text-red-700 border-red-200";
      case "resolving": return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "text-red-600 font-bold bg-red-50 border-red-100";
      case "medium": return "text-yellow-600 font-bold bg-yellow-50 border-yellow-100";
      case "low": return "text-green-600 font-bold bg-green-50 border-green-100";
      default: return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    // Mobile Search overrides project filter
    const searchProject = mobileSearch || filters.project;

    // ID Logic: Specific ID overrides Range
    let matchID = true;
    if (filters.id) {
      matchID = Number(incident.id) === Number(filters.id);
    } else if (filters.idMin && filters.idMax) {
      matchID = Number(incident.id) >= Number(filters.idMin) && Number(incident.id) <= Number(filters.idMax);
    } else if (filters.idMin) {
      matchID = Number(incident.id) === Number(filters.idMin);
    }

    // Date Logic: Specific Date overrides Range
    let matchDate = true;
    if (filters.date) {
      matchDate = incident.incident_date === filters.date;
    } else if (filters.dateMin && filters.dateMax) {
      matchDate = incident.incident_date >= filters.dateMin && incident.incident_date <= filters.dateMax;
    } else if (filters.dateMin) {
      matchDate = incident.incident_date === filters.dateMin;
    }

    const matchProject = searchProject
      ? incident.project?.toLowerCase().includes(searchProject.toLowerCase())
      : true;

    const matchSeverity = filters.severity
      ? incident.severity?.toLowerCase() === filters.severity.toLowerCase()
      : true;

    const matchStatus = filters.status
      ? incident.incident_status?.toLowerCase() === filters.status.toLowerCase()
      : true;

    return matchID && matchDate && matchProject && matchSeverity && matchStatus;
  });

  // ────────────────────────────────
  // 3️⃣ Handlers
  // ────────────────────────────────

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

  const handleAdd = () => {
    setEditing({
      incident_date: new Date().toISOString().slice(0, 10),
      description: "",
      actions_taken: "",
      incident_status: "reported",
      severity: "low",
      location: "",
      project: "",
      reported_by: null
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const response = await api.put(`/safety/safety-incidents/${editing.id}/`, editing);
        setIncidents((prev) => prev.map((inc) => (inc.id === editing.id ? response.data : inc)));
        alert("Incident updated successfully");
      } else {
        const response = await api.post("/safety/safety-incidents/", editing);
        setIncidents((prev) => [response.data, ...prev]);
        alert("Incident reported successfully");
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving incident:", error);
      alert("Failed to save incident. Please check your inputs.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete Incident #${id}?`)) return;
    try {
      await api.delete(`/safety/safety-incidents/${id}/`);
      setIncidents((prev) => prev.filter((inc) => inc.id !== id));
      alert("Incident deleted successfully");
    } catch (error) {
      console.error("Failed to delete incident:", error);
      alert("Failed to delete incident.");
    }
  };

  const handleRowClick = (incident) => {
    setEditing({ ...incident });
  };

  return (
    <div className="p-0 sm:p-6 bg-white sm:bg-transparent min-h-screen font-sans">

      {/* 📱 MOBILE: Sticky Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm mb-2">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
            />
          </div>

          {/* Filter Trigger */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`relative p-2.5 rounded-xl border transition-colors ${hasActiveFilters ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-400 rounded-full border border-white"></span>}
          </button>

          {/* Add Trigger (Mobile) */}
          {canEdit && (
            <button
              onClick={handleAdd}
              className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 🖥️ DESKTOP: Header */}
      <div className="hidden lg:flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Safety Incidents</h2>
          <p className="text-xs text-gray-500">Log and track workplace incidents</p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 shadow-sm transition">
            <Download className="w-4 h-4" /> Export
          </button>
          {canEdit && (
            <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-xs font-bold shadow-sm transition active:scale-95">
              <Plus className="w-4 h-4" /> Report Incident
            </button>
          )}
        </div>
      </div>

      <div className="bg-white lg:rounded-xl shadow-sm border-t lg:border border-gray-200 overflow-hidden">

        {/* 🖥️ DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
              <tr>
                {/* ID Header */}
                <th className="px-4 py-3 w-20">
                  <button onClick={() => setIdModalOpen(true)} className={`hover:bg-gray-100 w-full rounded px-2 py-1 text-left ${idModalOpen || filters.id || filters.idMin ? "text-blue-600 bg-blue-50" : ""}`}>
                    {filters.id ? "ID Set" : "ID"}
                  </button>
                </th>

                {/* Date Header */}
                <th className="px-4 py-3 w-28">
                  <button onClick={() => setDateModalOpen(true)} className={`hover:bg-gray-100 w-full rounded px-2 py-1 text-left ${dateModalOpen || filters.date || filters.dateMin ? "text-blue-600 bg-blue-50" : ""}`}>
                    {filters.date ? "Date Set" : "Date"}
                  </button>
                </th>

                <th className="px-4 py-3">
                  <input placeholder="Project Name" value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })} className="bg-transparent w-full outline-none placeholder-gray-400" />
                </th>
                <th className="px-4 py-3 w-64">Description</th>

                <th className="px-4 py-3 w-32">
                  <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="bg-transparent w-full outline-none cursor-pointer">
                    <option value="">Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                  </select>
                </th>

                <th className="px-4 py-3 w-32">
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="bg-transparent w-full outline-none cursor-pointer">
                    <option value="">Status</option>
                    <option value="reported">Reported</option>
                    <option value="resolving">Resolving</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </th>
                <th className="px-4 py-3 w-20 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-black">Loading incidents...</td></tr>
              ) : (
                [...filteredIncidents].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((incident) => (
                  <tr key={incident.id} onClick={() => handleRowClick(incident)} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                    <td className="px-4 py-3 font-mono text-black">#{incident.id}</td>
                    <td className="px-4 py-3 text-black">{incident.incident_date}</td>
                    <td className="px-4 py-3 font-medium text-black">{incident.project}</td>
                    <td className="px-4 py-3 text-black truncate max-w-[200px]" title={incident.description}>
                      {incident.description}
                    </td>
                    <td className={`px-4 py-3 uppercase font-bold text-xs ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-xs font-bold uppercase ${getStatusColor(incident.incident_status)}`}>
                        {incident.incident_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => handleDelete(incident.id, e)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {[...filteredIncidents].length === 0 && !loading && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No incidents found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE CARD LIST */}
        <div className="block lg:hidden bg-gray-50/50 p-4 space-y-3">
          {filteredIncidents.slice(0, visibleCount).map((incident) => (
            <div key={incident.id} onClick={() => handleRowClick(incident)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 truncate pr-2">{incident.project}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Hash className="w-3 h-3" /> {incident.id}</p>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getStatusColor(incident.incident_status)}`}>{incident.incident_status}</span>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-3 bg-gray-50 p-2 rounded-lg">{incident.description}</p>

              <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-2">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {incident.incident_date}</span>
                <span className={`px-2 py-0.5 rounded border font-bold uppercase ${getSeverityColor(incident.severity)}`}>{incident.severity}</span>
              </div>
            </div>
          ))}
          {filteredIncidents.length === 0 && <div className="p-8 text-center text-gray-400 text-sm italic">No incidents found.</div>}
          {visibleCount < filteredIncidents.length && <button onClick={() => setVisibleCount(prev => prev + 10)} className="w-full py-3 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Load More</button>}
        </div>
      </div>

      {/* 📱 MOBILE FILTER DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="bg-white w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">

              {/* 1. Date Filter (Specific OR Range) */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</label>
                <div className="space-y-3">
                  <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                    value={filters.date}
                    onChange={e => setFilters({ ...filters, date: e.target.value, dateMin: "", dateMax: "" })}
                  />
                  <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">— OR Range —</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs" value={filters.dateMin} onChange={e => setFilters({ ...filters, date: "", dateMin: e.target.value })} />
                    <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs" value={filters.dateMax} onChange={e => setFilters({ ...filters, date: "", dateMax: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* 2. ID Filter (Specific OR Range) */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Hash className="w-3 h-3" /> Incident ID</label>
                <div className="space-y-3">
                  <input type="number" placeholder="Specific ID (e.g. 10)" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                    value={filters.id}
                    onChange={e => setFilters({ ...filters, id: e.target.value, idMin: "", idMax: "" })}
                  />
                  <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">— OR Range —</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Min ID" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" value={filters.idMin} onChange={e => setFilters({ ...filters, id: "", idMin: e.target.value })} />
                    <input type="number" placeholder="Max ID" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" value={filters.idMax} onChange={e => setFilters({ ...filters, id: "", idMax: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {["", "reported", "resolving", "resolved"].map(opt => (
                    <button key={opt} onClick={() => setFilters({ ...filters, status: opt })} className={`px-3 py-2 rounded-full text-xs font-bold capitalize border ${filters.status === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>{opt || "All"}</button>
                  ))}
                </div>
              </div>

              {/* Severity Chips */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Severity</label>
                <div className="flex gap-2">
                  {["", "low", "medium", "critical"].map(opt => (
                    <button key={opt} onClick={() => setFilters({ ...filters, severity: opt })} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border ${filters.severity === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>{opt || "All"}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setFilters({ project: "", severity: "", status: "", date: "", dateMin: "", dateMax: "", id: "", idMin: "", idMax: "" })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">Reset</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 text-xs">Show Results</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DESKTOP MODALS (Updated Logic) ================= */}

      {/* ID FILTER MODAL */}
      {idModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIdModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Filter ID</h3>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Specific ID</label>
                <select
                  value={filters.id || ""}
                  onChange={(e) => { setFilters({ ...filters, id: e.target.value, idMin: "", idMax: "" }); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select ID</option>
                  {[...incidents].sort((a, b) => a.id - b.id).map((inc) => (
                    <option key={inc.id} value={inc.id}>{inc.id}</option>
                  ))}
                </select>
              </div>

              <div className="text-center text-xs text-gray-400 font-bold">— OR —</div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min" className="border rounded p-2 text-sm" value={idRange.min} onChange={e => setIdRange({ ...idRange, min: e.target.value })} />
                  <input type="number" placeholder="Max" className="border rounded p-2 text-sm" value={idRange.max} onChange={e => setIdRange({ ...idRange, max: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button onClick={() => setIdModalOpen(false)} className="px-3 py-1.5 text-gray-500 text-xs font-bold hover:bg-gray-100 rounded">Cancel</button>
                <button onClick={() => {
                  if (idRange.min && idRange.max) setFilters({ ...filters, id: "", idMin: idRange.min, idMax: idRange.max });
                  else if (!filters.id) setFilters({ ...filters, id: "", idMin: "", idMax: "" });
                  setIdModalOpen(false);
                }} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATE FILTER MODAL */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Filter Date</h3>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Specific Date</label>
                <select
                  value={filters.date || ""}
                  onChange={(e) => { setFilters({ ...filters, date: e.target.value, dateMin: "", dateMax: "" }); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Date</option>
                  {Array.from(new Set(incidents.map(i => i.incident_date))).sort().map((date) => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              <div className="text-center text-xs text-gray-400 font-bold">— OR —</div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="border rounded p-2 text-xs" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                  <input type="date" className="border rounded p-2 text-xs" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button onClick={() => setDateModalOpen(false)} className="px-3 py-1.5 text-gray-500 text-xs font-bold hover:bg-gray-100 rounded">Cancel</button>
                <button onClick={() => {
                  if (dateRange.start && dateRange.end) setFilters({ ...filters, date: "", dateMin: dateRange.start, dateMax: dateRange.end });
                  else if (!filters.date) setFilters({ ...filters, date: "", dateMin: "", dateMax: "" });
                  setDateModalOpen(false);
                }} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editing.id ? "Edit Incident" : "Report Incident"}</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{editing.id ? `ID: #${editing.id}` : "New Entry"}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input type="date" value={editing.incident_date} onChange={(e) => setEditing({ ...editing, incident_date: e.target.value })} disabled={!canEdit} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                <input type="text" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} disabled={!canEdit} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project</label>
                <input type="text" value={editing.project} onChange={(e) => setEditing({ ...editing, project: e.target.value })} disabled={!canEdit} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity</label>
                <select value={editing.severity} onChange={(e) => setEditing({ ...editing, severity: e.target.value })} disabled={!canEdit} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500 transition-colors">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} disabled={!canEdit} rows="3" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Actions Taken</label>
                <textarea value={editing.actions_taken || ""} onChange={(e) => setEditing({ ...editing, actions_taken: e.target.value })} disabled={!canEdit} rows="2" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select value={editing.incident_status} onChange={(e) => setEditing({ ...editing, incident_status: e.target.value })} disabled={!canEdit} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500 transition-colors capitalize">
                  <option value="reported">Reported</option>
                  <option value="resolving">Resolving</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 sticky bottom-0">
              <button onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors">{canEdit ? "Cancel" : "Close"}</button>
              {canEdit && <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Save Changes</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}