import { useState, useEffect } from "react";
import {
   Download, Trash2, Plus, Edit, X, Calendar,
   AlertTriangle, Search, Filter
} from "lucide-react";
import api from "../../api";

export default function RiskList() {
   const [risks, setRisks] = useState([]);
   const [loading, setLoading] = useState(true);

   // ────────────────────────────────
   // 1️⃣ Constants (Backend Values)
   // ────────────────────────────────
   const LIKELIHOOD_OPTIONS = ["low", "medium", "high"];
   const IMPACT_OPTIONS = ["minor", "moderate", "severe"];
   const STATUS_OPTIONS = ["reported", "resolving", "mitigated", "pending"];

   // ────────────────────────────────
   // 2️⃣ Fetch Data
   // ────────────────────────────────
   const fetchRisks = async () => {
      try {
         setLoading(true);
         const response = await api.get("/safety/risk-assessments/");
         setRisks(response.data.results || response.data || []);
      } catch (error) {
         console.error("❌ Failed to fetch risks:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchRisks();
   }, []);

   // ────────────────────────────────
   // 3️⃣ State & Filters
   // ────────────────────────────────
   const [filters, setFilters] = useState({
      project: "", status: "", likelihood: "",
      date: "", dateMin: "", dateMax: "" // Added 'date' for exact match
   });

   const [mobileSearch, setMobileSearch] = useState("");
   const [showMobileFilters, setShowMobileFilters] = useState(false);
   const [editing, setEditing] = useState(null);

   // Local state for modal dropdowns
   const [likelihood, setLikelihood] = useState("low");
   const [impact, setImpact] = useState("minor");

   const [visibleCount, setVisibleCount] = useState(10);

   // Date Modal States (Desktop)
   const [dateModalOpen, setDateModalOpen] = useState(false);
   const [tempDate, setTempDate] = useState(""); // Local state for single date
   const [tempRange, setTempRange] = useState({ start: "", end: "" }); // Local state for range

   // Helper for mobile badge
   const hasActiveFilters = filters.status || filters.likelihood || filters.date || filters.dateMin;

   // ────────────────────────────────
   // 4️⃣ Handlers
   // ────────────────────────────────
   const handleAdd = () => {
      setLikelihood("low");
      setImpact("minor");
      setEditing({
         assessment_date: new Date().toISOString().slice(0, 10),
         project: "",
         hazard_type: "",
         status: "reported",
         mitigation_plan: "",
         related_incident: "",
         assessed_by: ""
      });
   };

   const handleRowClick = (risk) => {
      setLikelihood(risk.likelihood || "low");
      setImpact(risk.impact || "minor");
      setEditing({ ...risk });
   };

   const handleSave = async () => {
      if (!editing) return;

      const toIntOrNull = (val) => (val && val !== "" ? parseInt(val, 10) : null);

      const payload = {
         assessment_date: editing.assessment_date,
         project: editing.project,
         hazard_type: editing.hazard_type,
         mitigation_plan: editing.mitigation_plan,
         status: editing.status,
         likelihood: likelihood,
         impact: impact,
         assessed_by: toIntOrNull(editing.assessed_by),
         related_incident: toIntOrNull(editing.related_incident)
      };

      try {
         if (editing.id) {
            const response = await api.put(`/safety/risk-assessments/${editing.id}/`, payload);
            setRisks((prev) => prev.map((r) => (r.id === editing.id ? response.data : r)));
            alert("Risk Assessment Updated!");
         } else {
            const response = await api.post("/safety/risk-assessments/", payload);
            setRisks((prev) => [response.data, ...prev]);
            alert("Risk Assessment Created!");
         }
         setEditing(null);
      } catch (error) {
         console.error("❌ Save Failed:", error.response?.data);
         alert("Failed to save. Check inputs.");
      }
   };

   const handleDelete = async (id, e) => {
      e.stopPropagation();
      if (!window.confirm("Delete this assessment?")) return;
      try {
         await api.delete(`/safety/risk-assessments/${id}/`);
         setRisks((prev) => prev.filter((r) => r.id !== id));
      } catch (error) { alert("Could not delete."); }
   };

   // ────────────────────────────────
   // 5️⃣ Filter Logic & Styles
   // ────────────────────────────────
   const filteredRisks = risks.filter(risk => {
      const search = mobileSearch || filters.project;

      const matchProject = search ? risk.project?.toLowerCase().includes(search.toLowerCase()) : true;
      const matchStatus = filters.status ? risk.status === filters.status : true;
      const matchLikelihood = filters.likelihood ? risk.likelihood === filters.likelihood : true;

      // Date Logic: Specific Date overrides Range
      const riskDate = risk.assessment_date;
      let matchDate = true;

      if (filters.date) {
         // Exact Match
         matchDate = riskDate === filters.date;
      } else if (filters.dateMin || filters.dateMax) {
         // Range Match
         const min = filters.dateMin || "0000-00-00";
         const max = filters.dateMax || "9999-12-31";
         matchDate = riskDate >= min && riskDate <= max;
      }

      return matchProject && matchStatus && matchLikelihood && matchDate;
   });

   const getRiskColor = (val) => {
      switch (val?.toLowerCase()) {
         case "high": case "severe": return "text-red-700 bg-red-50 border-red-200";
         case "medium": case "moderate": return "text-orange-700 bg-orange-50 border-orange-200";
         case "low": case "minor": return "text-green-700 bg-green-50 border-green-200";
         default: return "text-gray-700 bg-gray-50 border-gray-200";
      }
   };

   const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
         case "reported": return "bg-red-100 text-red-700 border-red-200";
         case "resolving": return "bg-blue-100 text-blue-700 border-blue-200";
         case "mitigated": return "bg-green-100 text-green-700 border-green-200";
         case "pending": return "bg-gray-100 text-gray-700 border-gray-200";
         default: return "bg-gray-50 text-gray-500 border-gray-200";
      }
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
               <button
                  onClick={handleAdd}
                  className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
               >
                  <Plus className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* 🖥️ DESKTOP: Header */}
         <div className="hidden lg:flex justify-between items-center mb-6">
            <div>
               <h2 className="text-xl font-bold text-gray-800">Risk Assessments</h2>
               <p className="text-xs text-gray-500">Track and mitigate safety hazards</p>
            </div>
            <div className="flex gap-2">
               <button className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 shadow-sm transition"><Download className="w-4 h-4" /> Export</button>
               <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-xs font-bold shadow-sm transition active:scale-95"><Plus className="w-4 h-4" /> Add Risk</button>
            </div>
         </div>

         <div className="bg-white lg:rounded-xl shadow-sm border-t lg:border border-gray-200 overflow-hidden">

            {/* 🖥️ DESKTOP TABLE */}
            <div className="hidden lg:block overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                     <tr>
                        {/* Date Filter Button */}
                        <th className="px-4 py-3 w-32">
                           <button onClick={() => setDateModalOpen(true)} className={`hover:bg-gray-100 px-2 py-1 rounded w-full text-left ${dateModalOpen || filters.date || filters.dateMin ? "text-blue-600 bg-blue-50" : ""}`}>
                              {filters.date ? "Specific Date" : filters.dateMin ? "Date Range" : "Date"}
                           </button>
                        </th>

                        <th className="px-4 py-3 w-40">
                           <input placeholder="Project Name" className="bg-transparent w-full outline-none placeholder-gray-400"
                              value={filters.project} onChange={e => setFilters({ ...filters, project: e.target.value })}
                           />
                        </th>

                        <th className="px-4 py-3 w-40">Hazard</th>
                        <th className="px-4 py-3 w-32">
                           <select className="bg-transparent w-full outline-none cursor-pointer"
                              value={filters.likelihood} onChange={e => setFilters({ ...filters, likelihood: e.target.value })}
                           >
                              <option value="">Likelihood</option>
                              {LIKELIHOOD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                           </select>
                        </th>
                        <th className="px-4 py-3 w-32">Impact</th>
                        <th className="px-4 py-3 w-32">
                           <select className="bg-transparent w-full outline-none cursor-pointer"
                              value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                           >
                              <option value="">Status</option>
                              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                           </select>
                        </th>
                        <th className="px-4 py-3 w-20 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                     {filteredRisks.slice(0, visibleCount).map(r => (
                        <tr key={r.id} onClick={() => handleRowClick(r)} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                           <td className="px-4 py-3 text-black font-mono">{r.assessment_date}</td>
                           <td className="px-4 py-3 font-medium text-black">{r.project}</td>
                           <td className="px-4 py-3 text-black">{r.hazard_type}</td>
                           <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded border capitalize ${getRiskColor(r.likelihood)}`}>{r.likelihood}</span></td>
                           <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded border capitalize ${getRiskColor(r.impact)}`}>{r.impact}</span></td>
                           <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded border capitalize ${getStatusColor(r.status)}`}>{r.status}</span></td>
                           <td className="px-4 py-3 text-right">
                              <button onClick={(e) => handleDelete(r.id, e)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                           </td>
                        </tr>
                     ))}
                     {filteredRisks.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No risks found.</td></tr>}
                  </tbody>
               </table>
            </div>

            {/* 📱 MOBILE CARD LIST */}
            <div className="block lg:hidden bg-gray-50/50 p-4 space-y-3">
               {filteredRisks.slice(0, visibleCount).map(r => (
                  <div key={r.id} onClick={() => handleRowClick(r)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <h3 className="text-sm font-bold text-gray-900 truncate pr-2">{r.project}</h3>
                           <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3" /> {r.hazard_type}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getStatusColor(r.status)}`}>{r.status}</span>
                     </div>
                     <div className="flex gap-2 mt-3 mb-3">
                        <span className={`flex-1 text-center py-1 rounded border text-[10px] font-bold capitalize ${getRiskColor(r.likelihood)}`}>{r.likelihood}</span>
                        <span className={`flex-1 text-center py-1 rounded border text-[10px] font-bold capitalize ${getRiskColor(r.impact)}`}>{r.impact}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.assessment_date}</span>
                        <button onClick={(e) => handleDelete(r.id, e)} className="text-red-500 font-medium flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                     </div>
                  </div>
               ))}
               {filteredRisks.length === 0 && <div className="p-8 text-center text-gray-400 text-sm italic">No risks found.</div>}
               {visibleCount < filteredRisks.length && <button onClick={() => setVisibleCount(prev => prev + 10)} className="w-full py-3 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Load More</button>}
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

                     {/* 1. Date Section (Specific OR Range) */}
                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Date Filter</label>
                        <div className="space-y-3">
                           <div>
                              <span className="text-[10px] text-gray-400 mb-1 block">Specific Date</span>
                              <input type="date" className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                                 value={filters.date}
                                 onChange={e => setFilters({ ...filters, date: e.target.value, dateMin: "", dateMax: "" })}
                              />
                           </div>
                           <div className="text-center text-[10px] text-gray-400 font-bold">— OR —</div>
                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                 <span className="text-[10px] text-gray-400 mb-1 block">Start</span>
                                 <input type="date" className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                                    value={filters.dateMin}
                                    onChange={e => setFilters({ ...filters, date: "", dateMin: e.target.value })}
                                 />
                              </div>
                              <div>
                                 <span className="text-[10px] text-gray-400 mb-1 block">End</span>
                                 <input type="date" className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                                    value={filters.dateMax}
                                    onChange={e => setFilters({ ...filters, date: "", dateMax: e.target.value })}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Likelihood Chips */}
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Likelihood</label>
                        <div className="flex gap-2">
                           {["", ...LIKELIHOOD_OPTIONS].map(opt => (
                              <button key={opt} onClick={() => setFilters({ ...filters, likelihood: opt })} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border ${filters.likelihood === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>{opt || "All"}</button>
                           ))}
                        </div>
                     </div>

                     {/* Status Chips */}
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Status</label>
                        <div className="flex flex-wrap gap-2">
                           {["", ...STATUS_OPTIONS].map(opt => (
                              <button key={opt} onClick={() => setFilters({ ...filters, status: opt })} className={`px-3 py-2 rounded-full text-xs font-bold capitalize border ${filters.status === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>{opt || "All"}</button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                     <button onClick={() => setFilters({ project: "", status: "", date: "", dateMin: "", dateMax: "", likelihood: "" })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">Reset</button>
                     <button onClick={() => setShowMobileFilters(false)} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 text-xs">Show Results</button>
                  </div>
               </div>
            </div>
         )}

         {/* 🖥️ DESKTOP DATE MODAL */}
         {dateModalOpen && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
               <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-800 mb-4">Filter Date</h3>
                  <div className="space-y-4">

                     {/* 1. Specific Date */}
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Specific Date</label>
                        <input type="date" className="w-full border rounded p-2 text-sm mt-1"
                           value={tempDate}
                           onChange={e => { setTempDate(e.target.value); setTempRange({ start: "", end: "" }); }}
                        />
                     </div>

                     <div className="text-center text-xs text-gray-400 font-bold">— OR —</div>

                     {/* 2. Range */}
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Date Range</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                           <input type="date" className="border rounded p-2 text-xs"
                              value={tempRange.start}
                              onChange={e => { setTempRange({ ...tempRange, start: e.target.value }); setTempDate(""); }}
                           />
                           <input type="date" className="border rounded p-2 text-xs"
                              value={tempRange.end}
                              onChange={e => { setTempRange({ ...tempRange, end: e.target.value }); setTempDate(""); }}
                           />
                        </div>
                     </div>

                     <div className="flex justify-end gap-2 border-t pt-3">
                        <button onClick={() => {
                           setFilters({ ...filters, date: "", dateMin: "", dateMax: "" });
                           setTempDate(""); setTempRange({ start: "", end: "" });
                           setDateModalOpen(false);
                        }} className="text-sm text-red-500 font-medium px-3 py-1">Clear</button>

                        <button onClick={() => {
                           if (tempDate) {
                              setFilters({ ...filters, date: tempDate, dateMin: "", dateMax: "" });
                           } else if (tempRange.start || tempRange.end) {
                              setFilters({ ...filters, date: "", dateMin: tempRange.start, dateMax: tempRange.end });
                           }
                           setDateModalOpen(false);
                        }} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg">Apply</button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* EDIT MODAL */}
         {editing && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
               <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
                     <h2 className="text-lg font-bold text-gray-900">{editing.id ? "Edit Risk" : "New Risk"}</h2>
                     <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
                        <input className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition-colors" value={editing.project || ""} onChange={e => setEditing({ ...editing, project: e.target.value })} />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                           <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" value={editing.assessment_date || ""} onChange={e => setEditing({ ...editing, assessment_date: e.target.value })} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                           <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none capitalize" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hazard Type</label>
                        <input className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" value={editing.hazard_type || ""} onChange={e => setEditing({ ...editing, hazard_type: e.target.value })} />
                     </div>

                     <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Likelihood</label>
                           <select className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white capitalize outline-none" value={likelihood} onChange={e => setLikelihood(e.target.value)}>
                              {LIKELIHOOD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Impact</label>
                           <select className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white capitalize outline-none" value={impact} onChange={e => setImpact(e.target.value)}>
                              {IMPACT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mitigation Plan</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 min-h-[80px]" value={editing.mitigation_plan || ""} onChange={e => setEditing({ ...editing, mitigation_plan: e.target.value })} />
                     </div>
                  </div>

                  <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                     <button onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50">Cancel</button>
                     <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm">Save Changes</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}