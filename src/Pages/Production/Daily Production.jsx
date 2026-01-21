import { useState, useEffect } from "react";
import { Download, Trash, Loader2, Search, Filter, X, Edit, Plus, Calendar, DollarSign } from "lucide-react"; // Added Loader2
import api from "../../api";

export default function DailyProduction() {
  // Rates (internal numeric values)
  const FED_RATE = 150; // ₦ per tonne
  const STATE_RATE = 180; // ₦ per tonne
  const TONNES_PER_TRUCK = 30;
  const MOU_PERCENT = 0.05;

  // Helper: compute derived fields for a row given number of trucks
  const computeDerived = (trucks) => {
    const t = Number(trucks) || 0;
    const quantity = t * TONNES_PER_TRUCK;
    const federalRoyalty = quantity * FED_RATE;
    const stateHaulage = quantity * STATE_RATE;
    const mou = (federalRoyalty + stateHaulage) * MOU_PERCENT;
    const total = federalRoyalty + stateHaulage + mou;
    return { quantity, federalRoyalty, stateHaulage, mou, total };
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map backend record to frontend format
  const mapRecordToFrontend = (record) => {
    // Helper to ensure number
    const num = (val) => (val !== undefined && val !== null ? Number(val) : 0);

    // Derived quantity if missing (assuming 30 tonnes per truck)
    let qty = num(record.quantity !== undefined ? record.quantity : record.Quantity);
    if (!qty && (record.trucks || record.Trucks)) {
      qty = num(record.trucks || record.Trucks) * TONNES_PER_TRUCK;
    }

    return {
      id: record.id,
      Date: record.date || record.Date,
      Trucks: num(record.trucks !== undefined ? record.trucks : record.Trucks),
      Quantity: qty,
      FederalRoyalty: num(record.federal_royalty !== undefined ? record.federal_royalty : record.FederalRoyalty),
      StateHaulage: num(record.state_haulage !== undefined ? record.state_haulage : record.StateHaulage),
      MoU: num(record.mou_fee !== undefined ? record.mou_fee : (record.mou !== undefined ? record.mou : record.MoU)),
      Total: num(record.total !== undefined ? record.total : record.Total),
      Remarks: record.remarks || record.Remarks || "",
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/production/");
      const data = response.data;
      // Ensure data is array
      const arr = Array.isArray(data) ? data : (data.results || []);
      const formatted = arr.map(mapRecordToFrontend);
      setItems(formatted);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setError("Failed to load production records.");
    } finally {
      setLoading(false);
    }
  };


  const [editingRowId, setEditingRowId] = useState(null);
  const [originalItem, setOriginalItem] = useState(null); // store item before edit
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "save" or "delete"





  // CSV Export
  function convertToCSV(data) {
    if (!data.length) return "";
    const headers = [
      "id",
      "Date",
      "Trucks",
      "Quantity",
      "FederalRoyalty",
      "StateHaulage",
      "MoU",
      "Total",
      "Remarks",
    ];
    const rows = data.map((row) =>
      headers.map((h) => (row[h] !== undefined ? row[h] : "")).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }

  // Filters and modal states
  const [filters, setFilters] = useState({
    sn: "",
    snMin: "",
    snMax: "",
    dateMin: "",
    dateMax: "",
    trucksMin: "",
    trucksMax: "",
    quantityMin: "",
    quantityMax: "",
    federalMin: "",
    federalMax: "",
    stateMin: "",
    stateMax: "",
    mouMin: "",
    mouMax: "",
    totalMin: "",
    totalMax: "",
    remarks: "", // dropdown filter (Paid / Nil / "")
  });

  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [trucksModalOpen, setTrucksModalOpen] = useState(false);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [federalModalOpen, setFederalModalOpen] = useState(false);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [mouModalOpen, setMouModalOpen] = useState(false);
  const [totalModalOpen, setTotalModalOpen] = useState(false);

  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [trucksRange, setTrucksRange] = useState({ min: "", max: "" });
  const [quantityRange, setQuantityRange] = useState({ min: "", max: "" });
  const [federalRange, setFederalRange] = useState({ min: "", max: "" });
  const [stateRange, setStateRange] = useState({ min: "", max: "" });
  const [mouRange, setMouRange] = useState({ min: "", max: "" });
  const [totalRange, setTotalRange] = useState({ min: "", max: "" });

  const [visibleCount, setVisibleCount] = useState(10); // show 10 rows initially
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Check for active filters
  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  // ✅ Filtering logic first
  const filteredItems = items.filter((item, idx) => {
    const sn = idx + 1;
    const snSingle = filters.sn ? Number(filters.sn.replace(/\D/g, "")) : null;
    const snMin = filters.snMin ? Number(filters.snMin.replace(/\D/g, "")) : null;
    const snMax = filters.snMax ? Number(filters.snMax.replace(/\D/g, "")) : null;
    let matchSN = true;
    if (snSingle !== null) matchSN = sn === snSingle;
    else if (snMin !== null || snMax !== null) {
      const min = snMin !== null ? snMin : -Infinity;
      const max = snMax !== null ? snMax : Infinity;
      matchSN = sn >= min && sn <= max;
    }

    // Date filter
    const toDateNum = (d) => (d ? Number(d.replace(/-/g, "")) : null);
    const itemDateNum = toDateNum(item.Date);
    const dMin = filters.dateMin ? toDateNum(filters.dateMin) : null;
    const dMax = filters.dateMax ? toDateNum(filters.dateMax) : null;
    let matchDate = true;
    if (dMin && dMax) matchDate = itemDateNum >= dMin && itemDateNum <= dMax;
    else if (dMin && !dMax) matchDate = itemDateNum === dMin;

    // Trucks
    const trucks = Number(item.Trucks);
    const tMin = filters.trucksMin ? Number(filters.trucksMin) : null;
    const tMax = filters.trucksMax ? Number(filters.trucksMax) : null;
    let matchTrucks = true;
    if (tMin !== null || tMax !== null) {
      const min = tMin !== null ? tMin : -Infinity;
      const max = tMax !== null ? tMax : Infinity;
      matchTrucks = trucks >= min && trucks <= max;
    }

    // Quantity
    const quantity = Number(item.Quantity);
    const qMin = filters.quantityMin ? Number(filters.quantityMin) : null;
    const qMax = filters.quantityMax ? Number(filters.quantityMax) : null;
    let matchQuantity = true;
    if (qMin !== null || qMax !== null) {
      const min = qMin !== null ? qMin : -Infinity;
      const max = qMax !== null ? qMax : Infinity;
      matchQuantity = quantity >= min && quantity <= max;
    }

    // Federal
    const fed = Number(item.FederalRoyalty);
    const fMin = filters.federalMin ? Number(filters.federalMin) : null;
    const fMax = filters.federalMax ? Number(filters.federalMax) : null;
    let matchFederal = true;
    if (fMin !== null || fMax !== null) {
      const min = fMin !== null ? fMin : -Infinity;
      const max = fMax !== null ? fMax : Infinity;
      matchFederal = fed >= min && fed <= max;
    }

    // State
    const st = Number(item.StateHaulage);
    const sMin = filters.stateMin ? Number(filters.stateMin) : null;
    const sMax = filters.stateMax ? Number(filters.stateMax) : null;
    let matchState = true;
    if (sMin !== null || sMax !== null) {
      const min = sMin !== null ? sMin : -Infinity;
      const max = sMax !== null ? sMax : Infinity;
      matchState = st >= min && st <= max;
    }

    // MoU
    const mou = Number(item.MoU);
    const mMin = filters.mouMin ? Number(filters.mouMin) : null;
    const mMax = filters.mouMax ? Number(filters.mouMax) : null;
    let matchMou = true;
    if (mMin !== null || mMax !== null) {
      const min = mMin !== null ? mMin : -Infinity;
      const max = mMax !== null ? mMax : Infinity;
      matchMou = mou >= min && mou <= max;
    }

    // Total
    const tot = Number(item.Total);
    const totMin = filters.totalMin ? Number(filters.totalMin) : null;
    const totMax = filters.totalMax ? Number(filters.totalMax) : null;
    let matchTotal = true;
    if (totMin !== null || totMax !== null) {
      const min = totMin !== null ? totMin : -Infinity;
      const max = totMax !== null ? totMax : Infinity;
      matchTotal = tot >= min && tot <= max;
    }

    // Remarks
    const matchRemarks = filters.remarks ? item.Remarks === filters.remarks : true;

    return (
      matchSN &&
      matchDate &&
      matchTrucks &&
      matchQuantity &&
      matchFederal &&
      matchState &&
      matchMou &&
      matchTotal &&
      matchRemarks
    );
  });

  // ✅ Then sort and slice for display
  const sortedItems = [...items].sort((a, b) => Number(b.id) - Number(a.id));
  const visibleItems = sortedItems.slice(0, visibleCount);

  // CSV export handler
  const handleExport = () => {
    if (filteredItems.length === 0) return alert("No items to export!");
    const csv = convertToCSV(filteredItems);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DailyProduction.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };


  // Add record
  // Add record
  const handleAddRow = () => {
    // Use a temporary ID for new rows
    const newId = `temp-${Date.now()}`;

    const { quantity, federalRoyalty, stateHaulage, mou, total } = computeDerived(0);

    const newItem = {
      id: newId,
      Date: new Date().toISOString().split('T')[0], // Default to today
      Trucks: 0,
      Quantity: quantity,
      FederalRoyalty: federalRoyalty,
      StateHaulage: stateHaulage,
      MoU: mou,
      Total: total,
      Remarks: "",
    };

    setItems((prev) => [newItem, ...prev]); // Add to top
    setEditingRowId(newId);
    setOriginalItem(newItem);
  };


  const handleDelete = (id) => {
    const itemToDelete = items.find((it) => it.id === id);
    setOriginalItem(itemToDelete);
    setPendingAction({ type: "delete", id });
    setShowConfirm(true);
  };

  const handleFieldChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let updated = { ...item, [field]: value };
          if (field === "Trucks") {
            const { quantity, federalRoyalty, stateHaulage, mou, total } = computeDerived(value);
            updated = { ...updated, Quantity: quantity, FederalRoyalty: federalRoyalty, StateHaulage: stateHaulage, MoU: mou, Total: total };
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveRow = (id) => {
    const currentItem = items.find((it) => it.id === id);
    if (JSON.stringify(currentItem) === JSON.stringify(originalItem)) {
      // No changes → auto-save
      setEditingRowId(null);
      setOriginalItem(null);
      return;
    }
    setPendingAction({ type: "save", id });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    const id = pendingAction?.id;
    if (!id) return;

    if (pendingAction.type === "save") {
      const itemToSave = items.find((it) => it.id === id);
      if (!itemToSave) return;

      // Prepare payload (snake_case)
      const payload = {
        date: itemToSave.Date,
        trucks: Number(itemToSave.Trucks),
        quantity: Number(itemToSave.Quantity),
        federal_royalty: Number(itemToSave.FederalRoyalty),
        state_haulage: Number(itemToSave.StateHaulage),
        mou_fee: Number(itemToSave.MoU),
        total: Number(itemToSave.Total),
        remarks: itemToSave.Remarks,
      };

      try {
        if (id.toString().startsWith("temp-")) {
          // CREATE
          const response = await api.post("/production/", payload);
          const formatted = mapRecordToFrontend(response.data);
          // Replace temp item with real item
          setItems((prev) =>
            prev.map((it) => (it.id === id ? formatted : it))
          );
        } else {
          // UPDATE
          const response = await api.put(`/production/${id}/`, payload);
          const formatted = mapRecordToFrontend(response.data);
          setItems((prev) =>
            prev.map((it) => (it.id === id ? formatted : it))
          );
        }
        setEditingRowId(null);
        setOriginalItem(null);
      } catch (err) {
        alert("Failed to save record: " + (err.response?.data?.detail || err.message));
        // Keep in edit mode?
        // return; 
      }

    } else if (pendingAction.type === "delete") {
      try {
        if (!id.toString().startsWith("temp-")) {
          await api.delete(`/production/${id}/`);
        }
        setItems((prev) => prev.filter((it) => it.id !== id));
      } catch (err) {
        alert("Failed to delete record: " + (err.message));
      }
    }
    setPendingAction(null);
    setShowConfirm(false);
  };

  // Helper to format money for display
  const fmt = (v) =>
    typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

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
              type="text" // Date search or generic? Using dateMin as proxy or just visual for now? 
              // Using generic search for ID or specific logic? 
              // Daily Production filters are numeric/date. Text search might be limited. 
              // We'll mimic EquipmentList visual but maybe map it to SN or Remarks?
              // Let's us SN filter for now or disable if not relevant. 
              // Actually, let's map it to 'sn' or 'remarks'? 
              // User said "advanced filter logic". I'll bind it to SN for now.
              placeholder="Search ID..."
              value={filters.sn}
              onChange={(e) => setFilters({ ...filters, sn: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
            />
          </div>

          {/* Filter Trigger */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`relative p-2.5 rounded-xl border transition-colors ${hasActiveFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
          </button>
        </div>
      </div>

      {/* 🖥️ DESKTOP: Header */}
      <div className="hidden lg:flex flex-row justify-between items-center mb-6 gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daily Production</h2>
          <p className="text-xs text-gray-500">Track trucks, haulage, and royalties</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-1 border px-3 py-2 bg-white text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 shadow-sm"><Download className="w-4 h-4" /> Export</button>
          <button onClick={handleAddRow} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm active:scale-95"><Plus className="w-4 h-4" /> Add Record</button>
        </div>
      </div>

      <div className="bg-white lg:rounded-xl shadow-sm border-t lg:border border-gray-200 overflow-hidden">

        {/* 🖥️ DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-2 py-3 w-20"><button onClick={() => setSnModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${snModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>S/N</button></th>
                <th className="px-2 py-3 w-32"><button onClick={() => setDateModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${dateModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Date</button></th>
                <th className="px-1 py-3 w-24"><button onClick={() => setTrucksModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${trucksModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Trucks</button></th>
                <th className="px-1 py-3 w-40"><button onClick={() => setQuantityModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${quantityModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Quantity</button></th>
                <th className="px-1 py-3 w-40"><button onClick={() => setFederalModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${federalModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Federal</button></th>
                <th className="px-1 py-3 w-40"><button onClick={() => setStateModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${stateModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>State</button></th>
                <th className="px-2 py-3 w-32"><button onClick={() => setMouModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${mouModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>MoU</button></th>
                <th className="px-2 py-3 w-32"><button onClick={() => setTotalModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left ${totalModalOpen ? "bg-blue-50 text-blue-600" : ""}`}>Total</button></th>
                <th className="px-2 py-3 w-32">
                  <select value={filters.remarks} onChange={(e) => setFilters({ ...filters, remarks: e.target.value })} className="bg-transparent w-full outline-none cursor-pointer">
                    <option value="">Remarks</option><option value="Paid">Paid</option><option value="Nill">Nill</option>
                  </select>
                </th>
                <th className="px-1 py-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {visibleItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-2 py-3 font-mono text-gray-600">#{item.id}</td>
                  <td className="px-2 py-3">
                    {editingRowId === item.id ? <input type="date" value={item.Date} onChange={(e) => handleFieldChange(item.id, "Date", e.target.value)} className="border rounded px-2 py-1 w-full text-xs" /> : item.Date}
                  </td>
                  <td className="px-2 py-3">
                    {editingRowId === item.id ? <input type="number" value={item.Trucks} onChange={(e) => handleFieldChange(item.id, "Trucks", e.target.value)} className="border rounded px-2 py-1 w-20 text-xs" /> : item.Trucks}
                  </td>
                  <td className="px-2 py-3 font-mono">{item.Quantity.toLocaleString()}</td>
                  <td className="px-2 py-3 font-mono">{fmt(item.FederalRoyalty)}</td>
                  <td className="px-2 py-3 font-mono">{fmt(item.StateHaulage)}</td>
                  <td className="px-2 py-3 font-mono">{item.MoU.toFixed(2)}</td>
                  <td className="px-2 py-3 font-bold text-gray-900">{fmt(item.Total)}</td>
                  <td className="px-2 py-3">
                    {editingRowId === item.id ?
                      <select value={item.Remarks} onChange={(e) => handleFieldChange(item.id, "Remarks", e.target.value)} className="border rounded px-1 py-1 text-xs"><option value="">Select</option><option value="Paid">Paid</option><option value="Nill">Nill</option></select>
                      : (item.Remarks || "-")}
                  </td>
                  <td className="px-2 py-3 text-right flex justify-end gap-1">
                    {editingRowId === item.id ? (
                      <>
                        <button onClick={() => handleSaveRow(item.id)} className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setEditingRowId(null); setOriginalItem(null); loadData(); }} className="bg-gray-300 text-gray-700 p-1.5 rounded hover:bg-gray-400"><X className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingRowId(item.id); setOriginalItem(item); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash className="w-4 h-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {visibleItems.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-400 text-sm">No records found</td></tr>}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE CARD VIEW */}
        <div className="block lg:hidden bg-gray-50/50 p-4 space-y-4">
          {/* Add Button Mobile */}
          <div className="flex justify-end mb-2">
            <button onClick={handleAddRow} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">+ Add Record</button>
          </div>

          {visibleItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform">

              {/* Header: Date & Total */}
              <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.Date}</h3>
                  <p className="text-[10px] text-gray-400 font-mono">#{item.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">₦{fmt(item.Total)}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${item.Remarks === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.Remarks || 'No Status'}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
                <div className="flex justify-between"><span className="text-gray-500">Trucks:</span> <span className="font-semibold">{item.Trucks}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Qty:</span> <span className="font-semibold">{item.Quantity} t</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fed:</span> <span>{fmt(item.FederalRoyalty)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">State:</span> <span>{fmt(item.StateHaulage)}</span></div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { setEditingRowId(item.id); setOriginalItem(item); }} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"><Edit className="w-3 h-3" /> Edit</button>
                <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"><Trash className="w-3 h-3" /> Delete</button>
              </div>

              {/* Mobile Inline Edit (Simplified) - Just showing notice if trying to edit on mobile for now, or we could render inputs. 
                   For now, the 'Edit' button triggers the same logic, which might look weird on mobile card if we don't handle it. 
                   Implementation choice: Force users to desktop for complex table editing or assume inline replacement works. 
                   The inline logic 'editingRowId === item.id' works for the table. For card, we haven't implemented inputs.
               */}
              {editingRowId === item.id && (
                <div className="mt-2 text-center text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Editing is best done on Desktop due to many columns.
                  <button onClick={() => setEditingRowId(null)} className="ml-2 underline">Cancel</button>
                </div>
              )}
            </div>
          ))}
          {visibleItems.length === 0 && <div className="text-center text-gray-400 text-sm py-8">No records found.</div>}
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
              {/* S/N */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">S/N Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.snMin} onChange={e => setFilters({ ...filters, snMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.snMax} onChange={e => setFilters({ ...filters, snMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={filters.dateMin} onChange={e => setFilters({ ...filters, dateMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="date" value={filters.dateMax} onChange={e => setFilters({ ...filters, dateMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Trucks */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Trucks Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.trucksMin} onChange={e => setFilters({ ...filters, trucksMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.trucksMax} onChange={e => setFilters({ ...filters, trucksMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Quantity Range (Tonnes)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.quantityMin} onChange={e => setFilters({ ...filters, quantityMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.quantityMax} onChange={e => setFilters({ ...filters, quantityMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Federal */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Federal Royalty (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.federalMin} onChange={e => setFilters({ ...filters, federalMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.federalMax} onChange={e => setFilters({ ...filters, federalMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">State Haulage (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.stateMin} onChange={e => setFilters({ ...filters, stateMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.stateMax} onChange={e => setFilters({ ...filters, stateMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* MoU */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">MoU (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.mouMin} onChange={e => setFilters({ ...filters, mouMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.mouMax} onChange={e => setFilters({ ...filters, mouMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Total amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Total Amount (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.totalMin} onChange={e => setFilters({ ...filters, totalMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.totalMax} onChange={e => setFilters({ ...filters, totalMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Remarks</label>
                <div className="flex gap-2">
                  {['', 'Paid', 'Nill'].map(opt => (
                    <button key={opt} onClick={() => setFilters({ ...filters, remarks: opt })} className={`px-4 py-2 rounded-full text-xs font-bold border ${filters.remarks === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {opt || 'All'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setFilters({ sn: '', snMin: '', snMax: '', dateMin: '', dateMax: '', trucksMin: '', trucksMax: '', totalMin: '', totalMax: '', remarks: '' })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Result</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <p className="text-gray-800 mb-4">
              {pendingAction.type === "save"
                ? "Save changes to this row?"
                : "Are you sure you want to delete this row?"}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmAction}
                className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
         Keep existing Modals (S/N, Date, Trucks, etc.) for Desktop Table interactivity.
         Functionality is preserved, just wrapped in the new layout.
      */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by S/N</h3>
            <div>
              <select value={filters.snMin && !filters.snMax ? filters.snMin : ""} onChange={(e) => setFilters({ ...filters, snMin: e.target.value, snMax: "" })} className="w-full border rounded-lg px-3 py-2 mb-3">
                <option value="">Select S/N</option>{items.map((op) => <option key={op.id} value={op.id}>{op.id}</option>)}
              </select>
            </div>
            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>
            <div className="grid grid-cols-2 gap-3">
              <select value={snRange.min} onChange={(e) => setSnRange({ ...snRange, min: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="">Min</option>{items.map((op) => <option key={op.id} value={op.id}>{op.id}</option>)}</select>
              <select value={snRange.max} onChange={(e) => setSnRange({ ...snRange, max: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="">Max</option>{items.map((op) => <option key={op.id} value={op.id}>{op.id}</option>)}</select>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setSnModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={() => { if (snRange.min && snRange.max) setFilters({ ...filters, sn: "", snMin: snRange.min, snMax: snRange.max }); else setFilters({ ...filters, sn: "", snMin: "", snMax: "" }); setSnModalOpen(false); }} className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by Date</h3>

            <div>
              <select
                value={filters.dateMin && !filters.dateMax ? filters.dateMin : ""}
                onChange={(e) =>
                  setFilters({ ...filters, dateMin: e.target.value, dateMax: "" })
                }
                className="w-full border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Select Date</option>
                {Array.from(new Set(items.map((op) => op.Date))).map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Start</option>
                {Array.from(new Set(items.map((op) => op.Date))).map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>

              <select
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">End</option>
                {Array.from(new Set(items.map((op) => op.Date))).map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setDateModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
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
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trucks Modal */}
      {trucksModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by Number of Trucks</h3>

            <div>
              <select
                value={
                  filters.trucksMin && !filters.trucksMax ? filters.trucksMin : ""
                }
                onChange={(e) =>
                  setFilters({ ...filters, trucksMin: e.target.value, trucksMax: "" })
                }
                className="w-full border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Select Trucks</option>
                {Array.from(new Set(items.map((op) => op.Trucks))).map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={trucksRange.min}
                onChange={(e) => setTrucksRange({ ...trucksRange, min: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Min</option>
                {Array.from(new Set(items.map((op) => op.Trucks))).map((val, i) => (
                  <option key={i} value={val}>
                    {val}
                  </option>
                ))}
              </select>

              <select
                value={trucksRange.max}
                onChange={(e) => setTrucksRange({ ...trucksRange, max: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Max</option>
                {Array.from(new Set(items.map((op) => op.Trucks))).map((val, i) => (
                  <option key={i} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setTrucksModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (trucksRange.min && trucksRange.max) {
                    setFilters({ ...filters, trucksMin: trucksRange.min, trucksMax: trucksRange.max });
                  } else if (filters.trucksMin && !filters.trucksMax) {
                    setFilters({ ...filters, trucksMin: filters.trucksMin, trucksMax: "" });
                  } else {
                    setFilters({ ...filters, trucksMin: "", trucksMax: "" });
                  }
                  setTrucksModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {quantityModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by Quantity (Tonnes)</h3>

            <div>
              <select
                value={filters.quantityMin && !filters.quantityMax ? filters.quantityMin : ""}
                onChange={(e) => setFilters({ ...filters, quantityMin: e.target.value, quantityMax: "" })}
                className="w-full border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Select Quantity</option>
                {Array.from(new Set(items.map((op) => op.Quantity))).map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={quantityRange.min}
                onChange={(e) => setQuantityRange({ ...quantityRange, min: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Min</option>
                {Array.from(new Set(items.map((op) => op.Quantity))).map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>

              <select
                value={quantityRange.max}
                onChange={(e) => setQuantityRange({ ...quantityRange, max: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Max</option>
                {Array.from(new Set(items.map((op) => op.Quantity))).map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setQuantityModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={() => {
                if (quantityRange.min && quantityRange.max) {
                  setFilters({ ...filters, quantityMin: quantityRange.min, quantityMax: quantityRange.max });
                } else if (filters.quantityMin && !filters.quantityMax) {
                  setFilters({ ...filters, quantityMin: filters.quantityMin, quantityMax: "" });
                } else {
                  setFilters({ ...filters, quantityMin: "", quantityMax: "" });
                }
                setQuantityModalOpen(false);
              }} className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Federal Modal */}
      {federalModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by Federal Govt Royalty</h3>

            <div>
              <select
                value={filters.federalMin && !filters.federalMax ? filters.federalMin : ""}
                onChange={(e) => setFilters({ ...filters, federalMin: e.target.value, federalMax: "" })}
                className="w-full border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Select Federal Amount</option>
                {Array.from(new Set(items.map((op) => op.FederalRoyalty))).map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>
            <div className="grid grid-cols-2 gap-3">
              <select value={federalRange.min} onChange={(e) => setFederalRange({ ...federalRange, min: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Min</option>
                {Array.from(new Set(items.map((op) => op.FederalRoyalty))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
              <select value={federalRange.max} onChange={(e) => setFederalRange({ ...federalRange, max: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Max</option>
                {Array.from(new Set(items.map((op) => op.FederalRoyalty))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setFederalModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={() => {
                if (federalRange.min && federalRange.max) {
                  setFilters({ ...filters, federalMin: federalRange.min, federalMax: federalRange.max });
                } else if (filters.federalMin && !filters.federalMax) {
                  setFilters({ ...filters, federalMin: filters.federalMin, federalMax: "" });
                } else {
                  setFilters({ ...filters, federalMin: "", federalMax: "" });
                }
                setFederalModalOpen(false);
              }} className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* State Modal */}
      {stateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by State Haulage Fee</h3>

            <div>
              <select value={filters.stateMin && !filters.stateMax ? filters.stateMin : ""} onChange={(e) => setFilters({ ...filters, stateMin: e.target.value, stateMax: "" })} className="w-full border rounded-lg px-3 py-2 mb-3">
                <option value="">Select State Amount</option>
                {Array.from(new Set(items.map((op) => op.StateHaulage))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>
            <div className="grid grid-cols-2 gap-3">
              <select value={stateRange.min} onChange={(e) => setStateRange({ ...stateRange, min: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Min</option>
                {Array.from(new Set(items.map((op) => op.StateHaulage))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
              <select value={stateRange.max} onChange={(e) => setStateRange({ ...stateRange, max: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Max</option>
                {Array.from(new Set(items.map((op) => op.StateHaulage))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setStateModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={() => {
                if (stateRange.min && stateRange.max) {
                  setFilters({ ...filters, stateMin: stateRange.min, stateMax: stateRange.max });
                } else if (filters.stateMin && !filters.stateMax) {
                  setFilters({ ...filters, stateMin: filters.stateMin, stateMax: "" });
                } else {
                  setFilters({ ...filters, stateMin: "", stateMax: "" });
                }
                setStateModalOpen(false);
              }} className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* MoU Modal */}
      {mouModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by 5% MoU</h3>

            <div>
              <select value={filters.mouMin && !filters.mouMax ? filters.mouMin : ""} onChange={(e) => setFilters({ ...filters, mouMin: e.target.value, mouMax: "" })} className="w-full border rounded-lg px-3 py-2 mb-3">
                <option value="">Select MoU</option>
                {Array.from(new Set(items.map((op) => Math.round(op.MoU)))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>
            <div className="grid grid-cols-2 gap-3">
              <select value={mouRange.min} onChange={(e) => setMouRange({ ...mouRange, min: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Min</option>
                {Array.from(new Set(items.map((op) => Math.round(op.MoU)))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
              <select value={mouRange.max} onChange={(e) => setMouRange({ ...mouRange, max: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Max</option>
                {Array.from(new Set(items.map((op) => Math.round(op.MoU)))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setMouModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={() => {
                if (mouRange.min && mouRange.max) {
                  setFilters({ ...filters, mouMin: mouRange.min, mouMax: mouRange.max });
                } else if (filters.mouMin && !filters.mouMax) {
                  setFilters({ ...filters, mouMin: filters.mouMin, mouMax: "" });
                } else {
                  setFilters({ ...filters, mouMin: "", mouMax: "" });
                }
                setMouModalOpen(false);
              }} className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Total Modal */}
      {totalModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by Total</h3>

            <div>
              <select value={filters.totalMin && !filters.totalMax ? filters.totalMin : ""} onChange={(e) => setFilters({ ...filters, totalMin: e.target.value, totalMax: "" })} className="w-full border rounded-lg px-3 py-2 mb-3">
                <option value="">Select Total</option>
                {Array.from(new Set(items.map((op) => Math.round(op.Total)))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>
            <div className="grid grid-cols-2 gap-3">
              <select value={totalRange.min} onChange={(e) => setTotalRange({ ...totalRange, min: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Min</option>
                {Array.from(new Set(items.map((op) => Math.round(op.Total)))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
              <select value={totalRange.max} onChange={(e) => setTotalRange({ ...totalRange, max: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">Max</option>
                {Array.from(new Set(items.map((op) => Math.round(op.Total)))).map((val, idx) => <option key={idx} value={val}>{val}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setTotalModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={() => {
                if (totalRange.min && totalRange.max) {
                  setFilters({ ...filters, totalMin: totalRange.min, totalMax: totalRange.max });
                } else if (filters.totalMin && !filters.totalMax) {
                  setFilters({ ...filters, totalMin: filters.totalMin, totalMax: "" });
                } else {
                  setFilters({ ...filters, totalMin: "", totalMax: "" });
                }
                setTotalModalOpen(false);
              }} className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
