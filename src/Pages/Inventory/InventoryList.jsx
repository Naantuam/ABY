import { useState, useEffect } from "react";
import { Download, Trash, Loader2, Search, Filter, X, Edit } from "lucide-react";
import api from "../../api";

export default function InventoryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => row[field]).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const [editingRowId, setEditingRowId] = useState(null);
  const [originalItem, setOriginalItem] = useState(null); // store item before edit
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "save" or "delete"

  const [filters, setFilters] = useState({
    sn: "",
    snMin: "",
    snMax: "",
    dateMin: "",
    dateMax: "",
    name: "",
    category: "",
    status: "",
  });

  // at top inside EquipmentList
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [visibleCount, setVisibleCount] = useState(10); // show 10 rows initially

  const [showMobileFilters, setShowMobileFilters] = useState(false);




  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/inventory/items/");
      const data = response.data;
      // Handle pagination structure: { results: [], count: ... }
      const arr = Array.isArray(data) ? data : (data.results || []);

      const formatted = arr.map(item => ({
        id: item.id,
        name: item.item_name || item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || "pcs",
        lastUpdated: item.updated_at ? item.updated_at.split('T')[0] : (item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        status: item.status,
      }));

      setItems(formatted);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to load inventory items.");
    } finally {
      setLoading(false);
    }
  };



  // ------------------ Filtering Logic -------------------
  const filteredItems = items.filter((item) => {
    // --- S/N FILTER ---
    // If ID is numeric, filter numerically. If string (e.g. UUID), this might fail.
    // Assuming numeric IDs based on "items/5/" in request.
    const itemSN = Number(item.id);
    const snSingle = filters.sn ? Number(filters.sn.replace(/\D/g, "")) : null;
    const snMin = filters.snMin ? Number(filters.snMin.replace(/\D/g, "")) : null;
    const snMax = filters.snMax ? Number(filters.snMax.replace(/\D/g, "")) : null;

    let matchSN = true;
    if (!isNaN(itemSN)) { // Only apply if ID is numeric
      if (snSingle !== null) {
        matchSN = itemSN === snSingle;
      } else if (snMin !== null || snMax !== null) {
        const min = snMin !== null ? snMin : -Infinity;
        const max = snMax !== null ? snMax : Infinity;
        matchSN = itemSN >= min && itemSN <= max;
      }
    }

    // --- DATE FILTER ---
    const toDateNumber = (dateStr) => (dateStr ? Number(dateStr.replace(/-/g, "")) : 0);
    const itemDateNum = toDateNumber(item.lastUpdated);
    const minNum = filters.dateMin ? toDateNumber(filters.dateMin) : null;
    const maxNum = filters.dateMax ? toDateNumber(filters.dateMax) : null;

    let matchDate = true;
    if (minNum && maxNum) {
      matchDate = itemDateNum >= minNum && itemDateNum <= maxNum;
    } else if (minNum && !maxNum) {
      matchDate = itemDateNum === minNum;
    }

    // --- NAME FILTER ---
    const matchName = filters.name
      ? item.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;

    // --- CATEGORY FILTER ---
    const matchCategory = filters.category
      ? item.category === filters.category
      : true;

    const matchStatus = filters.status ? item.status === filters.status : true;

    // --- Return Combined ---
    return matchSN && matchDate && matchName && matchCategory && matchStatus;
  });

  // 🔹 Status color badges
  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "good" || s === "in_stock") return "bg-green-500 text-white";
    if (s === "average" || s === "low_stock") return "bg-yellow-400 text-black";
    if (s === "poor" || s === "bad" || s === "critical" || s === "restocking") return "bg-red-500 text-white";
    return "bg-gray-400 text-white";
  };

  // Helper to format status for display
  const formatStatus = (status) => {
    if (!status) return "";
    return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  // 🔹 Export CSV
  const handleExport = () => {
    if (filteredItems.length === 0) return alert("No items to export!");
    const csv = convertToCSV(filteredItems);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddItem = () => {
    const newItem = {
      id: `TEMP-${Date.now()}`, // temporary unique id
      name: "",
      category: "",
      quantity: 0,
      unit: "pcs",
      lastUpdated: new Date().toISOString().split('T')[0],
      status: "good" // Default to 'good'
    };
    setItems([newItem, ...items]);
    setEditingRowId(newItem.id); // immediately editable
    setOriginalItem(newItem);
  };



  const handleFieldChange = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
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
      const item = items.find((it) => it.id === id);
      if (!item) return;

      // Map to backend fields
      // Map to backend fields
      const payload = {
        item_name: item.name,
        category: item.category,
        quantity: parseInt(item.quantity, 10),
        unit: item.unit,
        status: item.status
        // Note: 'updated_at' is typically auto-handled by backend, but we can send if needed
      };

      try {
        if (id.toString().startsWith("TEMP-")) {
          // Create
          const response = await api.post("/inventory/items/", payload);
          const newItem = response.data;
          // Replace temp item with real item
          setItems((prev) =>
            prev.map((it) => (it.id === id ? {
              id: newItem.id,
              name: newItem.item_name || newItem.name,
              category: newItem.category,
              quantity: newItem.quantity,
              unit: newItem.unit,
              lastUpdated: newItem.updated_at || newItem.created_at || new Date().toISOString(),
              status: newItem.status
            } : it))
          );
        } else {
          // Update
          const response = await api.put(`/inventory/items/${id}/`, payload);
          const updatedItem = response.data;
          setItems((prev) =>
            prev.map((it) => (it.id === id ? {
              id: updatedItem.id,
              name: updatedItem.item_name || updatedItem.name,
              category: updatedItem.category,
              quantity: updatedItem.quantity,
              unit: updatedItem.unit,
              lastUpdated: updatedItem.updated_at || updatedItem.created_at || new Date().toISOString(),
              status: updatedItem.status
            } : it))
          );
        }
        setEditingRowId(null);
        setOriginalItem(null);
      } catch (err) {
        console.error("Save error details:", err.response?.data);
        alert("Failed to save record: " + JSON.stringify(err.response?.data || err.message));
      }

    } else if (pendingAction.type === "delete") {
      try {
        if (!id.toString().startsWith("TEMP-")) {
          await api.delete(`/inventory/items/${id}/`);
        }
        setItems((prev) => prev.filter((it) => it.id !== pendingAction.id));
      } catch (err) {
        alert("Failed to delete record: " + (err.message));
      }
    }
    setPendingAction(null);
    setShowConfirm(false);
  };


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
              type="text"
              placeholder="Search Name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
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
      <div className="hidden lg:flex justify-between items-center mb-4">
        {/* Add New Item */}
        <button
          onClick={handleAddItem}
          className="bg-blue-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Item
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
        </button>
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
              <th className="px-1 py-1">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="px-1 py-1 w-24 border rounded"
                />
              </th>

              <th className="px-2 py-2">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="border rounded-lg px-1 py-1 text-xs"
                >
                  <option value="">All Categories</option>
                  {/* Dynamically populate categories from items if possible, or static list */}
                  {Array.from(new Set(items.map((it) => it.category).filter(Boolean))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </th>

              <th className="px-2 py-2">Quantity</th>
              <th className="px-2 py-2">Unit</th>
              {/* Last Updated filter button */}
              <th className="px-2 py-2">
                <button
                  onClick={() => setDateModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${dateModalOpen ? "border-2 border-blue-500" : ""
                    }`}
                >
                  Last Updated
                </button>
              </th>

              <th className="px-2 py-2">

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="border rounded-lg px-1 py-1 text-xs"
                >
                  <option value="">All</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredItems].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                {/* ID (non-editable) */}
                <td className="px-2 py-2">{item.id}</td>

                {/* Name */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleFieldChange(item.id, "name", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.name
                  )}
                </td>

                {/* Category */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) =>
                        handleFieldChange(item.id, "category", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.category
                  )}
                </td>

                {/* Quantity */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleFieldChange(item.id, "quantity", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>

                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleFieldChange(item.id, "unit", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.unit
                  )}
                </td>

                {/* Last Updated */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <input
                      type="date"
                      value={item.lastUpdated}
                      onChange={(e) =>
                        handleFieldChange(item.id, "lastUpdated", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.lastUpdated
                  )}
                </td>

                {/* Status */}
                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleFieldChange(item.id, "status", e.target.value)
                      }

                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="poor">Poor</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  )}
                </td>

                {/* Edit / Save */}
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
          <button onClick={handleAddItem} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">+ Add Item</button>
        </div>

        {[...filteredItems].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, visibleCount).map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform">

            {/* Header */}
            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono">#{item.id}</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(
                    item.status
                  )}`}
                >
                  {formatStatus(item.status)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-2 text-xs text-gray-700 font-medium">
              <div><span className="text-gray-500">Cat:</span> {item.category || "-"}</div>
              <div><span className="text-gray-500">Updated:</span> {item.lastUpdated}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
              <div className="flex justify-between"><span className="text-gray-500">Qty:</span> <span className="font-semibold">{item.quantity} {item.unit}</span></div>
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

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Item Name</label>
                <input type="text" placeholder="Search name..." value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Category</label>
                <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">All Categories</option>
                  {Array.from(new Set(items.map((it) => it.category).filter(Boolean))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Status</label>
                <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">All Statuses</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setFilters({ sn: '', snMin: '', snMax: '', dateMin: '', dateMax: '', name: '', category: '', status: '' })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Clear</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* S/N Modal */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select S/N</option>
                  {items.map((inventory) => (
                    <option key={inventory.id} value={inventory.id}>
                      {inventory.id}
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
                    {items.map((inventory) => (
                      <option key={inventory.id} value={inventory.id}>
                        {inventory.id}
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
                    {items.map((inventory) => (
                      <option key={inventory.id} value={inventory.id}>
                        {inventory.id}
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
                    setFilters({
                      ...filters,
                      sn: "",
                      snMin: snRange.min,
                      snMax: snRange.max,
                    });
                  } else if (filters.snMin && !filters.snMax) {
                    // you clicked single S/N dropdown
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
            <div className="space-y-3">
              {/* Single Date */}
              <div>
                <select
                  value={filters.dateMin && !filters.dateMax ? filters.dateMin : ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      dateMin: e.target.value, // ✅ directly into dateMin
                      dateMax: "",
                    });
                    setDateRange({ start: "", end: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Date</option>
                  {Array.from(new Set(items.map((inventory) => inventory.lastUpdated))).map(
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
                    {Array.from(new Set(items.map((inventory) => inventory.lastUpdated))).map(
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
                    {Array.from(new Set(items.map((inventory) => inventory.lastUpdated))).map(
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
                    // ✅ Single date selected (top dropdown)
                    setFilters({
                      ...filters,
                      dateMin: filters.dateMin,
                      dateMax: "", // force single date
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
