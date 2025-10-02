import { useState } from "react";
import { Download } from "lucide-react";

export default function RiskList() {
  // ────────────────────────────────
  // 1️⃣ Risks State
  // ────────────────────────────────
  const [risks, setRisks] = useState([
    {
      id: "RA-001",
      date: "2025-06-25",
      project: "Downtown Tower",
      hazardType: "Working at height",
      initialLikelihood: 4,
      initialSeverity: 5,
      initialRiskScore: 20,
      residualLikelihood: 2,
      residualSeverity: 3,
      residualRiskScore: 6,
      controlMeasures: "Harness, safety nets, training",
      status: "Mitigated",
    },
    {
      id: "RA-002",
      date: "2025-06-25",
      project: "Riverside Apartment",
      hazardType: "Heavy Machinery",
      initialLikelihood: 4,
      initialSeverity: 5,
      initialRiskScore: 20,
      residualLikelihood: 4,
      residualSeverity: 5,
      residualRiskScore: 20,
      controlMeasures: "N/A",
      status: "Pending",
    },
    {
      id: "RA-003",
      date: "2025-06-16",
      project: "Greenfield Shopping",
      hazardType: "Electrical Work",
      initialLikelihood: 3,
      initialSeverity: 5,
      initialRiskScore: 15,
      residualLikelihood: 1,
      residualSeverity: 3,
      residualRiskScore: 3,
      controlMeasures: "LOTO, certified electrician",
      status: "Mitigated",
    },
    {
      id: "RA-004",
      date: "2024-06-25",
      project: "Hillside Residential",
      hazardType: "Excavation",
      initialLikelihood: 5,
      initialSeverity: 5,
      initialRiskScore: 25,
      residualLikelihood: 2,
      residualSeverity: 5,
      residualRiskScore: 10,
      controlMeasures: "Trench boxes, daily inspections",
      status: "Mitigated",
    },
    {
      id: "RA-005",
      date: "2023-06-23",
      project: "Building Down tower",
      hazardType: "PVC pipes",
      initialLikelihood: 2,
      initialSeverity: 3,
      initialRiskScore: 6,
      residualLikelihood: 1,
      residualSeverity: 1,
      residualRiskScore: 1,
      controlMeasures: "PPE",
      status: "Mitigated",
    },
  ]);

  // ────────────────────────────────
  // 2️⃣ Filters
  // ────────────────────────────────
  const [filters, setFilters] = useState({
    id: "",
    idMin: "",
    idMax: "",
    dateMin: "",
    dateMax: "",
    date: "",
    project: "",
    status: "",
  });

  // ────────────────────────────────
  // 3️⃣ Modal States
  // ────────────────────────────────
  const [editing, setEditing] = useState(null);
  const [initialLikelihood, setInitialLikelihood] = useState("");
  const [initialSeverity, setInitialSeverity] = useState("");
  const [residualLikelihood, setResidualLikelihood] = useState("");
  const [residualSeverity, setResidualSeverity] = useState("");

  // ────────────────────────────────
  // 3️⃣ Modals + ranges
  // ────────────────────────────────
  const [idModalOpen, setIdModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [idRange, setIdRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // ────────────────────────────────
  // 4️⃣ Computed Scores & Status
  // ────────────────────────────────
  const computedInitialRiskScore =
    (initialLikelihood || 0) * (initialSeverity || 0);
  const computedResidualRiskScore =
    (residualLikelihood || 0) * (residualSeverity || 0);

  let autoStatus = "Pending";
  if (
    computedInitialRiskScore !== 0 &&
    computedResidualRiskScore !== 0 &&
    computedResidualRiskScore < computedInitialRiskScore
  ) {
    autoStatus = "Mitigated";
  }

  const canUpdateStatus =
    initialLikelihood * initialSeverity !== 0 &&
    residualLikelihood * residualSeverity !== 0 &&
    residualLikelihood * residualSeverity <
      initialLikelihood * initialSeverity;

  // ────────────────────────────────
  // 4️⃣ Filter logic
  // ────────────────────────────────
  const filteredRisks = risks.filter((risk) => {
    // ID filter
    const matchID =
      filters.idMin && filters.idMax
        ? risk.id >= filters.idMin && risk.id <= filters.idMax
        : filters.idMin && !filters.idMax
        ? risk.id === filters.idMin
        : true;

    // Date filter
    const matchDate =
      filters.dateMin && filters.dateMax
        ? risk.date >= filters.dateMin && risk.date <= filters.dateMax
        : filters.dateMin && !filters.dateMax
        ? risk.date === filters.dateMin
        : true;

    // Project
    const matchProject = filters.project
      ? risk.project.toLowerCase().includes(filters.project.toLowerCase())
      : true;

    // Status
    const matchStatus = filters.status ? risk.status === filters.status : true;

    return matchID && matchDate && matchProject && matchStatus;
  });

  // ────────────────────────────────
  // 6️⃣ Add New Risk
  // ────────────────────────────────
  const handleAdd = () => {
    const newRisk = {
      id: `RA-${risks.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      project: "",
      hazardType: "",
      initialLikelihood: 1,
      initialSeverity: 1,
      initialRiskScore: 1,
      residualLikelihood: 1,
      residualSeverity: 1,
      residualRiskScore: 1,
      controlMeasures: "",
      status: "Pending",
    };
    setEditing(newRisk);
    setInitialLikelihood(newRisk.initialLikelihood);
    setInitialSeverity(newRisk.initialSeverity);
    setResidualLikelihood(newRisk.residualLikelihood);
    setResidualSeverity(newRisk.residualSeverity);
  };

  // ────────────────────────────────
  // 7️⃣ Save Risk (auto-status)
  // ────────────────────────────────
  const handleSave = () => {
    const riskToSave = {
      ...editing,
      initialLikelihood,
      initialSeverity,
      initialRiskScore: computedInitialRiskScore,
      residualLikelihood,
      residualSeverity,
      residualRiskScore: computedResidualRiskScore,
      status: autoStatus,
    };

    if (risks.find((risk) => risk.id === editing.id)) {
      setRisks((prev) =>
        prev.map((risk) => (risk.id === editing.id ? riskToSave : risk))
      );
    } else {
      setRisks((prev) => [...prev, riskToSave]);
    }
    setEditing(null);
  };

  // ────────────────────────────────
  // 8️⃣ Status Colors
  // ────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case "Mitigated":
        return "bg-green-500 text-white";
      case "Pending":
        return "bg-yellow-400 text-black";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // ────────────────────────────────
  // 9️⃣ CSV Export Utility
  // ────────────────────────────────
  function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((field) => row[field]).join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  const handleExport = () => {
    if (filteredRisks.length === 0) return alert("No Risks to export!");
    const csv = convertToCSV(filteredRisks);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Risk_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {/* Add New Operation */}
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Risk Assessment
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 font-medium">
              <th className="px-2 py-2">
                <button
                  onClick={() => setIdModalOpen(true)}
                  className={`hover:bg-gray-300 w-10 rounded-lg px-1 py-1 ${
                    idModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  ID
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
                  placeholder="Project"
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                  className="px-1 py-1 w-auto rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </th>
              <th className="px-2 py-2">Hazard Type</th>
               <th className="px-2 py-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border rounded-lg px-1 py-1 text-xs"
                >
                  <option value="">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Mitigated">Mitigated</option>
                </select>
              </th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRisks.map((risk) => (
              <tr
                key={risk.id}
                className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <td className="px-2 py-2">{risk.id}</td>
                <td className="px-2 py-2">{risk.date}</td>
                <td className="px-2 py-2">{risk.project}</td>
                <td className="px-2 py-2">{risk.hazardType}</td>
                <td className="px-2 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      risk.status
                    )}`}
                  >
                    {risk.status}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => {
                      setEditing(risk);
                      setInitialLikelihood(risk.initialLikelihood);
                      setInitialSeverity(risk.initialSeverity);
                      setResidualLikelihood(risk.residualLikelihood);
                      setResidualSeverity(risk.residualSeverity);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ─────────────── ID MODAL ─────────────── */}
      {idModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single ID */}
              <div>
                <select
                  value={filters.idMin && !filters.idMax ? filters.idMin : ""}
                  onChange={(e) => {
                    setFilters({ ...filters, idMin: e.target.value, idMax: "" });
                    setIdRange({ min: "", max: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select ID</option>
                  {risks.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center text-gray-500 text-sm">— OR —</div>
              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={idRange.min}
                    onChange={(e) => setIdRange({ ...idRange, min: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {risks.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={idRange.max}
                    onChange={(e) => setIdRange({ ...idRange, max: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {risks.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setIdModalOpen(false)}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (idRange.min && idRange.max) {
                    setFilters({ ...filters, idMin: idRange.min, idMax: idRange.max });
                  } else if (filters.idMin && !filters.idMax) {
                    setFilters({ ...filters, idMin: filters.idMin, idMax: "" });
                  } else {
                    setFilters({ ...filters, idMin: "", idMax: "" });
                  }
                  setIdModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── DATE MODAL ─────────────── */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <div className="space-y-3">
              {/* Single Date */}
              <div>
                <select
                  value={filters.dateMin && !filters.dateMax ? filters.dateMin : ""}
                  onChange={(e) => {
                    setFilters({ ...filters, dateMin: e.target.value, dateMax: "" });
                    setDateRange({ start: "", end: "" });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Date</option>
                  {Array.from(new Set(risks.map((risk) => risk.date))).map(
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
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Start</option>
                    {Array.from(new Set(risks.map((risk) => risk.date))).map(
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
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">End</option>
                    {Array.from(new Set(risks.map((risk) => risk.date))).map(
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
                    setFilters({
                      ...filters,
                      dateMin: dateRange.start,
                      dateMax: dateRange.end,
                    });
                  } else if (filters.dateMin && !filters.dateMax) {
                    setFilters({ ...filters, dateMin: filters.dateMin, dateMax: "" });
                  } else {
                    setFilters({ ...filters, dateMin: "", dateMax: "" });
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {editing?.project
                  ? `${editing.project} Risk Assessment`
                  : "Add New Risk Assessment"}
              </h2>

              {/* Grid of form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
                
                {/* Auto Status */}
                <div>

                  {(() => {
                    // compute status once
                    const status =
                      initialLikelihood * initialSeverity !== 0 &&
                      residualLikelihood * residualSeverity !== 0 &&
                      residualLikelihood * residualSeverity <
                        initialLikelihood * initialSeverity
                        ? "Mitigated"
                        : "Pending";

                    // choose background color based on status
                    const bgClass =
                      status === "Mitigated"
                        ? "bg-green-500 text-white border-green-300"
                        : "bg-yellow-500 text-black border-yellow-300";

                    return (
                      <input
                        type="text"
                        value={status}
                        disabled
                        className={`w-27 font-semibold text-sm border rounded-lg px-4 py-2 ${bgClass}`}
                      />
                    );
                  })()}
                </div>


                {/* Hazard Type */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={editing.hazardType}
                    onChange={(e) =>
                      setEditing({ ...editing, hazardType: e.target.value })
                    }
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Hazard Type"
                  />
                </div>

                {/* Initial Likelihood */}
                <div className="flex flex-col">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Initial Likelihood
                  </label>
                  <select
                    value={initialLikelihood}
                    onChange={(e) => setInitialLikelihood(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 - Rare</option>
                    <option value="2">2 - Unlikely</option>
                    <option value="3">3 - Possible</option>
                    <option value="4">4 - Likely</option>
                    <option value="5">5 - Almost Certain</option>
                  </select>
                </div>

                {/* Initial Severity */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Initial Severity
                  </label>
                  <select
                    value={initialSeverity}
                    onChange={(e) => setInitialSeverity(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 - Negligible</option>
                    <option value="2">2 - Minor</option>
                    <option value="3">3 - Moderate</option>
                    <option value="4">4 - Major</option>
                    <option value="5">5 - Catastrophic</option>
                  </select>
                </div>

                {/* Initial Risk Score */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Initial Risk Score
                  </label>
                  <input
                    type="text"
                    value={initialLikelihood * initialSeverity || "N/A"}
                    disabled
                    className="w-15 text-sm border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  />
                </div>
                </div>

                {/* Residual Likelihood */}
                <div className="flex flex-col">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Residual Likelihood
                  </label>
                  <select
                    value={residualLikelihood}
                    onChange={(e) => setResidualLikelihood(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 - Rare</option>
                    <option value="2">2 - Unlikely</option>
                    <option value="3">3 - Possible</option>
                    <option value="4">4 - Likely</option>
                    <option value="5">5 - Almost Certain</option>
                  </select>
                </div>

                {/* Residual Severity */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Residual Severity
                  </label>
                  <select
                    value={residualSeverity}
                    onChange={(e) => setResidualSeverity(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 - Negligible</option>
                    <option value="2">2 - Minor</option>
                    <option value="3">3 - Moderate</option>
                    <option value="4">4 - Major</option>
                    <option value="5">5 - Catastrophic</option>
                  </select>
                </div>

                {/* Residual Risk Score */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Residual Risk Score
                  </label>
                  <input
                    type="text"
                    value={residualLikelihood * residualSeverity || "N/A"}
                    disabled
                    className="w-15 text-sm border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  />
                </div>
                </div>

                {/* Control Measures */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Control Measures
                  </label>
                  <textarea
                    value={editing.controlMeasures}
                    onChange={(e) =>
                      setEditing({ ...editing, controlMeasures: e.target.value })
                    }
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2"
                    rows="3"
                  />
                </div>

                {/* Date */}
                <div>
                  <input
                    type="date"
                    value={editing.date}
                    readOnly
                    disabled
                    className="w-auto text-sm  rounded-lg px-2 py-1 bg-gray-100"
                  />
                </div>

                
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-2 pt-2 border-t">
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