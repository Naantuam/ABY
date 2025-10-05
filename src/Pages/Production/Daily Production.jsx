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
    { id: "DP-01", Date: "2019-10-01", Trucks: 0, Remarks: "Nil" },
    { id: "DP-02", Date: "2019-10-02", Trucks: 2, Remarks: "Paid" },
    { id: "DP-03", Date: "2019-10-03", Trucks: 5, Remarks: "Paid" },
    { id: "DP-04", Date: "2019-10-04", Trucks: 4, Remarks: "Paid" },
    { id: "DP-05", Date: "2019-10-05", Trucks: 2, Remarks: "Nil" },
    { id: "DP-06", Date: "2019-10-06", Trucks: 0, Remarks: "Nil" },
    { id: "DP-07", Date: "2019-10-07", Trucks: 3, Remarks: "Paid" },
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

  // local modal ranges (for building the request)
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [trucksRange, setTrucksRange] = useState({ min: "", max: "" });
  const [quantityRange, setQuantityRange] = useState({ min: "", max: "" });
  const [federalRange, setFederalRange] = useState({ min: "", max: "" });
  const [stateRange, setStateRange] = useState({ min: "", max: "" });
  const [mouRange, setMouRange] = useState({ min: "", max: "" });
  const [totalRange, setTotalRange] = useState({ min: "", max: "" });

  // Filtering logic (applies all active filters)
  const filteredItems = items.filter((item, idx) => {
    // S/N: use index+1 as serial
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

    // Date filter (YYYY-MM-DD -> number)
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

    // Remarks dropdown
    const matchRemarks = filters.remarks
      ? item.Remarks === filters.remarks
      : true;

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

  
  const handleAddRow = () => {
  const newId = items.length + 1;
  const { quantity, federalRoyalty, stateHaulage, mou, total } = computeDerived(0); // initialize

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

  setItems((prev) => [...prev, newItem]);
  setEditingRowId(newId); // ✅ immediately enable edit mode for this row
};


  const handleDelete = (id) => {
    setItems((s) => s.filter((it) => it.id !== id));
  };

  const handleFieldChange = (id, field, value) => {
  setItems((prev) =>
    prev.map((item) => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };

        // Recompute derived values only when Trucks changes
        if (field === "Trucks") {
          const { quantity, federalRoyalty, stateHaulage, mou, total } = computeDerived(value);
          updated = {
            ...updated,
            Quantity: quantity,
            FederalRoyalty: federalRoyalty,
            StateHaulage: stateHaulage,
            MoU: mou,
            Total: total,
          };
        }
        return updated;
      }
      return item;
    })
  );
};

  const handleSaveRow = () => setEditingRowId(null);

  // Helper to format money for display
  const fmt = (v) =>
    typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
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
      <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white z-10">
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

              {/* No. of Trucks */}
              <th className="px-1 py-2">
                <button
                  onClick={() => setTrucksModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    trucksModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Trucks
                </button>
              </th>

              {/* Quantities (Tonnes) */}
              <th className="py-2">
                <button
                  onClick={() => setQuantityModalOpen(true)}
                  className={`hover:bg-gray-300 w-25 rounded-lg px-1 py-1 ${
                    quantityModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Quantity (Tonnes)
                </button>
              </th>

              {/* Federal Govt Royalty */}
              <th className="px-1 py-2">
                <button
                  onClick={() => setFederalModalOpen(true)}
                  className={`hover:bg-gray-300 w-25 rounded-lg px-1 py-1 ${
                    federalModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Federal Govt Royalty
                </button>
              </th>

              {/* State Govt Haulage Fee */}
              <th className="px-1 py-2">
                <button
                  onClick={() => setStateModalOpen(true)}
                  className={`hover:bg-gray-300 w-25 rounded-lg px-1 py-1 ${
                    stateModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  State Haulage Fee
                </button>
              </th>

              {/* 5% MoU */}
              <th className="px-2 py-2">
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
              <th className="px-2 py-2">
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
              <th className="px-2 py-2"><select
                value={filters.remarks}
                onChange={(e) => setFilters({ ...filters, remarks: e.target.value })}
                className="border rounded-lg px-2 py-1 text-sm"
                >
                <option value="">Remarks</option>
                {/* Hardcoded options from image */}
                <option value="Paid">Paid</option>
                <option value="Nil">Nil</option>
                </select>
              </th>

              {/* Actions */}
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => (
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
                      onChange={(e) => handleFieldChange(item.id, "Date", e.target.value)}
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

                <td className="px-2 py-2 w-25">{item.Quantity}</td>

                <td className="px-2 py-2">{fmt(item.FederalRoyalty)}</td>

                <td className="px-2 py-2">{fmt(item.StateHaulage)}</td>

                <td className="px-2 py-2">{item.MoU.toFixed(2)}</td>

                <td className="px-2 py-2">{fmt(item.Total)}</td>

                <td className="px-2 py-2">
                  {editingRowId === item.id ? (
                    <select
                      value={item.Remarks}
                      onChange={(e) => handleFieldChange(item.id, "Remarks", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="">Select</option>
                      <option value="Paid">Paid</option>
                      <option value="Nil">Nil</option>
                    </select>
                  ) : (
                    item.Remarks || "-"
                  )}
                </td>

                <td className="px-2 py-2 flex gap-2">
                  {editingRowId === item.id ? (
                    <button
                      onClick={handleSaveRow}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingRowId(item.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}

            {/* empty state */}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={10} className="px-2 py-6 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
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
    </div>
  );
}
