import { useState, useEffect } from "react";
import {
  Download, Trash2, Plus, Edit, X, Calendar, DollarSign, Settings,
  Search, Filter, ChevronDown, Check
} from "lucide-react";
import api from "../../api";

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permission Logic
  const canEdit = true;

  // ────────────────────────────────
  // 1️⃣ Fetch Data
  // ────────────────────────────────
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get("/equipment/");
      const rawData = response.data.results || response.data || [];

      const formattedData = rawData.map((item) => {
        const rawCost = item.purchase_cost || 0;
        return {
          id: String(item.id),
          name: item.equipment_name || "Unnamed",
          type: item.equipment_type || "N/A",
          date: item.purchase_date || "",
          serialNumber: item.serial_number || "N/A",
          cost: `$${Number(rawCost).toLocaleString()}`,
          status: item.status || "Unknown",
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      });
      setEquipment(formattedData);
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // ────────────────────────────────
  // 2️⃣ State & Filters
  // ────────────────────────────────

  function convertToCSV(data) {
    if (!data || !data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => `"${row[field]}"`).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editing, setEditing] = useState(null);

  // Consolidated Filter State
  const [filters, setFilters] = useState({
    status: "",
    sn: "", snMin: "", snMax: "",
    costMin: "", costMax: "",
    dateMin: "", dateMax: "",
    name: "", type: ""
  });

  // UI States
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false); // 📱 NEW: Mobile Filter Drawer

  // Local ranges for modals (Desktop)
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [costRange, setCostRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [visibleCount, setVisibleCount] = useState(10);

  // Helper to check if any advanced filter is active (for Badge UI)
  const hasActiveFilters = filters.status || filters.type || filters.costMin || filters.dateMin;

  // ────────────────────────────────
  // 3️⃣ Filter Logic
  // ────────────────────────────────

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "available": return "bg-green-100 text-green-700 border-green-200";
      case "active": return "bg-blue-100 text-blue-700 border-blue-200";
      case "repair": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "retired": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const itemSN = Number(item.id.replace(/\D/g, ""));

    // SN Filter
    const snSingle = filters.sn ? Number(filters.sn.replace(/\D/g, "")) : null;
    const snMin = filters.snMin ? Number(filters.snMin.replace(/\D/g, "")) : null;
    const snMax = filters.snMax ? Number(filters.snMax.replace(/\D/g, "")) : null;
    let matchSN = true;
    if (snSingle !== null) matchSN = itemSN === snSingle;
    else if (snMin !== null || snMax !== null) {
      const min = snMin !== null ? snMin : -Infinity;
      const max = snMax !== null ? snMax : Infinity;
      matchSN = itemSN >= min && itemSN <= max;
    }

    // Cost Filter
    const cost = Number(item.cost.replace(/[^0-9.-]+/g, ""));
    const costMin = filters.costMin ? Number(filters.costMin) : null;
    const costMax = filters.costMax ? Number(filters.costMax) : null;
    let matchCost = true;
    if (costMin !== null && costMax === null) matchCost = cost === costMin;
    else if (costMin !== null || costMax !== null) {
      const min = costMin !== null ? costMin : -Infinity;
      const max = costMax !== null ? costMax : Infinity;
      matchCost = cost >= min && cost <= max;
    }

    // Date Filter
    const toDateNumber = (dateStr) => dateStr ? Number(dateStr.replace(/-/g, "")) : 0;
    const itemDateNum = toDateNumber(item.date);
    const minNum = filters.dateMin ? toDateNumber(filters.dateMin) : null;
    const maxNum = filters.dateMax ? toDateNumber(filters.dateMax) : null;
    let matchDate = true;
    if (minNum && maxNum) matchDate = itemDateNum >= minNum && itemDateNum <= maxNum;
    else if (minNum && !maxNum) matchDate = itemDateNum === minNum;

    // String Filters
    const matchName = filters.name ? item.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
    const matchType = filters.type ? item.type === filters.type : true;
    const matchStatus = filters.status ? item.status.toLowerCase() === filters.status.toLowerCase() : true;

    return matchSN && matchCost && matchDate && matchName && matchType && matchStatus;
  });

  // ────────────────────────────────
  // 4️⃣ Handlers
  // ────────────────────────────────

  const handleExport = () => {
    if (filteredEquipment.length === 0) return alert("No equipment to export!");
    const csv = convertToCSV(filteredEquipment);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipment_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdd = () => {
    const newItem = { name: "", type: "", date: new Date().toISOString().slice(0, 10), cost: "", status: "Available", serialNumber: "" };
    setEditing(newItem);
  };

  const handleSave = async () => {
    if (!editing) return;
    const rawCost = String(editing.cost).replace(/[^0-9.]/g, '');
    const payload = {
      equipment_name: editing.name,
      purchase_cost: rawCost ? parseFloat(rawCost) : 0,
      equipment_type: editing.type,
      purchase_date: editing.date,
      status: editing.status,
      serial_number: editing.serialNumber
    };

    try {
      if (editing.id) {
        const response = await api.put(`/equipment/${editing.id}/`, payload);
        const updatedItem = { ...response.data, id: String(response.data.id), name: response.data.equipment_name, type: response.data.equipment_type, date: response.data.purchase_date, cost: `$${Number(response.data.purchase_cost).toLocaleString()}`, serialNumber: response.data.serial_number, createdAt: response.data.created_at, updatedAt: response.data.updated_at };
        setEquipment((prev) => prev.map((eq) => (eq.id === String(editing.id) ? updatedItem : eq)));
      } else {
        const response = await api.post("/equipment/", payload);
        const newItem = { ...response.data, id: String(response.data.id), name: response.data.equipment_name, type: response.data.equipment_type, date: response.data.purchase_date, cost: `$${Number(response.data.purchase_cost).toLocaleString()}`, serialNumber: response.data.serial_number, createdAt: response.data.created_at, updatedAt: response.data.updated_at };
        setEquipment((prev) => [...prev, newItem]);
      }
      setEditing(null);
      alert("Saved Successfully!");
    } catch (error) {
      console.error("❌ Error saving equipment:", error);
      alert("Failed to save. Check inputs.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    try {
      await api.delete(`/equipment/${id}/delete/`);
      setEquipment(prev => prev.filter(item => item.id !== id));
      alert("Equipment deleted successfully.");
    } catch (error) {
      console.error("❌ Delete Request Failed:", error);
      alert("Could not delete equipment.");
    }
  };

  return (
    <div className="p-0 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* 📱 MOBILE: Sticky Filter Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search equipment..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm transition duration-150 ease-in-out"
            />
          </div>

          {/* Filter Trigger Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`relative p-2.5 rounded-xl border transition-colors ${hasActiveFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Filter className="w-5 h-5" />
            {/* Active Indicator Dot */}
            {hasActiveFilters && (
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* 🖥️ DESKTOP: Header */}
      <div className="hidden lg:flex flex-row justify-between items-center mb-6 gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Equipment Inventory</h2>
          <p className="text-xs text-gray-500">Manage assets and machinery</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-1 border px-3 py-2 bg-white text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 shadow-sm"><Download className="w-4 h-4" /> Export</button>
          {canEdit && <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm active:scale-95"><Plus className="w-4 h-4" /> Add Equipment</button>}
        </div>
      </div>

      <div className="bg-white lg:rounded-xl shadow-sm border-t lg:border border-gray-200 overflow-hidden">

        {/* 🖥️ DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-16"><button onClick={() => setSnModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${snModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>ID</button></th>
                <th className="px-4 py-3 w-38"><input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="bg-transparent w-full outline-none placeholder-gray-400" /></th>
                <th className="px-4 py-3 w-32"><select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="bg-transparent w-full outline-none cursor-pointer"><option value="">All Types</option><option value="Power Tools">Power Tools</option><option value="Heavy Machinery">Heavy Machinery</option></select></th>
                <th className="px-4 py-3 w-28"><button onClick={() => setDateModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${dateModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Date</button></th>
                <th className="px-4 py-3 w-28"><button onClick={() => setCostModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${costModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Cost</button></th>
                <th className="px-4 py-3 w-32"><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="bg-transparent w-full outline-none cursor-pointer"><option value="">Status</option><option value="available">Available</option><option value="active">Active</option><option value="repair">Repair</option><option value="retired">Retired</option></select></th>
                <th className="px-4 py-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : (
                [...filteredEquipment].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((eq) => (
                  <tr key={eq.id} onClick={() => setEditing(eq)} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                    <td className="px-4 py-3 text-black font-mono">#{eq.id}</td>
                    <td className="px-4 py-3 font-medium text-black">{eq.name}</td>
                    <td className="px-4 py-3 text-black">{eq.type}</td>
                    <td className="px-4 py-3 text-black">{eq.date}</td>
                    <td className="px-4 py-3 font-mono text-black">{eq.cost}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(eq.status)}`}>{eq.status}</span></td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditing(eq); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={(e) => handleDelete(eq.id, e)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE CARD VIEW */}
        <div className="block lg:hidden bg-gray-50/50 p-4 space-y-4">
          {filteredEquipment.slice(0, visibleCount).map((eq) => (
            <div
              key={eq.id}
              onClick={() => setEditing(eq)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 pr-2">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{eq.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{eq.serialNumber}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize whitespace-nowrap ${getStatusColor(eq.status)}`}>
                  {eq.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg"><Settings className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">{eq.type}</span></div>
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg"><DollarSign className="w-3.5 h-3.5 text-gray-400" /><span className="truncate font-medium">{eq.cost}</span></div>
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg col-span-2"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">Purchased: {eq.date}</span></div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-[10px] text-gray-400 font-mono">ID: #{eq.id}</span>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditing(eq); }} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"><Edit className="w-3 h-3" /> Edit</button>
                  <button onClick={(e) => handleDelete(eq.id, e)} className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filteredEquipment.length === 0 && <div className="p-8 text-center text-gray-400 text-sm italic">No equipment found.</div>}
          {visibleCount < filteredEquipment.length && <button onClick={() => setVisibleCount(prev => prev + 10)} className="w-full py-3 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Load More</button>}
        </div>
      </div>

      {/* 📱 MOBILE FILTER DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="bg-white w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              {/* 1. Status Chips */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Status</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {["", "Available", "Active", "Repair", "Retired"].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({ ...filters, status: status })}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filters.status === status
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200"
                        }`}
                    >
                      {status || "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Type Select */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Equipment Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Power Tools">Power Tools</option>
                  <option value="Heavy Machinery">Heavy Machinery</option>
                </select>
              </div>

              {/* 3. Cost Range */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Cost Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.costMin} onChange={(e) => setFilters({ ...filters, costMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input type="number" placeholder="Max" value={filters.costMax} onChange={(e) => setFilters({ ...filters, costMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>

              {/* 4. Date Range */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Purchase Date</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={filters.dateMin} onChange={(e) => setFilters({ ...filters, dateMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input type="date" value={filters.dateMax} onChange={(e) => setFilters({ ...filters, dateMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setFilters({ status: "", sn: "", snMin: "", snMax: "", cost: "", costMin: "", costMax: "", date: "", dateMin: "", dateMax: "", name: "", type: "" })}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────── */}
      {/* DESKTOP MODALS (Unchanged logic)       */}
      {/* ────────────────────────────────────── */}

      {/* S/N Modal */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSnModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Filter ID</h3>
            <div className="space-y-3">
              <select className="w-full border rounded p-2 text-sm" onChange={e => { setFilters({ ...filters, snMin: e.target.value, snMax: "" }); setSnModalOpen(false); }}><option value="">Select ID</option>{equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.id}</option>)}</select>
              <div className="text-center text-xs text-gray-400">- OR -</div>
              <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Min" className="border rounded p-2 text-sm" value={snRange.min} onChange={e => setSnRange({ ...snRange, min: e.target.value })} /><input type="number" placeholder="Max" className="border rounded p-2 text-sm" value={snRange.max} onChange={e => setSnRange({ ...snRange, max: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setSnModalOpen(false)} className="text-gray-500 text-xs font-medium">Cancel</button>
                <button onClick={() => { if (snRange.min && snRange.max) setFilters({ ...filters, sn: "", snMin: snRange.min, snMax: snRange.max }); setSnModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Modal */}
      {costModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setCostModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Filter Cost</h3>
            <div className="space-y-3">
              <select className="w-full border rounded p-2 text-sm" onChange={e => { setFilters({ ...filters, costMin: e.target.value, costMax: "" }); setCostModalOpen(false); }}><option value="">Select Cost</option>{[...new Set(equipment.map(e => e.cost.replace(/[^0-9.]/g, '')))].map(c => <option key={c} value={c}>${Number(c).toLocaleString()}</option>)}</select>
              <div className="text-center text-xs text-gray-400">- OR -</div>
              <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Min" className="border rounded p-2 text-sm" value={costRange.min} onChange={e => setCostRange({ ...costRange, min: e.target.value })} /><input type="number" placeholder="Max" className="border rounded p-2 text-sm" value={costRange.max} onChange={e => setCostRange({ ...costRange, max: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setCostModalOpen(false)} className="text-gray-500 text-xs font-medium">Cancel</button>
                <button onClick={() => { if (costRange.min && costRange.max) setFilters({ ...filters, costMin: costRange.min, costMax: costRange.max }); setCostModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <div className="space-y-3">
              <div>
                <select value={filters.dateMin && !filters.dateMax ? filters.dateMin : ""} onChange={(e) => { setFilters({ ...filters, dateMin: e.target.value, dateMax: "" }); setDateRange({ start: "", end: "" }); }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Select Date</option>
                  {equipment.map((eq) => <option key={eq.id} value={eq.date}>{eq.date}</option>)}
                </select>
              </div>
              <div className="text-center text-gray-500 text-sm">— OR —</div>
              <div className="grid grid-cols-2 gap-3">
                <select value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="border rounded px-2"><option value="">Start</option>{Array.from(new Set(equipment.map(eq => eq.date))).map(d => <option key={d} value={d}>{d}</option>)}</select>
                <select value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="border rounded px-2"><option value="">End</option>{Array.from(new Set(equipment.map(eq => eq.date))).map(d => <option key={d} value={d}>{d}</option>)}</select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setDateModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200">Cancel</button>
              <button onClick={() => { if (dateRange.start && dateRange.end) { setFilters({ ...filters, dateMin: dateRange.start, dateMax: dateRange.end }); } else if (filters.dateMin && !filters.dateMax) { setFilters({ ...filters, dateMin: filters.dateMin, dateMax: "" }); } else { setFilters({ ...filters, dateMin: "", dateMax: "" }); } setDateModalOpen(false); }} className="px-2 py-2 rounded-lg bg-blue-600 text-white">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editing.id ? "Edit Details" : "New Asset"}</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {editing.id || "NEW"}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} disabled={!canEdit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serial No.</label>
                  <input type="text" value={editing.serialNumber || ""} onChange={(e) => setEditing({ ...editing, serialNumber: e.target.value })} disabled={!canEdit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <input type="text" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} disabled={!canEdit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Purchased</label>
                  <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} disabled={!canEdit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost</label>
                  <input type="text" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: e.target.value })} disabled={!canEdit} placeholder="$0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} disabled={!canEdit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 uppercase">
                  <option value="available">Available</option><option value="active">Active</option><option value="repair">Repair</option><option value="retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors">{canEdit ? "Cancel" : "Close"}</button>
              {canEdit && <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Save Changes</button>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}