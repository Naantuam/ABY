import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import api from "../../api"; // Ensure this path is correct

export default function RiskList() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permission Logic (Placeholder)
  const canEdit = true; 

  // ────────────────────────────────
  // 1️⃣ Fetch Data from API
  // ────────────────────────────────
  const fetchRisks = async () => {
    try {
      console.log("📡 Fetching Risk Assessments...");
      setLoading(true);
      
      const response = await api.get("/safety/risk-assessments/");
      
      console.log("✅ API Response:", response);
      console.log("📦 Data received:", response.data);

      // Handle Django DRF pagination structure { results: [...] }
      const fetchedData = response.data.results || response.data || [];
      
      console.log("🔄 Setting state 'risks' to:", fetchedData);
      setRisks(fetchedData);

    } catch (error) {
      console.error("❌ Failed to fetch risk assessments:", error);
      if (error.response) {
        console.error("⚠️ Error Response Data:", error.response.data);
        console.error("⚠️ Error Status:", error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  // ────────────────────────────────
  // 2️⃣ Filters & Modal State
  // ────────────────────────────────
  const [filters, setFilters] = useState({
    idMin: "", idMax: "",
    dateMin: "", dateMax: "",
    project: "",
    status: "",
  });

  const [editing, setEditing] = useState(null);
  
  // Local state for calculations inside modal
  const [initialLikelihood, setInitialLikelihood] = useState(0);
  const [initialSeverity, setInitialSeverity] = useState(0);
  const [residualLikelihood, setResidualLikelihood] = useState(0);
  const [residualSeverity, setResidualSeverity] = useState(0);

  const [idModalOpen, setIdModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [idRange, setIdRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [visibleCount, setVisibleCount] = useState(10);

  // ────────────────────────────────
  // 3️⃣ Helpers & Calculations
  // ────────────────────────────────
  const computedInitialRiskScore = (initialLikelihood || 0) * (initialSeverity || 0);
  const computedResidualRiskScore = (residualLikelihood || 0) * (residualSeverity || 0);

  // Auto-calculate status based on scores
  const getAutoStatus = () => {
    if (
      computedInitialRiskScore > 0 &&
      computedResidualRiskScore > 0 &&
      computedResidualRiskScore < computedInitialRiskScore
    ) {
      return "Mitigated";
    }
    return "Pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Mitigated": return "bg-green-500 text-white";
      case "Pending": return "bg-yellow-400 text-black";
      default: return "bg-gray-400 text-white";
    }
  };

  // ────────────────────────────────
  // 4️⃣ Filter Logic
  // ────────────────────────────────
  const filteredRisks = risks.filter((risk) => {
    const matchID =
      filters.idMin && filters.idMax
        ? Number(risk.id) >= Number(filters.idMin) && Number(risk.id) <= Number(filters.idMax)
        : filters.idMin
        ? Number(risk.id) === Number(filters.idMin)
        : true;

    const matchDate =
      filters.dateMin && filters.dateMax
        ? risk.date >= filters.dateMin && risk.date <= filters.dateMax
        : filters.dateMin
        ? risk.date === filters.dateMin
        : true;

    const matchProject = filters.project
      ? risk.project?.toLowerCase().includes(filters.project.toLowerCase())
      : true;

    const matchStatus = filters.status ? risk.status === filters.status : true;

    return matchID && matchDate && matchProject && matchStatus;
  });

  // ────────────────────────────────
  // 5️⃣ Handlers (Add, Save, Export)
  // ────────────────────────────────
  
  const handleAdd = () => {
    const newRisk = {
      date: new Date().toISOString().slice(0, 10),
      project: "",
      hazard_type: "", 
      initial_likelihood: 1,
      initial_severity: 1,
      residual_likelihood: 1,
      residual_severity: 1,
      control_measures: "",
      status: "pending"
    };
    
    setEditing(newRisk);
    // Reset Calculation State
    setInitialLikelihood(1);
    setInitialSeverity(1);
    setResidualLikelihood(1);
    setResidualSeverity(1);
  };

  const handleRowClick = (risk) => {
    setEditing({
      ...risk,
      // Map API 'assessment_date' back to React 'date' for the date picker
      date: risk.assessment_date || risk.date 
    });
    
    setInitialLikelihood(risk.initial_likelihood || 0);
    setInitialSeverity(risk.initial_severity || 0);
    setResidualLikelihood(risk.residual_likelihood || 0);
    setResidualSeverity(risk.residual_severity || 0);
  };

  const handleSave = async () => {
    if (!editing) return;

    // 1️⃣ Calculate status and convert to lowercase for API (pending / mitigated)
    const currentStatus = getAutoStatus().toLowerCase(); 

    // 2️⃣ Prepare payload matching Django's exact field names
    const payload = {
      // Map 'date' (React) to 'assessment_date' (Django)
      assessment_date: editing.date, 
      
      project: editing.project,
      hazard_type: editing.hazard_type || editing.hazardType,
      control_measures: editing.control_measures || editing.controlMeasures,

      // Scores
      initial_likelihood: initialLikelihood,
      initial_severity: initialSeverity,
      initial_risk_score: computedInitialRiskScore,

      residual_likelihood: residualLikelihood,
      residual_severity: residualSeverity,
      residual_risk_score: computedResidualRiskScore,

      // Send lowercase status
      status: currentStatus, 
    };

    console.log("📤 Sending Payload:", payload);

    try {
      if (editing.id) {
        // UPDATE
        const response = await api.put(`/safety/risk-assessments/${editing.id}/`, payload);
        console.log("✅ Update Success:", response.data);
        setRisks((prev) => prev.map((r) => (r.id === editing.id ? response.data : r)));
      } else {
        // CREATE
        const response = await api.post("/safety/risk-assessments/", payload);
        console.log("✅ Create Success:", response.data);
        setRisks((prev) => [response.data, ...prev]);
      }
      setEditing(null);
    } catch (error) {
      console.error("❌ Error saving risk assessment:", error);
      if (error.response) {
        // Log the specific validation errors from Django
        console.error("⚠️ Backend Validation Errors:", error.response.data);
        alert(`Save failed: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Failed to save. Check console for details.");
      }
    }
  };

  const handleExport = () => {
    if (filteredRisks.length === 0) return alert("No Risks to export!");
    
    // Simple flatten for CSV if object structure is complex
    const headers = Object.keys(filteredRisks[0]).join(",");
    const rows = filteredRisks.map(row => Object.values(row).map(val => `"${val}"`).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Risk_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {canEdit ? (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Risk Assessment
          </button>
        ) : (
          <h2 className="text-lg font-semibold text-gray-800">Risk Assessments</h2>
        )}

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
        {loading && <div className="p-4 text-center text-gray-500">Loading risks...</div>}
        
        {!loading && (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                <th className="px-2 py-2 w-16">
                  <button
                    onClick={() => setIdModalOpen(true)}
                    className={`hover:bg-gray-300 w-full rounded px-1 py-1 text-left flex justify-between ${idModalOpen ? "ring-2 ring-blue-500" : ""}`}
                  >
                    ID
                  </button>
                </th>
                <th className="px-2 py-2 w-28">
                  <button
                    onClick={() => setDateModalOpen(true)}
                    className={`hover:bg-gray-300 w-full rounded px-1 py-1 text-left ${dateModalOpen ? "ring-2 ring-blue-500" : ""}`}
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
                    className="px-2 py-1 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </th>
                <th className="px-2 py-2">Hazard Type</th>
                <th className="px-2 py-2 w-32">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none"
                  >
                    <option value="">Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Mitigated">Mitigated</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...filteredRisks].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((risk) => (
                <tr
                  key={risk.id}
                  onClick={() => handleRowClick(risk)}
                  className="border-b hover:bg-blue-50 cursor-pointer transition-colors text-xs sm:text-sm group"
                >
                  <td className="px-2 py-3 font-medium text-gray-700">#{risk.id}</td>
                  <td className="px-2 py-3">{risk.date}</td>
                  <td className="px-2 py-3">{risk.project}</td>
                  <td className="px-2 py-3">
                    {/* Handle both casing possibilities for robustness */}
                    {risk.hazard_type || risk.hazardType}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        risk.status
                      )}`}
                    >
                      {risk.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {filteredRisks.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No risks found</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold text-xs sm:text-sm">
                {visibleCount < filteredRisks.length && (
                  <td colSpan={5} className="px-2 py-4 text-center">
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

      {/* ─────────────── ID MODAL ─────────────── */}
      {idModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIdModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
               <h3 className="font-semibold text-gray-700">Filter by ID</h3>
               <div className="grid grid-cols-2 gap-2">
                 <input type="number" placeholder="Min" className="border rounded p-2 text-sm" value={idRange.min} onChange={e => setIdRange({...idRange, min: e.target.value})} />
                 <input type="number" placeholder="Max" className="border rounded p-2 text-sm" value={idRange.max} onChange={e => setIdRange({...idRange, max: e.target.value})} />
               </div>
               <div className="flex justify-end gap-2">
                 <button onClick={() => setIdModalOpen(false)} className="px-3 py-1.5 bg-gray-200 rounded text-sm">Close</button>
                 <button onClick={() => { setFilters({...filters, idMin: idRange.min, idMax: idRange.max}); setIdModalOpen(false); }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Apply</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── DATE MODAL ─────────────── */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
               <h3 className="font-semibold text-gray-700">Filter by Date</h3>
               <div className="grid grid-cols-2 gap-2">
                 <input type="date" className="border rounded p-2 text-sm" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                 <input type="date" className="border rounded p-2 text-sm" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
               </div>
               <div className="flex justify-end gap-2">
                 <button onClick={() => setDateModalOpen(false)} className="px-3 py-1.5 bg-gray-200 rounded text-sm">Close</button>
                 <button onClick={() => { setFilters({...filters, dateMin: dateRange.start, dateMax: dateRange.end}); setDateModalOpen(false); }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Apply</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── EDIT / ADD MODAL ─────────────── */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editing.id ? `Risk Assessment #${editing.id}` : "New Risk Assessment"}
              </h2>
              {/* Status Badge inside Modal */}
              <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                getAutoStatus() === "Mitigated" ? "bg-green-100 text-green-700 border-green-300" : "bg-yellow-100 text-yellow-700 border-yellow-300"
              }`}>
                {getAutoStatus()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              
              {/* Project */}
              <div>
                 <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Project</label>
                 <input
                    type="text"
                    value={editing.project}
                    onChange={(e) => setEditing({ ...editing, project: e.target.value })}
                    disabled={!canEdit}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                  />
              </div>

              {/* Hazard Type */}
              <div>
                 <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Hazard Type</label>
                 <input
                    type="text"
                    value={editing.hazard_type || editing.hazardType || ""}
                    onChange={(e) => setEditing({ ...editing, hazard_type: e.target.value, hazardType: e.target.value })}
                    disabled={!canEdit}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                  />
              </div>

              {/* ─ Initial Section ─ */}
              <div className="md:col-span-2 grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="col-span-3 text-sm font-bold text-gray-700">Initial Assessment</div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Likelihood</label>
                  <select
                    value={initialLikelihood}
                    onChange={(e) => setInitialLikelihood(Number(e.target.value))}
                    disabled={!canEdit}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity</label>
                  <select
                    value={initialSeverity}
                    onChange={(e) => setInitialSeverity(Number(e.target.value))}
                    disabled={!canEdit}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-xs text-gray-500 mb-1">Score</label>
                  <input value={computedInitialRiskScore} disabled className="w-full text-sm bg-gray-200 border rounded px-2 py-1 font-bold text-center"/>
                </div>
              </div>

              {/* ─ Residual Section ─ */}
               <div className="md:col-span-2 grid grid-cols-3 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="col-span-3 text-sm font-bold text-gray-700">Residual Assessment</div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Likelihood</label>
                  <select
                    value={residualLikelihood}
                    onChange={(e) => setResidualLikelihood(Number(e.target.value))}
                    disabled={!canEdit}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity</label>
                  <select
                    value={residualSeverity}
                    onChange={(e) => setResidualSeverity(Number(e.target.value))}
                    disabled={!canEdit}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-xs text-gray-500 mb-1">Score</label>
                  <input value={computedResidualRiskScore} disabled className="w-full text-sm bg-gray-200 border rounded px-2 py-1 font-bold text-center"/>
                </div>
              </div>

              {/* Control Measures */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Control Measures</label>
                <textarea
                  value={editing.control_measures || editing.controlMeasures || ""}
                  onChange={(e) => setEditing({ ...editing, control_measures: e.target.value, controlMeasures: e.target.value })}
                  disabled={!canEdit}
                  rows="3"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Date */}
               <div>
                 <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Date</label>
                 <input
                    type="date"
                    value={editing.date}
                    readOnly
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                  />
              </div>
            </div>

            {/* Footer */}
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
                  Save Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}