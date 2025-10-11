import { useState } from "react";
import { Download, Trash } from "lucide-react";

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

  // Sample data (rows for Oct 1-7, 2019) — numeric values stored
  const initial = [
    { id: "1", Date: "2019-10-01", Trucks: 0, Remarks: "Nill" },
    { id: "2", Date: "2019-10-02", Trucks: 2, Remarks: "Paid" },
    { id: "3", Date: "2019-10-03", Trucks: 5, Remarks: "Paid" },
    { id: "4", Date: "2019-10-04", Trucks: 4, Remarks: "Paid" },
    { id: "5", Date: "2019-10-05", Trucks: 2, Remarks: "Nill" },
    { id: "6", Date: "2019-10-06", Trucks: 0, Remarks: "Nill" },
    { id: "7", Date: "2019-10-07", Trucks: 3, Remarks: "Paid" },
  ].map((r) => {
    const d = computeDerived(r.Trucks);
    return {
      ...r,
      Quantity: d.quantity,
      FederalRoyalty: d.federalRoyalty,
      StateHaulage: d.stateHaulage,
      MoU: d.mou,
      Total: d.total,
    };
  });

  const [items, setItems] = useState(initial);
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
const handleAddRow = () => {
  const maxId = Math.max(...items.map((item) => Number(item.id) || 0));
  const newId = (maxId + 1).toString();

  const { quantity, federalRoyalty, stateHaulage, mou, total } = computeDerived(0);

  const newItem = {
    id: newId,
    Date: "",
    Trucks: 0,
    Quantity: quantity,
    FederalRoyalty: federalRoyalty,
    StateHaulage: stateHaulage,
    MoU: mou,
    Total: total,
    Remarks: "",
  };

  setItems((prev) => [...prev, newItem]); // add it
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

  // Helper to format money for display
  const fmt = (v) =>
    typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v;

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleAddRow}
          className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + Add Record
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Header (fixed / sticky) */}
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white z-20">
            <tr className="bg-gray-100 text-left text-gray-600 font-medium text-xs">
              {/* S/N */}
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

              {/* Date */}
              <th className="px-2 py-2 w-35">
                <button
                  onClick={() => setDateModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    dateModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Date
                </button>
              </th>

              {/* No. of Trucks */}
              <th className="px-1 py-2 w-25">
                <button
                  onClick={() => setTrucksModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    trucksModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Trucks
                </button>
              </th>

              {/* Federal Govt Royalty */}
              <th className="px-1 py-2 w-50">
                <button
                  onClick={() => setFederalModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    federalModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Federal Govt Royalty
                </button>
              </th>

              {/* State Govt Haulage Fee */}
              <th className="px-1 py-2 w-50">
                <button
                  onClick={() => setStateModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    stateModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  State Haulage Fee
                </button>
              </th>

              {/* 5% MoU */}
              <th className="px-2 py-2 w-35">
                <button
                  onClick={() => setMouModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    mouModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  5% MoU
                </button>
              </th>

              {/* Total */}
              <th className="px-2 py-2 w-30">
                <button
                  onClick={() => setTotalModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    totalModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Total
                </button>
              </th>

              {/* Remarks */}
              <th className="px-2 py-2 w-30">
                <select
                  value={filters.remarks}
                  onChange={(e) =>
                    setFilters({ ...filters, remarks: e.target.value })
                  }
                  className="border w-21 rounded-lg px-1 py-1 text-sm"
                >
                  <option value="">Remarks</option>
                  <option value="Paid">Paid</option>
                  <option value="Nill">Nill</option>
                </select>
              </th>

              {/* Actions */}
              <th className="px-1 py-2 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
              {visibleItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <td className="px-2 py-2">{item.id}</td>

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

                  <td className="px-2 py-2">
                    {editingRowId === item.id ? (
                      <input
                        type="number"
                        value={item.Trucks}
                        onChange={(e) =>
                          handleFieldChange(item.id, "Trucks", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-25"
                      />
                    ) : (
                      item.Trucks
                    )}
                  </td>

                  <td className="px-2 py-2">{fmt(item.FederalRoyalty)}</td>
                  <td className="px-2 py-2">{fmt(item.StateHaulage)}</td>
                  <td className="px-2 py-2">{item.MoU.toFixed(2)}</td>
                  <td className="px-2 py-2">{fmt(item.Total)}</td>

                  <td className="px-2 py-2">
                    {editingRowId === item.id ? (
                      <select
                        value={item.Remarks}
                        onChange={(e) =>
                          handleFieldChange(item.id, "Remarks", e.target.value)
                        }
                        className="border rounded px-1 py-1 w-auto"
                      >
                        <option value="">Select</option>
                        <option value="Paid">Paid</option>
                        <option value="Nill">Nill</option>
                      </select>
                    ) : (
                      item.Remarks || "-"
                    )}
                  </td>

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
              {visibleItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-2 py-6 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-xs sm:text-sm">
                    {visibleItems.length < filteredItems.length && (
                <div className="text-center py-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-700 transition"
                  >
                    View More
                  </button>
                </div>
              )}
              </tr>
            </tfoot>
        </table>
      </div>

      {/* ---------- MODALS (SINGLE OR RANGE) ---------- */}

      {/* S/N Modal */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold mb-3">Filter by S/N</h3>

            <div>
              <select
                value={filters.snMin && !filters.snMax ? filters.snMin : ""}
                onChange={(e) =>
                  setFilters({ ...filters, snMin: e.target.value, snMax: "" })
                }
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

            <div className="grid grid-cols-2 gap-3">
              <select
                value={snRange.min}
                onChange={(e) => setSnRange({ ...snRange, min: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Min</option>
                {items.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.id}
                  </option>
                ))}
              </select>
              <select
                value={snRange.max}
                onChange={(e) => setSnRange({ ...snRange, max: e.target.value })}
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

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setSnModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
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
                    setFilters({ ...filters, sn: filters.snMin, snMin: "", snMax: "" });
                  } else {
                    setFilters({ ...filters, sn: "", snMin: "", snMax: "" });
                  }
                  setSnModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
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
