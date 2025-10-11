import { useState } from "react";
import { Download, Trash } from "lucide-react";

export default function InventoryList() {
  const [items, setItems] = useState([
    {
      id: "1",
      name: "Steel Beams",
      category: "Structural",
      quantity: "250 Pieces",
      lastUpdated: "2025-06-25",
      status: "In Stock",
    },
    {
      id: "2",
      name: "Empty Bags",
      category: "Materials",
      quantity: "1200 Bags",
      lastUpdated: "2025-06-25",
      status: "In Stock",
    },
    {
      id: "3",
      name: "Welding Electrodes",
      category: "Electrical",
      quantity: "85 Sheets",
      lastUpdated: "2025-06-16",
      status: "In Stock",
    },
    {
      id: "4",
      name: "Electric Wiring",
      category: "Electrical",
      quantity: "350 Meters",
      lastUpdated: "2024-06-25",
      status: "Low Stock",
    },
    {
      id: "5",
      name: "PVC pipes",
      category: "Plumbing",
      quantity: "45 Pieces",
      lastUpdated: "2023-06-23",
      status: "Restocking",
    },
  ]);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
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
    const toDateNumber = (dateStr) => Number(dateStr.replace(/-/g, ""));
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
    switch (status) {
      case "In Stock":
        return "bg-green-500 text-white";
      case "Low Stock":
        return "bg-yellow-400 text-black";
      case "Restocking":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

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
    quantity: "",
    lastUpdated: "",
    status: "Active" // or default status you prefer
  };
  setItems([...items, newItem]);
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

const confirmAction = () => {
  if (pendingAction.type === "save") {
    setEditingRowId(null);
    setOriginalItem(null);
  } else if (pendingAction.type === "delete") {
    setItems((prev) => prev.filter((it) => it.id !== pendingAction.id));
  }
  setPendingAction(null);
  setShowConfirm(false);
};


return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
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

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
            <thead>
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
                    placeholder="Item Name"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="px-1 py-1 w-24"
                  />
                </th>

                <th className="px-2 py-2">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="border rounded-lg px-1 py-1 text-xs"
                  >
                    <option value="">All Categories</option>
                    <option value="Structural">Structural</option>
                    <option value="Materials">Materials</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                  </select>
                </th>

                <th className="px-2 py-2">Quantity</th>
                {/* Last Updated filter button */}
                <th className="px-2 py-2">
                  <button
                    onClick={() => setDateModalOpen(true)}
                    className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                      dateModalOpen ? "border-2 border-blue-500" : ""
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
                    <option value="In Stock">In Stock</option>
                    <option value="Restocking">Restocking</option>
                    <option value="Low Stock">Low Stock</option>
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
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                      {/* add more status options as needed */}
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
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
                <td colSpan={7} className="px-2 py-6 text-center text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold text-xs sm:text-sm">
              {visibleCount < filteredItems.length && (
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
        </div>

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
