import { useState } from "react";
import { Plus, Download } from "lucide-react";
import UserProfileModal from "./EmployeeProfileModal";

// 🔹 Utility: Convert JSON → CSV string
function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((field) => row[field]).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export default function Employees() {
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "08123456789", rank: "Administrator", amount: "20000" },
    { id: 2, name: "Jane Doe", email: "jane.doe@example.com", phone: "08123456789", rank: "Manager", amount: "55000" },
    { id: 3, name: "Alice Brown", email: "alice.brown@example.com", phone: "08123456789", rank: "Staff", amount: "100000" },
    { id: 4, name: "Mark Lee", email: "mark.lee@example.com", phone: "08123456789", rank: "Administrator", amount: "150000" },
    { id: 5, name: "David Kim", email: "david.kim@example.com", phone: "08123456789", rank: "Staff", amount: "40000" },
  ]);

  const [filters, setFilters] = useState({
  sn: "",      
  snMin: "",    
  snMax: "",
  name: "",
  email: "",
  phone: "",
  rank: "",
  amountMin: "",
  amountMax: "",
});

const snList = employees.map((_, idx) => idx + 1); // [1,2,3,4,5]
// Get unique amounts sorted
const amountList = [...new Set(employees.map(e => Number(e.amount)))]
  .sort((a, b) => a - b);


const [snModalOpen, setSnModalOpen] = useState(false);
const [snRange, setSnRange] = useState({ min: "", max: "" });

const [amountModalOpen, setAmountModalOpen] = useState(false);
const [amountRange, setAmountRange] = useState({ min: "", max: "" });

// user being edited
const [editingRowId, setEditingRowId] = useState(null);

// for modal
const [selectedEmployee, setSelectedEmployee] = useState(null);
const [editingEmployee, setEditingEmployee] = useState(null);

const filteredEmployees = employees.filter((emp, idx) => {
  // We’ll use employee ID directly for S/N if it exists; 
  // otherwise fallback to array index + 1
 const sn = emp.id ?? idx + 1;

  // --- S/N filter ---
  const snSingle =
    filters.sn !== "" && filters.sn !== null ? Number(filters.sn) : null;
  const snMin =
    filters.snMin !== "" && filters.snMin !== null ? Number(filters.snMin) : null;
  const snMax =
    filters.snMax !== "" && filters.snMax !== null ? Number(filters.snMax) : null;

  let matchSN = true;
  if (snSingle !== null) {
    // single exact match
    matchSN = sn === snSingle;
  } else if (snMin !== null || snMax !== null) {
    // inclusive range
    const min = snMin !== null ? snMin : -Infinity;
    const max = snMax !== null ? snMax : Infinity;
    matchSN = sn >= min && sn <= max;
  }

  // --- Amount filter ---
  const empAmount = Number(emp.amount);
  const amountMin =
    filters.amountMin !== "" && filters.amountMin !== null
      ? Number(filters.amountMin)
      : null;
  const amountMax =
    filters.amountMax !== "" && filters.amountMax !== null
      ? Number(filters.amountMax)
      : null;

  let matchAmount = true;
  if (amountMin !== null && amountMax === null) { // readOnly
    // exact match if only min specified
    matchAmount = empAmount === amountMin;
  } else if (amountMin !== null || amountMax !== null) {
    const minA = amountMin !== null ? amountMin : -Infinity;
    const maxA = amountMax !== null ? amountMax : Infinity;
    matchAmount = empAmount >= minA && empAmount <= maxA;
  }

  // --- Other filters ---
  const matchName = filters.name
    ? emp.name.toLowerCase().includes(filters.name.toLowerCase())
    : true;

  const matchEmail = filters.email
    ? emp.email.toLowerCase().includes(filters.email.toLowerCase())
    : true;

  const matchPhone = filters.phone ? emp.phone.includes(filters.phone) : true;

  const matchRank = filters.rank ? emp.rank === filters.rank : true;

  // --- Final return ---
  return (
    matchSN &&
    matchAmount &&
    matchName &&
    matchEmail &&
    matchPhone &&
    matchRank
  );
});

  // 🔹 Export logic
  const handleExport = () => {
    if (filteredEmployees.length === 0) return alert("No employees to export!");
    const csv = convertToCSV(filteredEmployees);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddEmployee = () => {
  const newId = Date.now().toString();
  const newEmployee = {
    id: newId,
    name: "",
    email: "",
    phone: "",
    rank: "",
    amount: ""
  };
  setEmployees([...employees, newEmployee]);
  setEditingRowId(newId);
};

const handleRowClick = (emp) => {
  setSelectedEmployee(emp);
  setEditingEmployee({ ...emp }); // copy data into modalData
};


// handle field change
const handleFieldChange = (id, field, value) => {
  setEmployees((prev) =>
    prev.map((emp) =>
      emp.id === id ? { ...emp, [field]: value } : emp
    )
  );
};

const handleSaveRow = (id, updatedRow) => {
  // update employees array
  setEmployees(prev =>
    prev.map(emp => emp.id === id ? { ...emp, ...updatedRow } : emp)
  );
  setEditingRowId(null);
};

// save modal changes back to state
const handleSaveModal = (updatedEmployee) => {
  setEmployees((prev) =>
    prev.map((emp) =>
      emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp
    )
  );
  setSelectedEmployee(null);
  setEditingEmployee(null);
};



  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-4">
        
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>


          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center border px-1 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-center text-gray-700 rounded-sm font-medium">
              <th className="px-2 py-1">
                 <button
                  onClick={() => setSnModalOpen(true)}
                  className={`hover:bg-gray-300 w-10 rounded-lg px-1 py-1 ${
                    snModalOpen ? "border-2 border-blue-500" : ""
                  }`}
                >
                  S/N
                </button>
              </th>


              {/* Name filter */}
              <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Names"
                    value={filters.name}
                    onChange={(e) => {
                      // Allow letters, numbers, spaces, hyphens & periods
                      const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s.-]/g, "").trimStart();
                      setFilters({ ...filters, name: cleanValue });
                    }}
                    className="px-1 py-1 w-40 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </th>

              {/* Email filter */}
              <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Email"
                    value={filters.email}
                    onChange={(e) => {
                      // Allow typical email chars: letters, numbers, @, dot, hyphen, underscore
                      const cleanValue = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, "").trimStart();
                      setFilters({ ...filters, email: cleanValue });
                    }}
                    className="px-1 py-1 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </th>

              {/* Phone filter */}
              <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Phone No"
                    value={filters.phone}
                    onChange={(e) => {
                      // Allow only numbers, plus sign, spaces, parentheses & hyphen
                      const cleanValue = e.target.value.replace(/[^0-9+\s()-]/g, "").trimStart();
                      setFilters({ ...filters, phone: cleanValue });
                    }}
                    className="px-1 py-1 w-30 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </th>


              {/* Rank dropdown */}
              <th className="px-2 py-1">
                  <select
                    value={filters.rank}
                    onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
                    className="px-1 py-1 w-auto border rounded-lg"
                  >
                    <option value="">Ranks</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
              </th>

              {/* Amount Filter Trigger */}
              <th className="px-2 py-1">
                 <button
                  onClick={() => setAmountModalOpen(true)}
                  className={`hover:bg-gray-300 w-auto rounded-lg px-1 py-1 ${
                    amountModalOpen ? "border-2 border-blue-500" : ""
                  }`}                
                  >
                  Amount
                </button>
              </th>


              <th className="px-1 py-2">Actions</th>
            </tr>
          </thead>
            <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                // open modal on row click but ignore if clicking the edit button
                onClick={(e) => {
                  if (e.target.closest("button")) return; // ignore if clicking inline Edit
                  handleRowClick(emp); // opens modal
                }}
                className="border-b hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <td className="px-2 py-2">{emp.id}</td>

                {/* Name */}
                <td className="px-4 py-2">
                  {editingRowId === emp.id ? (
                    <input
                      type="text"
                      value={emp.name}
                      onChange={(e) =>
                        handleFieldChange(emp.id, "name", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    emp.name
                  )}
                </td>

                {/* Email */}
                <td className="px-4 py-2">
                  {editingRowId === emp.id ? (
                    <input
                      type="email"
                      value={emp.email}
                      onChange={(e) =>
                        handleFieldChange(emp.id, "email", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    emp.email
                  )}
                </td>

                {/* Phone */}
                <td className="px-4 py-2">
                  {editingRowId === emp.id ? (
                    <input
                      type="text"
                      value={emp.phone}
                      onChange={(e) =>
                        handleFieldChange(emp.id, "phone", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    emp.phone
                  )}
                </td>

                {/* Rank */}
                <td className="px-4 py-2">
                  {editingRowId === emp.id ? (
                    <input
                      type="text"
                      value={emp.rank}
                      onChange={(e) =>
                        handleFieldChange(emp.id, "rank", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    emp.rank
                  )}
                </td>

                {/* Amount */}
                <td className="px-4 py-2">
                  {editingRowId === emp.id ? (
                    <input
                      type="number"
                      value={emp.amount}
                      onChange={(e) =>
                        handleFieldChange(emp.id, "amount", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    emp.amount
                  )}
                </td>

                {/* Actions */}
                <td className="px-2 py-2 space-x-2">
                  {editingRowId === emp.id ? (
                    <button
                      onClick={() => handleSaveRow(emp.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingRowId(emp.id)}
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

      {snModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">

            <div className="space-y-3">
              {/* Single ID */}
              <div>
                <select
                  value={filters.sn}
                  onChange={(e) => {
                    setFilters({ ...filters, sn: e.target.value,
                    snMin: "",
                    snMax: "", // clear range
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Number</option>
                  {snList.map((sn) => (
                    <option key={sn} value={sn}>
                      {sn}
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
                      setSnRange({ ...snRange, min: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Min</option>
                    {snList.map((sn) => (
                      <option key={sn} value={sn}>
                        {sn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={snRange.max}
                    onChange={(e) =>
                      setSnRange({ ...snRange, max: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Max</option>
                    {snList.map((sn) => (
                      <option key={sn} value={sn}>
                        {sn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setSnModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // If both min & max chosen -> use range
                  if (snRange.min && snRange.max) {
                    setFilters(prev => ({
                      ...prev,
                      sn: "", // clear single
                      snMin: Number(snRange.min),
                      snMax: Number(snRange.max),
                    }));
                  }
                  // else if a single value is already selected in the dropdown (filters.sn)
                  else if (filters.sn !== "" && filters.sn !== null && filters.sn !== undefined) {
                    setFilters(prev => ({
                      ...prev,
                      sn: Number(filters.sn),
                      snMin: "",
                      snMax: "",
                    }));
                  } else {
                    // nothing selected -> clear S/N filters
                    setFilters(prev => ({ ...prev, sn: "", snMin: "", snMax: "" }));
                  }

                  // clear temporary range and close modal
                  setSnRange({ min: "", max: "" });
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

      {amountModalOpen && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">

          <div className="space-y-3">
            {/* Single Amount */}
            <div>
              <select
                value={filters.amountMin && !filters.amountMax ? filters.amountMin : ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    amountMin: e.target.value,
                    amountMax: "", // reset max if single selected
                  });
                  setAmountRange({ min: "", max: "" }); // reset range
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select Amount</option>
                {amountList.map((amt) => (
                  <option key={amt} value={amt}>
                    {amt.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-gray-500 text-sm">— OR —</div>

            {/* Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={amountRange.min}
                  onChange={(e) =>
                    setAmountRange({
                      ...amountRange,
                      min: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Min</option>
                  {amountList.map((amt) => (
                    <option key={amt} value={amt}>
                      {amt.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={amountRange.max}
                  onChange={(e) =>
                    setAmountRange({
                      ...amountRange,
                      max: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Max</option>
                  {amountList.map((amt) => (
                    <option key={amt} value={amt}>
                      {amt.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button
              onClick={() => setAmountModalOpen(false)}
              className="px-2 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (amountRange.min && amountRange.max) {
                  // User picked a range
                  setFilters({
                    ...filters,
                    amountMin: Number(amountRange.min),
                    amountMax: Number(amountRange.max),
                  });
                } else if (filters.amountMin && !filters.amountMax) {
                  // User picked a single amount (from dropdown)
                  setFilters({
                    ...filters,
                    amountMin: Number(filters.amountMin),
                    amountMax: "",
                  });
                } else {
                  // Nothing selected, clear everything
                  setFilters({
                    ...filters,
                    amountMin: "",
                    amountMax: "",
                  });
                }
                setAmountModalOpen(false);
              }}
              className="px-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>

          </div>
        </div>
      </div>
    )}
 

    <UserProfileModal
      selectedEmployee={selectedEmployee}
      editingEmployee={editingEmployee}
      setEditingEmployee={setEditingEmployee}
      handleSaveModal={handleSaveModal}
      setSelectedEmployee={setSelectedEmployee}
      // isAdmin={currentUser.isAdmin}
    />


    </div>
  );
}
