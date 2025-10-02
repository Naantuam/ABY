import { useState } from "react";
import { Download } from "lucide-react";

export default function OperationList() {
  // 🔹 Dummy items (based on your sampleData)
  const [items, setItems] = useState([
    {
      id: "Op-01",
      Date: "2025-06-25",
      Description: "Steel Beams",
      Income: 120000,
      Expenditure: 80000,
      Bal: 40000,
      Rate: "5%",
    },
    {
      id: "Op-02",
      Date: "2025-06-26",
      Description: "Concrete Mix",
      Income: 150000,
      Expenditure: 90000,
      Bal: 60000,
      Rate: "3%",
    },
    {
      id: "Op-03",
      Date: "2025-06-27",
      Description: "Welding Rods",
      Income: 180000,
      Expenditure: 100000,
      Bal: 80000,
      Rate: "4%",
    },
    {
      id: "Op-04",
      Date: "2025-06-28",
      Description: "Electric Cables",
      Income: 200000,
      Expenditure: 120000,
      Bal: 80000,
      Rate: "5%",
    },
  ]);

  // 🔹 CSV Export Utility
  function convertToCSV(data) {
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


  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenditureModalOpen, setExpenditureModalOpen] = useState(false);

  const [incomeRange, setIncomeRange] = useState({ min: "", max: "" });
  const [expenditureRange, setExpenditureRange] = useState({ min: "", max: "" });
    

 // ------------------ Filtering Logic -------------------
const filteredItems = items.filter((item) => {
  // --- S/N FILTER ---
  const itemSN = Number(item.id.replace(/\D/g, "")); // turn Op-01 into 1
  const snSingle = filters.sn ? Number(filters.sn.replace(/\D/g, "")) : null;
  const snMin = filters.snMin ? Number(filters.snMin.replace(/\D/g, "")) : null;
  const snMax = filters.snMax ? Number(filters.snMax.replace(/\D/g, "")) : null;

  let matchSN = true;
  if (snSingle !== null) {
    // single selection
    matchSN = itemSN === snSingle;
  } else if (snMin !== null || snMax !== null) {
    // range selection
    const min = snMin !== null ? snMin : -Infinity;
    const max = snMax !== null ? snMax : Infinity;
    matchSN = itemSN >= min && itemSN <= max;
  }

  // --- DATE FILTER ---
  const toDateNumber = (dateStr) => Number(dateStr.replace(/-/g, ""));
  const itemDateNum = toDateNumber(item.Date);
  const minNum = filters.dateMin ? toDateNumber(filters.dateMin) : null;
  const maxNum = filters.dateMax ? toDateNumber(filters.dateMax) : null;

  let matchDate = true;
  if (minNum && maxNum) {
    // range selection
    matchDate = itemDateNum >= minNum && itemDateNum <= maxNum;
  } else if (minNum && !maxNum) {
    // single date
    matchDate = itemDateNum === minNum;
  }

  // --- DESCRIPTION FILTER ---
  const matchDescription = filters.Description
    ? item.Description.toLowerCase().includes(filters.Description.toLowerCase())
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
    id: `TEMP-${Date.now()}`, // temporary unique id
    Date: "",
    Description: "",
    Income: "",
    Expenditure: "",
    Bal: "",
    Rate: ""
  };
  setItems([...items, newItem]);
  setEditingRowId(newItem.id); // immediately editable
};

const handleFieldChange = (id, field, value) => {
  setItems(items.map(item =>
    item.id === id ? { ...item, [field]: value } : item
  ));
};


 const handleSaveRow = (id) => {
  setEditingRowId(null); // finish editing
};


  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
       {/* Add New Operation */}
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Operation
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
          <thead className="sticky top-0 bg-white z-10">
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
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    incomeModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  Income
                </button>
              </th>
              {/* Cost modal button */}
              <th className="px-2 py-2">
                <button
                  onClick={() => setExpenditureModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    expenditureModalOpen ? "border-2 border-blue-500" : ""
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
          {filteredItems.map((item) => (
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
                  item.Income
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
                  item.Expenditure
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
                  item.Bal
                )}
              </td>

              {/* Actions */}
              <td className="px-2 py-2">
                {editingRowId === item.id ? (
                  <button
                    onClick={() => handleSaveRow(item.id)}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

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


    </div>
  );
}
