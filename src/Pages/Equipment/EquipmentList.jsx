import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import api from "../../api"; // Ensure this path is correct

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permission Logic
  const canEdit = true; 

  // ────────────────────────────────
  // 1️⃣ Fetch Data from API
  // ────────────────────────────────
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get("/equipment/");
      const rawData = response.data.results || response.data || [];

      // Map API data to UI structure (Handling numbers vs strings)
      const formattedData = rawData.map((item) => ({
        id: String(item.id), // Ensure ID is string for filters
        name: item.name,
        // API might return 'equipment_type' or 'type'
        type: item.equipment_type || item.type, 
        // API might return 'purchase_date' or 'date'
        date: item.purchase_date || item.date, 
        // Convert API number (e.g. 120000) to String "$120,000" for existing filters
        cost: item.cost 
          ? `$${Number(item.cost).toLocaleString()}` 
          : "$0",
        status: item.status,
        image: item.image || "https://via.placeholder.com/40",
      }));

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

  // 🔹 Utility: Convert JSON → CSV string
  function convertToCSV(data) {
    if (!data || !data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => `"${row[field]}"`).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editing, setEditing] = useState(null);
  
  const [filters, setFilters] = useState({
    status: "",
    sn: "", snMin: "", snMax: "",
    cost: "", costMin: "", costMax: "",
    date: "", dateMin: "", dateMax: "",
    name: "", type: ""
  });

  // Modals
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);

  // Range states
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [costRange, setCostRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [visibleCount, setVisibleCount] = useState(10); 

  // ────────────────────────────────
  // 3️⃣ Filter Logic
  // ────────────────────────────────
  
  // 🔹 Status color badges
  const getStatusColor = (status) => {
    // Handle case sensitivity
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "available": return "bg-green-400 text-green-100";
      case "active": return "bg-yellow-400 text-yellow-100";
      case "repair": return "bg-red-400 text-red-100";
      case "retired": return "bg-gray-400 text-gray-100";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    // Regex handles IDs like "Eq-1" or just "1"
    const itemSN = Number(item.id.replace(/\D/g, ""));  

    // --- SN filters ---
    const snSingle = filters.sn ? Number(filters.sn.replace(/\D/g, "")) : null;
    const snMin = filters.snMin ? Number(filters.snMin.replace(/\D/g, "")) : null;
    const snMax = filters.snMax ? Number(filters.snMax.replace(/\D/g, "")) : null;

    let matchSN = true;
    if (snSingle !== null) {
      matchSN = itemSN === snSingle;
    } else if (snMin !== null || snMax !== null) {
      const min = snMin !== null ? snMin : -Infinity;
      const max = snMax !== null ? snMax : Infinity;
      matchSN = itemSN >= min && itemSN <= max;
    }

    // --- Cost filter ---
    const cost = Number(item.cost.replace(/[^0-9.-]+/g,"")); 
    const costMin = filters.costMin !== "" && filters.costMin !== null ? Number(filters.costMin) : null;
    const costMax = filters.costMax !== "" && filters.costMax !== null ? Number(filters.costMax) : null;

    let matchCost = true;
    if (costMin !== null && costMax === null) {
      matchCost = cost === costMin;
    } else if (costMin !== null || costMax !== null) {
      const min = costMin !== null ? costMin : -Infinity;
      const max = costMax !== null ? costMax : Infinity;
      matchCost = cost >= min && cost <= max;
    }

    // --- Date filter ---
    const toDateNumber = (dateStr) => dateStr ? Number(dateStr.replace(/-/g, "")) : 0;
    const itemDateNum = toDateNumber(item.date);
    const minNum = filters.dateMin ? toDateNumber(filters.dateMin) : null;
    const maxNum = filters.dateMax ? toDateNumber(filters.dateMax) : null;

    let matchDate = true;
    if (minNum && maxNum) {
      matchDate = itemDateNum >= minNum && itemDateNum <= maxNum;
    } else if (minNum && !maxNum) {
      matchDate = itemDateNum === minNum;
    }

    // --- Other filters ---
    const matchName = filters.name
      ? item.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;

    const matchType = filters.type ? item.type === filters.type : true;
    
    // Normalize status for filtering
    const matchStatus = filters.status 
      ? item.status.toLowerCase() === filters.status.toLowerCase() 
      : true;

    return matchSN && matchCost && matchDate && matchName && matchType && matchStatus;
  });

  // ────────────────────────────────
  // 4️⃣ Handlers (Add, Save, Export)
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

  // Prepare Add Template
  const handleAdd = () => {
    const newItem = {
      name: "",
      type: "",
      date: new Date().toISOString().slice(0, 10),
      cost: "",
      status: "Available",
      image: "",
    };
    setEditing(newItem);
  };

  // Save via API
  const handleSave = async () => {
    if (!editing) return;

    // Prepare payload: Clean up Cost string back to Number
    // e.g. "$120,000" -> 120000
    const rawCost = String(editing.cost).replace(/[^0-9.]/g, '');

    const payload = {
      name: editing.name,
      // Map back to API field names
      equipment_type: editing.type, 
      purchase_date: editing.date,
      cost: Number(rawCost), 
      status: editing.status, // Ensure Case matches API requirements
      image: editing.image
    };

    try {
      if (editing.id) {
        // UPDATE
        const response = await api.put(`/equipment/${editing.id}/`, payload);
        
        // Update local state by re-formatting the response
        const updatedItem = {
           ...response.data,
           id: String(response.data.id),
           type: response.data.equipment_type || response.data.type,
           date: response.data.purchase_date || response.data.date,
           cost: `$${Number(response.data.cost).toLocaleString()}`
        };

        setEquipment((prev) =>
          prev.map((eq) => (eq.id === String(editing.id) ? updatedItem : eq))
        );
      } else {
        // CREATE
        const response = await api.post("/equipment/", payload);
        
        const newItem = {
           ...response.data,
           id: String(response.data.id),
           type: response.data.equipment_type || response.data.type,
           date: response.data.purchase_date || response.data.date,
           cost: `$${Number(response.data.cost).toLocaleString()}`
        };

        setEquipment((prev) => [...prev, newItem]);
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving equipment:", error);
      alert("Failed to save. Check inputs.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
       {/* Add New Equipment */}
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Equipment
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

        {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto relative">
        {loading && <div className="p-4 text-center text-gray-500">Loading equipment...</div>}

        {!loading && (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                {/* S/N filter button */}
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
                    placeholder="Names"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="px-1 py-1 w-24 border border-gray-300 rounded"
                  />
                </th>

                {/* Type filter */}
                <th className="px-2 py-2">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="border rounded-lg px-1 py-1 text-xs"
                  >
                    <option value="">All Types</option>
                    <option value="Heavy Machinery">Heavy Machinery</option>
                    <option value="Construction Tools">Construction Tools</option>
                  </select>
                </th>

                {/* Date modal button */}
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

                {/* Cost modal button */}
                <th className="px-2 py-2">
                  <button
                    onClick={() => setCostModalOpen(true)}
                    className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                      costModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                  >
                    Cost
                  </button>
                </th>

                {/* Status dropdown */}
                <th className="px-2 py-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="border rounded-lg px-1 py-1 text-xs"
                  >
                    <option value="">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Active">Active</option>
                    <option value="Repair">Repair</option>
                    <option value="Retired">Retired</option>
                  </select>
                </th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {[...filteredEquipment].sort((a, b) => Number(b.id.replace(/\D/g, "")) - Number(a.id.replace(/\D/g, ""))).slice(0, visibleCount).map((eq) => (
                <tr key={eq.id} className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm">
                  <td className="px-2 py-2">{eq.id}</td>
                  <td className="px-2 py-2">{eq.name}</td>
                  <td className="px-2 py-2">{eq.type}</td>
                  <td className="px-2 py-2">{eq.date}</td>
                  <td className="px-2 py-2">{eq.cost}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(eq.status)}`}
                    >
                      {eq.status}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => setEditing(eq)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {[...filteredEquipment].length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-gray-500">
                    No equipment found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-xs sm:text-sm">
                {visibleCount < filteredEquipment.length && (
                  <td colSpan={7} className="px-2 py-4 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 10)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-700 transition"
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

      {/* S/N Modal */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSnModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="space-y-3">
              <div>
                <select
                  value={filters.snMin && !filters.snMax ? filters.snMin : ""}
                  onChange={(e) => {
                    setFilters({ ...filters, snMin: e.target.value, snMax: "" });
                    setSnRange({ min: "", max: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select S/N</option>
                  {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.id}</option>)}
                </select>
              </div>
              <div className="text-center text-gray-500 text-sm">— OR —</div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={snRange.min}
                  onChange={(e) => setSnRange({ ...snRange, min: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Min</option>
                  {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.id}</option>)}
                </select>
                <select
                  value={snRange.max}
                  onChange={(e) => setSnRange({ ...snRange, max: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Max</option>
                  {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.id}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setSnModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200">Cancel</button>
              <button
                onClick={() => {
                  if (snRange.min && snRange.max) {
                    setFilters({ ...filters, sn: "", snMin: snRange.min, snMax: snRange.max });
                  } else if (filters.snMin && !filters.snMax) {
                    setFilters({ ...filters, sn: filters.snMin, snMin: "", snMax: "" });
                  } else {
                    setFilters({ ...filters, sn: "", snMin: "", snMax: "" });
                  }
                  setSnModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cost Modal */}
      {costModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setCostModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="space-y-3">
              {/* Single Cost */}
              <div>
                <select
                  value={filters.costMin && !filters.costMax ? filters.costMin : ""}
                  onChange={(e) => {
                    setFilters({ ...filters, costMin: e.target.value, costMax: "" });
                    setCostRange({ min: "", max: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Cost</option>
                  {[...new Map(equipment.map((eq) => [eq.cost.replace(/[^0-9.]/g, ""), eq.cost])).entries()].map(([value, display], idx) => (
                    <option key={idx} value={value}>{display}</option>
                  ))}
                </select>
              </div>
              <div className="text-center text-gray-500 text-sm">— OR —</div>
              <div className="grid grid-cols-2 gap-3">
                 {/* Range Inputs */}
                 <select value={costRange.min} onChange={(e) => setCostRange({ ...costRange, min: e.target.value })} className="border rounded px-2">
                    <option value="">Min</option>
                    {[...new Map(equipment.map((eq) => [eq.cost.replace(/[^0-9.]/g, ""), eq.cost])).entries()].map(([value, display], idx) => (
                    <option key={idx} value={value}>{display}</option>
                  ))}
                 </select>
                 <select value={costRange.max} onChange={(e) => setCostRange({ ...costRange, max: e.target.value })} className="border rounded px-2">
                    <option value="">Max</option>
                    {[...new Map(equipment.map((eq) => [eq.cost.replace(/[^0-9.]/g, ""), eq.cost])).entries()].map(([value, display], idx) => (
                    <option key={idx} value={value}>{display}</option>
                  ))}
                 </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setCostModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200">Cancel</button>
              <button
                onClick={() => {
                  if (costRange.min && costRange.max) {
                    setFilters({ ...filters, costMin: costRange.min, costMax: costRange.max });
                  } else if (filters.costMin && !filters.costMax) {
                    setFilters({ ...filters, costMin: filters.costMin, costMax: "" });
                  } else {
                    setFilters({ ...filters, costMin: "", costMax: "" });
                  }
                  setCostModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="space-y-3">
              <div>
                <select
                  value={filters.dateMin && !filters.dateMax ? filters.dateMin : ""}
                  onChange={(e) => {
                    setFilters({ ...filters, dateMin: e.target.value, dateMax: "" });
                    setDateRange({ start: "", end: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Date</option>
                  {equipment.map((eq) => <option key={eq.id} value={eq.date}>{eq.date}</option>)}
                </select>
              </div>
              <div className="text-center text-gray-500 text-sm">— OR —</div>
              <div className="grid grid-cols-2 gap-3">
                <select value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="border rounded px-2">
                   <option value="">Start</option>
                   {Array.from(new Set(equipment.map(eq => eq.date))).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="border rounded px-2">
                   <option value="">End</option>
                   {Array.from(new Set(equipment.map(eq => eq.date))).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setDateModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200">Cancel</button>
              <button
                onClick={() => {
                  if (dateRange.start && dateRange.end) {
                    setFilters({ ...filters, dateMin: dateRange.start, dateMax: dateRange.end });
                  } else if (filters.dateMin && !filters.dateMax) {
                    setFilters({ ...filters, dateMin: filters.dateMin, dateMax: "" });
                  } else {
                    setFilters({ ...filters, dateMin: "", dateMax: "" });
                  }
                  setDateModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {editing.id ? "Edit Equipment Details" : "Add Equipment"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Equipment Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Purchased Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchased Date</label>
                <input
                  type="date"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="text"
                  value={editing.cost}
                  onChange={(e) => setEditing({ ...editing, cost: e.target.value })}
                  disabled={!canEdit}
                  placeholder="$0.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100 uppercase"
                >
                  <option value="Available">Available</option>
                  <option value="Active">Active</option>
                  <option value="Repair">Repair</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                {canEdit ? "Cancel" : "Close"}
              </button>
              {canEdit && (
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}