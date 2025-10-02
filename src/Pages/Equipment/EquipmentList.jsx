import { useState } from "react";
import {Download } from "lucide-react";


export default function EquipmentList() {
  const [equipment, setEquipment] = useState([
    {
      id: "Eq-1",
      name: "Excavator CAT 320",
      type: "Heavy Machinery",
      date: "2022-05-10",
      cost: "$120,000",
      status: "Available",
      image: "https://via.placeholder.com/40",
    },
    {
      id: "Eq-2",
      name: "Bulldozer Komatsu D65",
      type: "Heavy Machinery",
      date: "2022-05-15",
      cost: "$120,000",
      status: "Active",
      image: "https://via.placeholder.com/40",
    },
    {
      id: "Eq-3",
      name: "Crane Liebherr 200",
      type: "Heavy Machinery",
      date: "2022-05-15",
      cost: "$120,000",
      status: "Repair",
      image: "https://via.placeholder.com/40",
    },
    {
      id: "Eq-4",
      name: "Concrete Mixer",
      type: "Heavy Machinery",
      date: "2022-05-15",
      cost: "$120,000",
      status: "Retired",
      image: "https://via.placeholder.com/40",
    },
    {
      id: "Eq-5",
      name: "Forklift Toyota",
      type: "Heavy Machinery",
      date: "2022-05-1",
      cost: "$120,000",
      status: "Available",
      image: "https://via.placeholder.com/40",
    },
  ]);

  // 🔹 Utility: Convert JSON → CSV string
function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((field) => row[field]).join(","));
  return [headers.join(","), ...rows].join("\n");
}


  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({
  status: "",
  // S/N filters
  sn: "",
  snMin: "",
  snMax: "",
  // Cost filters
  cost: "",
  costMin: "",
  costMax: "",
  // Date filters
  date: "",
  dateMin: "",
  dateMax: "",
  // Others
  name: "",
  type: ""
});


  // at top inside EquipmentList
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);


  // range states
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [costRange, setCostRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });


  // 🔹 Status color badges
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-400 text-green-100";
      case "Active":
        return "bg-yellow-400 text-yellow-100";
      case "Repair":
        return "bg-red-400 text-red-100";
      case "Retired":
        return "bg-gray-400 text-gray-100";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

 // 🔹 Export to CSV logic
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

const filteredEquipment = equipment.filter((item) => {
  const itemSN = Number(item.id.replace(/\D/g, ""));  

  // --- filters ---
  const snSingle = filters.sn
    ? Number(filters.sn.replace(/\D/g, ""))
    : null;
  const snMin = filters.snMin
    ? Number(filters.snMin.replace(/\D/g, ""))
    : null;
  const snMax = filters.snMax
    ? Number(filters.snMax.replace(/\D/g, ""))
    : null;

  let matchSN = true;
  if (snSingle !== null) {
    matchSN = itemSN === snSingle;
  } else if (snMin !== null || snMax !== null) {
    const min = snMin !== null ? snMin : -Infinity;
    const max = snMax !== null ? snMax : Infinity;
    matchSN = itemSN >= min && itemSN <= max;
  }

  // --- Cost filter ---
  const cost = Number(item.cost.replace(/\D/g, "")); // strips $ and commas
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
const toDateNumber = (dateStr) => Number(dateStr.replace(/-/g, ""));

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

  const matchStatus = filters.status ? item.status === filters.status : true;

  // --- Return combined filter result ---
  return matchSN && matchCost && matchDate && matchName && matchType && matchStatus;
});

  // 🔹 Add new equipment
  const handleAdd = () => {
    const newItem = {
      id: `Eq-${equipment.length + 1}`,
      name: "",
      type: "",
      date: "",
      cost: "",
      status: "Available",
      image: "https://via.placeholder.com/40",
    };
    setEditing(newItem);
  };

  // 🔹 Save edited or new equipment
  const handleSave = () => {
    if (equipment.find((eq) => eq.id === editing.id)) {
      // update existing
      setEquipment((prev) =>
        prev.map((eq) => (eq.id === editing.id ? editing : eq))
      );
    } else {
      // add new
      setEquipment((prev) => [...prev, editing]);
    }
    setEditing(null);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
       {/* Add New Equipment */}
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Equipment
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1 border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          {/* Export */}
        </button>
      </div>

        {/* Table */}
      <div className="overflow-x-auto">
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
                  placeholder="Names"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="px-1 py-1 w-24"
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
            {filteredEquipment.map((eq) => (
              <tr key={eq.id} className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm">
                <td className="px-2 py-2">{eq.id}</td>
                <td className="px-2 py-2">{eq.name}</td>
                <td className="px-2 py-2">{eq.type}</td>
                <td className="px-2 py-2">{eq.date}</td>
                <td className="px-2 py-2">{eq.cost}</td>
                <td className="px-2 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(eq.status)}`}
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
          </tbody>
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
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.id}
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
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.id}
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
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.id}
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
                    snMax: snRange.max
                  });
                } else if (filters.snMin && !filters.snMax) {
                  // you clicked single S/N dropdown
                  setFilters({
                    ...filters,
                    sn: filters.snMin,
                    snMin: "",
                    snMax: ""
                  });
                } else {
                  setFilters({
                    ...filters,
                    sn: "",
                    snMin: "",
                    snMax: ""
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


  {/* Cost Modal */}
  {costModalOpen && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
        <div className="space-y-3">
          {/* Single Cost */}
          <div>
            <select
              value={filters.costMin && !filters.costMax ? filters.costMin : ""}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  costMin: e.target.value,
                  costMax: "", 
                });
                setCostRange({ min: "", max: "" });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Select Cost</option>
              {[...new Map(
                equipment.map((eq) => [
                  eq.cost.replace(/[^0-9]/g, ""), // key
                  eq.cost // display
                ])
              ).entries()].map(([value, display], idx) => (
                <option key={idx} value={value}>
                  {display}
                </option>
              ))}
            </select>

          </div>

          <div className="text-center text-gray-500 text-sm">— OR —</div>

          {/* Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <select
              value={costRange.min}
              onChange={(e) =>
                setCostRange({
                  ...costRange,
                  min: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Min</option>
              {[...new Map(
                equipment.map((eq) => [
                  eq.cost.replace(/[^0-9]/g, ""), // key
                  eq.cost // display
                ])
              ).entries()].map(([value, display], idx) => (
                <option key={idx} value={value}>
                  {display}
                </option>
              ))}
            </select>

            </div>
            <div>
              <select
                value={costRange.max}
                onChange={(e) =>
                  setCostRange({
                    ...costRange,
                    max: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Max</option>
                {[...new Map(
                  equipment.map((eq) => [
                    eq.cost.replace(/[^0-9]/g, ""), // key
                    eq.cost // display
                  ])
                ).entries()].map(([value, display], idx) => (
                  <option key={idx} value={value}>
                    {display}
                  </option>
                ))}
              </select>

            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <button onClick={() => setCostModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors">Cancel</button>
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
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.date}>
                  {eq.date}
                </option>
              ))}
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
                {Array.from(new Set(equipment.map(eq => eq.date))).map(date => (
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">End</option>
                {Array.from(new Set(equipment.map(eq => eq.date))).map(date => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <button onClick={() => setDateModalOpen(false)} className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors">Cancel</button>
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


      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {equipment.find((eq) => eq.id === editing.id)
                ? "Edit Equipment Details"
                : "Add Equipment"}
            </h2>

            {/* Form fields in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Equipment Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name
                </label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* Purchased Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchased Date
                </label>
                <input
                  type="date"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost
                </label>
                <input
                  type="text"
                  value={editing.cost}
                  onChange={(e) => setEditing({ ...editing, cost: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* Status – full width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option>Available</option>
                  <option>Active</option>
                  <option>Repair</option>
                  <option>Retired</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

