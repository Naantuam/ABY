import { useState, useEffect } from "react";
import { Download, Trash, Loader2, Search, Filter, X, Edit } from "lucide-react";
import api from "../../api";

export default function OperationList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map backend record to frontend format
  const mapRecordToFrontend = (record) => ({
    id: String(record.id),
    Date: record.date,
    Description: record.description,
    Income: Number(record.income),
    Expenditure: Number(record.expenditure),
    Rate: String(record.rate), // keep as string if preferred for input, or number
    Bal: Number(record.balance)
  });

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/operation/");
      const data = response.data;
      const results = Array.isArray(data) ? data : (data.results || []);
      setItems(results.map(mapRecordToFrontend));
    } catch (err) {
      console.error("Failed to fetch operations:", err);
      setError("Failed to load operations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => row[field]).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  // 🔹 Filters
  const [filters, setFilters] = useState({
    sn: "",
    snMin: "",
    snMax: "",
    date: "",
    dateMin: "",
    dateMax: "",
    Description: "",
    incomeMin: "",
    incomeMax: "",
    expenditureMin: "",
    expenditureMax: ""
  });

  const [editingRowId, setEditingRowId] = useState(null);
  const [originalItem, setOriginalItem] = useState(null); // store item before edit
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "save" or "delete"

  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenditureModalOpen, setExpenditureModalOpen] = useState(false);
  const [incomeRange, setIncomeRange] = useState({ min: "", max: "" });
  const [expenditureRange, setExpenditureRange] = useState({ min: "", max: "" });
  const [visibleCount, setVisibleCount] = useState(10);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ------------------ Filtering Logic -------------------
  const filteredItems = items.filter((item) => {
    // --- S/N FILTER ---
    const itemSN = Number(item.id.replace(/\D/g, ""));
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

    // --- DATE FILTER ---
    const toDateNumber = (dateStr) => (dateStr ? Number(dateStr.replace(/-/g, "")) : 0);
    const itemDateNum = toDateNumber(item.Date);
    const minNum = filters.dateMin ? toDateNumber(filters.dateMin) : null;
    const maxNum = filters.dateMax ? toDateNumber(filters.dateMax) : null;

    let matchDate = true;
    if (minNum && maxNum) {
      matchDate = itemDateNum >= minNum && itemDateNum <= maxNum;
    } else if (minNum && !maxNum) {
      matchDate = itemDateNum === minNum;
    }

    // --- DESCRIPTION FILTER ---
    const matchDescription = filters.Description
      ? (item.Description || "").toLowerCase().includes(filters.Description.toLowerCase())
      : true;

    // --- INCOME FILTER ---
    const incMin = filters.incomeMin ? Number(filters.incomeMin) : null;
    const incMax = filters.incomeMax ? Number(filters.incomeMax) : null;

    let matchIncome = true;
    if (incMin && incMax) {
      matchIncome = item.Income >= incMin && item.Income <= incMax;
    } else if (incMin && !incMax) {
      matchIncome = item.Income === incMin;
    }

    // --- EXPENDITURE FILTER ---
    const expMin = filters.expenditureMin ? Number(filters.expenditureMin) : null;
    const expMax = filters.expenditureMax ? Number(filters.expenditureMax) : null;

    let matchExpenditure = true;
    if (expMin && expMax) {
      matchExpenditure = item.Expenditure >= expMin && item.Expenditure <= expMax;
    } else if (expMin && !expMax) {
      matchExpenditure = item.Expenditure === expMin;
    }

    return matchSN && matchDate && matchDescription && matchIncome && matchExpenditure;
  });

  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  // 🔹 Export CSV
  const handleExport = () => {
    if (filteredItems.length === 0) return alert("No items to export!");
    const csv = convertToCSV(filteredItems);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Operation_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdd = () => {
    const newItem = {
      id: `TEMP-${Date.now()}`,
      Date: new Date().toISOString().split("T")[0],
      Description: "",
      Income: 0,
      Expenditure: 0,
      Bal: 0,
      Rate: ""
    };
    setItems([newItem, ...items]);
    setEditingRowId(newItem.id);
    setOriginalItem(newItem);
  };

  const handleFieldChange = (id, field, value) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto-calc balance if income/expenditure changes
        if (field === 'Income' || field === 'Expenditure') {
          updated.Bal = Number(updated.Income || 0) - Number(updated.Expenditure || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleDelete = (id) => {
    const itemToDelete = items.find((it) => it.id === id);
    setOriginalItem(itemToDelete);
    setPendingAction({ type: "delete", id });
    setShowConfirm(true);
  };

  const handleSaveRow = (id) => {
    const currentItem = items.find((it) => it.id === id);
    if (JSON.stringify(currentItem) === JSON.stringify(originalItem)) {
      setEditingRowId(null);
      setOriginalItem(null);
      return;
    }
    setPendingAction({ type: "save", id });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (pendingAction.type === "save") {
      const id = pendingAction.id;
      const item = items.find(it => it.id === id);
      if (!item) return;

      const payload = {
        date: item.Date,
        description: item.Description,
        income: Number(item.Income),
        expenditure: Number(item.Expenditure),
        rate: Number(item.Rate),
      };

      try {
        if (String(id).startsWith("TEMP-")) {
          // CREATE
          const response = await api.post("/operation/", payload);
          const savedItem = mapRecordToFrontend(response.data);
          setItems(prev => prev.map(it => it.id === id ? savedItem : it));
        } else {
          // UPDATE
          const response = await api.put(`/operation/${id}/`, payload);
          const savedItem = mapRecordToFrontend(response.data);
          setItems(prev => prev.map(it => it.id === id ? savedItem : it));
        }



        setEditingRowId(null);
        setOriginalItem(null);
      } catch (err) {
        console.error("Save failed", err);
        alert("Failed to save operation: " + (err.response?.data?.detail || err.message));
      }

    } else if (pendingAction.type === "delete") {
      const id = pendingAction.id;
      try {
        if (!String(id).startsWith("TEMP-")) {
          await api.delete(`/operation/${id}/`);
        }
        setItems((prev) => prev.filter((it) => it.id !== id));


      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete operation");
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
          onClick={fetchOperations}
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
              type="text"
              placeholder="Search ID or Description..."
              value={filters.Description}
              onChange={(e) => setFilters({ ...filters, Description: e.target.value })}
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

      {/* Header (Desktop) */}
      <div className="hidden lg:flex flex-col gap-4 mb-4">



        <div className="flex justify-between items-center">
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Operation
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="hidden lg:block overflow-x-auto max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="bg-gray-100 text-left text-gray-600 font-medium">
              {/* S/N filter button */}
              <th className="px-2 py-2">
                <button
                  onClick={() => setSnModalOpen(true)}
                  className={`hover:bg-gray-300 w-10 rounded-lg px-1 py-1 ${snModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                >
                  S/N
                </button>
              </th>
              <th className="px-2 py-2">
                <button
                  onClick={() => setDateModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${dateModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                >
                  Date
                </button>
              </th>
              <th className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={filters.Description}
                  onChange={(e) =>
                    setFilters({ ...filters, Description: e.target.value })
                  }
                  className="px-1 py-1 w-32 border rounded"
                />
              </th>
              {/* Cost modal button */}
              <th className="px-2 py-2">
                <button
                  onClick={() => setIncomeModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${incomeModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                >
                  Income
                </button>
              </th>
              {/* Cost modal button */}
              <th className="px-2 py-2">
                <button
                  onClick={() => setExpenditureModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${expenditureModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                >
                  Expenditure
                </button>
              </th>
              <th className="px-2 py-2">Rate</th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredItems].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((item) => (
              <tr
                key={item.id + item.Date}
                className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                {/* ID */}
                <td className="px-2 py-2">{item.id}</td>

                {/* Date */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="date"
                      value={item.Date}
                      onChange={(e) =>
                        handleFieldChange(item.id, "Date", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.Date
                  )}
                </td>

                {/* Description */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="text"
                      value={item.Description}
                      onChange={(e) =>
                        handleFieldChange(item.id, "Description", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.Description
                  )}
                </td>

                {/* Income */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="number"
                      value={item.Income}
                      onChange={(e) =>
                        handleFieldChange(item.id, "Income", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    fmt(item.Income)
                  )}
                </td>

                {/* Expenditure */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="number"
                      value={item.Expenditure}
                      onChange={(e) =>
                        handleFieldChange(item.id, "Expenditure", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    fmt(item.Expenditure)
                  )}
                </td>

                {/* Rate */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="text"
                      value={item.Rate}
                      onChange={(e) =>
                        handleFieldChange(item.id, "Rate", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.Rate
                  )}
                </td>

                {/* Balance */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="number"
                      value={item.Bal}
                      onChange={(e) =>
                        handleFieldChange(item.id, "Bal", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    fmt(item.Bal)
                  )}
                </td>

                {/* Actions */}
                <td className="px-2 py-2 flex gap-1">
                  {editingRowId === item.id ? (
                    <>
                      <button
                        onClick={() => handleSaveRow(item.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingRowId(item.id);
                        setOriginalItem(item);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {[...filteredItems].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).length === 0 && (
              <tr>
                <td colSpan={8} className="px-2 py-6 text-center text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold text-xs sm:text-sm">
              {visibleCount < filteredItems.length && (
                <td colSpan={8} className="px-2 py-4 text-center">
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
      </div>

      {/* 📱 MOBILE CARD VIEW */}
      <div className="block lg:hidden bg-gray-50/50 space-y-4">
        {/* Add Button Mobile */}
        <div className="flex justify-end mb-2">
          <button onClick={handleAdd} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">+ Add Record</button>
        </div>

        {[...filteredItems].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform">

            {/* Header */}
            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{item.Date}</h3>
                <p className="text-[10px] text-gray-400 font-mono">#{item.id}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${item.Bal >= 0 ? "text-green-600" : "text-red-600"}`}>Bal: ₦{fmt(item.Bal)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-2 text-xs text-gray-700 font-medium">
              {item.Description || "No description"}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
              <div className="flex justify-between"><span className="text-gray-500">Income:</span> <span className="font-semibold text-green-600">₦{fmt(item.Income)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expenditure:</span> <span className="font-semibold text-red-500">₦{fmt(item.Expenditure)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rate:</span> <span>{item.Rate || "-"}</span></div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => { setEditingRowId(item.id); setOriginalItem(item); }} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"><Edit className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"><Trash className="w-3 h-3" /> Delete</button>
            </div>

            {editingRowId === item.id && (
              <div className="mt-2 text-center text-xs text-orange-600 bg-orange-50 p-2 rounded">
                ⚠️ Editing is best done on Desktop.
                <button onClick={() => setEditingRowId(null)} className="ml-2 underline">Cancel</button>
              </div>
            )}
          </div>
        ))}
        {[...filteredItems].length === 0 && <div className="text-center text-gray-400 text-sm py-8">No records found.</div>}

        {/* View More Mobile */}
        {visibleCount < filteredItems.length && (
          <div className="text-center py-4">
            <button onClick={() => setVisibleCount(prev => prev + 10)} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">Load More</button>
          </div>
        )}
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

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label>
                <input type="text" placeholder="Search description..." value={filters.Description} onChange={e => setFilters({ ...filters, Description: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>

              {/* Income */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Income Range (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.incomeMin} onChange={e => setFilters({ ...filters, incomeMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.incomeMax} onChange={e => setFilters({ ...filters, incomeMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>

              {/* Expenditure */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Expenditure Range (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.expenditureMin} onChange={e => setFilters({ ...filters, expenditureMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                  <input type="number" placeholder="Max" value={filters.expenditureMax} onChange={e => setFilters({ ...filters, expenditureMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setFilters({ sn: '', snMin: '', snMax: '', date: '', dateMin: '', dateMax: '', Description: '', incomeMin: '', incomeMax: '', expenditureMin: '', expenditureMax: '' })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Clear</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* S/N Modal */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by S/N</h3>
            {/* Single S/N */}
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
                className="w-full border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Select S/N</option>
                {items.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm mb-3">— OR —</div>

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
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Min</option>
                  {items.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.id}
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
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Max</option>
                  {items.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.id}
                    </option>
                  ))}
                </select>
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
                    setFilters({
                      ...filters,
                      sn: "",
                      snMin: snRange.min,
                      snMax: snRange.max,
                    });
                  } else if (filters.snMin && !filters.snMax) {
                    setFilters({
                      ...filters,
                      sn: filters.snMin,
                      snMin: "",
                      snMax: "",
                    });
                  } else {
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

      {/* Date Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by Date</h3>
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
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Start</option>
                  {Array.from(new Set(items.map((op) => op.Date))).map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
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
                    setFilters({
                      ...filters,
                      dateMin: dateRange.start,
                      dateMax: dateRange.end,
                    });
                  } else if (filters.dateMin && !filters.dateMax) {
                    setFilters({
                      ...filters,
                      dateMin: filters.dateMin,
                      dateMax: "",
                    });
                  } else {
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

      {/* Income Modal */}
      {incomeModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single Income */}
              <div>
                <select
                  value={
                    filters.incomeMin && !filters.incomeMax ? filters.incomeMin : ""
                  }
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      incomeMin: e.target.value,
                      incomeMax: "",
                    });
                    setIncomeRange({ min: "", max: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Income</option>
                  {[...new Set(items.map((it) => it.Income))].map((val, idx) => (
                    <option key={idx} value={val}>
                      {val.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-gray-500 text-sm">— OR —</div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={incomeRange.min}
                    onChange={(e) =>
                      setIncomeRange({ ...incomeRange, min: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {[...new Set(items.map((it) => it.Income))].map((val, idx) => (
                      <option key={idx} value={val}>
                        {val.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={incomeRange.max}
                    onChange={(e) =>
                      setIncomeRange({ ...incomeRange, max: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {[...new Set(items.map((it) => it.Income))].map((val, idx) => (
                      <option key={idx} value={val}>
                        {val.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setIncomeModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (incomeRange.min && incomeRange.max) {
                    setFilters({
                      ...filters,
                      incomeMin: incomeRange.min,
                      incomeMax: incomeRange.max,
                    });
                  } else if (filters.incomeMin && !filters.incomeMax) {
                    setFilters({
                      ...filters,
                      incomeMin: filters.incomeMin,
                      incomeMax: "",
                    });
                  } else {
                    setFilters({ ...filters, incomeMin: "", incomeMax: "" });
                  }
                  setIncomeModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expenditure Modal */}
      {expenditureModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single Expenditure */}
              <div>
                <select
                  value={
                    filters.expenditureMin && !filters.expenditureMax
                      ? filters.expenditureMin
                      : ""
                  }
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      expenditureMin: e.target.value,
                      expenditureMax: "",
                    });
                    setExpenditureRange({ min: "", max: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Expenditure</option>
                  {[...new Set(items.map((it) => it.Expenditure))].map((val, idx) => (
                    <option key={idx} value={val}>
                      {val.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-gray-500 text-sm">— OR —</div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={expenditureRange.min}
                    onChange={(e) =>
                      setExpenditureRange({ ...expenditureRange, min: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {[...new Set(items.map((it) => it.Expenditure))].map((val, idx) => (
                      <option key={idx} value={val}>
                        {val.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={expenditureRange.max}
                    onChange={(e) =>
                      setExpenditureRange({ ...expenditureRange, max: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {[...new Set(items.map((it) => it.Expenditure))].map((val, idx) => (
                      <option key={idx} value={val}>
                        {val.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setExpenditureModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (expenditureRange.min && expenditureRange.max) {
                    setFilters({
                      ...filters,
                      expenditureMin: expenditureRange.min,
                      expenditureMax: expenditureRange.max,
                    });
                  } else if (filters.expenditureMin && !filters.expenditureMax) {
                    setFilters({
                      ...filters,
                      expenditureMin: filters.expenditureMin,
                      expenditureMax: "",
                    });
                  } else {
                    setFilters({
                      ...filters,
                      expenditureMin: "",
                      expenditureMax: "",
                    });
                  }
                  setExpenditureModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
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

    </div>
  );
}
