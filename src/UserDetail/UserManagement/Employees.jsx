import { useState, useEffect } from "react";
import {
  Plus,
  Download,
  Phone,
  Mail,
  Building2,
  Search,
  Filter,
  X,
  Hash, // Icon for ID
  Banknote, // Icon for Amount
  Loader2,
  Trash2
} from "lucide-react";
import UserProfileModal from "./EmployeeProfileModal";
import api from "../../api";

// 🔹 Utility: Convert JSON → CSV string
function convertToCSV(data) {
  if (!data || !data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((field) => row[field]).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Combined Filter State
  const [filters, setFilters] = useState({
    sn: "", snMin: "", snMax: "",
    name: "", email: "", phone: "",
    rank: "",
    amountMin: "", amountMax: ""
  });

  const [mobileSearch, setMobileSearch] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States (Desktop)
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  // Edit/View States
  const [editingRowId, setEditingRowId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // Track if we are creating new

  // Fetch Employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/employees/");

      // Handle both direct array and paginated response (results key)
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (res.data && Array.isArray(res.data.results)) {
        setEmployees(res.data.results);
      } else {
        console.warn("Unexpected data format from API:", res.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      alert("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  // Derived Lists
  const snList = employees.map((_, idx) => idx + 1); // Or use employee.id if sequential
  const amountList = [...new Set(employees.map(e => Number(e.amount)))].sort((a, b) => a - b);

  // Check active filters for badge
  const hasActiveFilters =
    filters.rank ||
    filters.amountMin || filters.amountMax ||
    filters.snMin || filters.snMax ||
    filters.email || filters.phone;

  const filteredEmployees = employees.filter((emp, idx) => {
    const sn = emp.id ?? idx + 1;

    // --- 1. ID / SN Filter ---
    const snSingle = filters.sn !== "" ? Number(filters.sn) : null;
    const snMin = filters.snMin !== "" ? Number(filters.snMin) : null;
    const snMax = filters.snMax !== "" ? Number(filters.snMax) : null;

    let matchSN = true;
    if (snSingle !== null) matchSN = sn === snSingle;
    else if (snMin !== null || snMax !== null) {
      const min = snMin !== null ? snMin : -Infinity;
      const max = snMax !== null ? snMax : Infinity;
      matchSN = sn >= min && sn <= max;
    }

    // --- 2. Amount Filter ---
    const empAmount = Number(emp.amount);
    const amountMin = filters.amountMin !== "" ? Number(filters.amountMin) : null;
    const amountMax = filters.amountMax !== "" ? Number(filters.amountMax) : null;

    let matchAmount = true;
    if (amountMin !== null && amountMax === null) matchAmount = empAmount === amountMin;
    else if (amountMin !== null || amountMax !== null) {
      const minA = amountMin !== null ? amountMin : -Infinity;
      const maxA = amountMax !== null ? amountMax : Infinity;
      matchAmount = empAmount >= minA && empAmount <= maxA;
    }

    // --- 3. Text Filters (Specific) ---
    const matchName = filters.name ? emp.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
    const matchEmail = filters.email ? emp.email.toLowerCase().includes(filters.email.toLowerCase()) : true;
    const matchPhone = filters.phone ? emp.phone.includes(filters.phone) : true;
    const matchRank = filters.rank ? emp.rank === filters.rank : true;

    // --- 4. Mobile Global Search (Top Bar) ---
    const searchLower = mobileSearch.toLowerCase();
    const matchGlobal = mobileSearch === "" ||
      (emp.name && emp.name.toLowerCase().includes(searchLower)) ||
      (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
      (emp.phone && emp.phone.includes(mobileSearch)) ||
      (emp.rank && emp.rank.toLowerCase().includes(searchLower));

    return matchSN && matchAmount && matchName && matchEmail && matchPhone && matchRank && matchGlobal;
  });

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
    const newEmployee = { name: "", email: "", phone: "", rank: "Staff", amount: "0" };
    setEditingEmployee(newEmployee);
    setSelectedEmployee(newEmployee);
    setIsCreating(true);
  };

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setEditingEmployee({ ...emp });
    setIsCreating(false);
  };

  const handleFieldChange = (id, field, value) => {
    setEmployees((prev) => prev.map((emp) => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const handleSaveRow = async (id) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    try {
      await api.put(`/users/employees/${id}/`, employee);
      alert("Employee updated successfully!");
      setEditingRowId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update employee.");
    }
  };

  const handleSaveModal = async (updatedEmployee) => {
    try {
      if (isCreating) {
        const res = await api.post("/users/employees/", updatedEmployee);
        setEmployees([...employees, res.data]);
        alert("Employee created successfully!");
      } else {
        const res = await api.put(`/users/employees/${updatedEmployee.id}/`, updatedEmployee);
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? res.data : emp));
        alert("Employee updated successfully!");
      }
      setSelectedEmployee(null);
      setEditingEmployee(null);
      setIsCreating(false);
    } catch (error) {
      console.error(error);
      alert(isCreating ? "Failed to create employee." : "Failed to update employee.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await api.delete(`/users/employees/${id}/`);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee.");
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* 📱 MOBILE: Sticky Search + Filter Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm mb-4 transition-all">
        <div className="flex gap-3">
          {/* Global Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search all fields..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm transition duration-150"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`relative p-2.5 rounded-xl border transition-all active:scale-95 ${hasActiveFilters
              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 🖥️ DESKTOP: Header */}
      <div className="hidden lg:flex max-w-7xl mx-auto flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Employee Management</h2>
          <p className="text-xs text-gray-500">Manage payroll and staff details</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleAddEmployee} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

        {/* 🖥️ DESKTOP TABLE (Hidden on Mobile) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-16">
                  <button onClick={() => setSnModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left flex justify-between items-center ${snModalOpen ? "bg-blue-50 border-blue-200 text-blue-600" : ""}`}>
                    ID
                  </button>
                </th>
                <th className="px-4 py-3 w-48"><input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="bg-transparent w-full outline-none placeholder-gray-400 focus:placeholder-gray-300 transition-colors" /></th>
                <th className="px-4 py-3 w-48"><input placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} className="bg-transparent w-full outline-none placeholder-gray-400 focus:placeholder-gray-300" /></th>
                <th className="px-4 py-3 w-32"><input placeholder="Phone" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} className="bg-transparent w-full outline-none placeholder-gray-400 focus:placeholder-gray-300" /></th>
                <th className="px-4 py-3 w-32">
                  <select value={filters.rank} onChange={(e) => setFilters({ ...filters, rank: e.target.value })} className="bg-transparent w-full outline-none cursor-pointer">
                    <option value="">Rank</option><option value="Administrator">Administrator</option><option value="Manager">Manager</option><option value="Staff">Staff</option>
                  </select>
                </th>
                <th className="px-4 py-3 w-28"><button onClick={() => setAmountModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-1 py-1 text-left flex justify-between items-center ${amountModalOpen ? "bg-blue-50 border-blue-200 text-blue-600" : ""}`}>Amount</button></th>
                <th className="px-4 py-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} onClick={(e) => { if (!e.target.closest("button") && !e.target.closest("input")) handleRowClick(emp); }} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                  <td className="px-4 py-2.5 text-black font-mono">{emp.id}</td>
                  <td className="px-4 py-2.5 font-medium text-black">
                    {editingRowId === emp.id ? (
                      <input className="border border-blue-400 rounded px-2 py-1 w-full bg-white" value={emp.name} onChange={(e) => handleFieldChange(emp.id, "name", e.target.value)} autoFocus />
                    ) : emp.name}
                  </td>
                  <td className="px-4 py-2.5 text-black">
                    {editingRowId === emp.id ? (
                      <input className="border border-blue-400 rounded px-2 py-1 w-full bg-white" value={emp.email} onChange={(e) => handleFieldChange(emp.id, "email", e.target.value)} />
                    ) : emp.email}
                  </td>
                  <td className="px-4 py-2.5 text-black">
                    {editingRowId === emp.id ? (
                      <input className="border border-blue-400 rounded px-2 py-1 w-full bg-white" value={emp.phone} onChange={(e) => handleFieldChange(emp.id, "phone", e.target.value)} />
                    ) : emp.phone}
                  </td>
                  <td className="px-4 py-2.5">
                    {editingRowId === emp.id ? (
                      <select className="border border-blue-400 rounded px-2 py-1 w-full bg-white" value={emp.rank} onChange={(e) => handleFieldChange(emp.id, "rank", e.target.value)}>
                        <option>Administrator</option><option>Manager</option><option>Staff</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${emp.rank === 'Administrator' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        emp.rank === 'Manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {emp.rank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-black">
                    {editingRowId === emp.id ? (
                      <input className="border border-blue-400 rounded px-2 py-1 w-full bg-white" type="number" value={emp.amount} onChange={(e) => handleFieldChange(emp.id, "amount", e.target.value)} />
                    ) : `₦${Number(emp.amount).toLocaleString()}`}
                  </td>
                  <td className="px-4 py-2.5 text-right flex justify-end gap-2 text-xs">
                    {editingRowId === emp.id ? (
                      <button onClick={() => handleSaveRow(emp.id)} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded font-bold">Save</button>
                    ) : (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setEditingRowId(emp.id); }} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-bold">Edit</button>
                        <button onClick={(e) => { handleDelete(emp.id, e); }} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded font-bold"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filteredEmployees.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No employees found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE LIST VIEW */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> : filteredEmployees.map((emp) => (
            <div key={emp.id} onClick={() => handleRowClick(emp)} className="p-4 active:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{emp.name || "New Employee"}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" /> {emp.rank || "-"}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  ₦{Number(emp.amount).toLocaleString()}
                </span>
                <button onClick={(e) => handleDelete(emp.id, e)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-1 pl-1 border-l-2 border-gray-100">
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gray-400" /> {emp.email || "-"}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gray-400" /> {emp.phone || "-"}
                </p>
              </div>
            </div>
          ))}
          {!loading && filteredEmployees.length === 0 && <div className="p-8 text-center text-gray-400 text-sm italic">No employees found.</div>}
        </div>

      </div>

      {/* 📱 MOBILE FILTER DRAWER (COMPLETE) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="bg-white w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" /> Advanced Filters
              </h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">

              {/* 1. Rank Chips */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Employee Rank</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {["", "Administrator", "Manager", "Staff"].map(rank => (
                    <button
                      key={rank}
                      onClick={() => setFilters({ ...filters, rank: rank })}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filters.rank === rank
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {rank || "All Ranks"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. S/N (ID) Range - NEW */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> S/N Range (ID)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min ID" value={filters.snMin} onChange={(e) => setFilters({ ...filters, snMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                  <input type="number" placeholder="Max ID" value={filters.snMax} onChange={(e) => setFilters({ ...filters, snMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* 3. Amount Range */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Banknote className="w-3 h-3" /> Amount Range (₦)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min Amount" value={filters.amountMin} onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                  <input type="number" placeholder="Max Amount" value={filters.amountMax} onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* 4. Specific Contact Filters */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Specific Contact</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Filter by exact email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Filter by phone number" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setFilters({ sn: "", snMin: "", snMax: "", name: "", email: "", phone: "", rank: "", amountMin: "", amountMax: "" })}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors active:scale-95"
              >
                Show Results
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SN Modal & Amount Modal (Desktop - Unchanged) */}
      {snModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSnModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Filter ID</h3>
            <div className="space-y-3">
              <select className="w-full border rounded p-2 text-sm" onChange={e => { setFilters({ ...filters, snMin: e.target.value, snMax: "" }); setSnModalOpen(false); }}>
                <option value="">Select Specific ID</option>
                {snList.map(sn => <option key={sn} value={sn}>{sn}</option>)}
              </select>
              <div className="text-center text-xs text-gray-400">- OR -</div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min" className="border rounded p-2 text-sm" value={snRange.min} onChange={e => setSnRange({ ...snRange, min: e.target.value })} />
                <input type="number" placeholder="Max" className="border rounded p-2 text-sm" value={snRange.max} onChange={e => setSnRange({ ...snRange, max: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setSnModalOpen(false)} className="text-gray-500 text-xs font-medium">Cancel</button>
                <button onClick={() => { setFilters({ ...filters, snMin: snRange.min, snMax: snRange.max, sn: "" }); setSnModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {amountModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAmountModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Filter Amount</h3>
            <div className="space-y-3">
              <select className="w-full border rounded p-2 text-sm" onChange={e => { setFilters({ ...filters, amountMin: e.target.value, amountMax: "" }); setAmountModalOpen(false); }}>
                <option value="">Select Amount</option>
                {amountList.map(amt => <option key={amt} value={amt}>{amt.toLocaleString()}</option>)}
              </select>
              <div className="text-center text-xs text-gray-400">- OR -</div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min" className="border rounded p-2 text-sm" value={amountRange.min} onChange={e => setAmountRange({ ...amountRange, min: e.target.value })} />
                <input type="number" placeholder="Max" className="border rounded p-2 text-sm" value={amountRange.max} onChange={e => setAmountRange({ ...amountRange, max: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setAmountModalOpen(false)} className="text-gray-500 text-xs font-medium">Cancel</button>
                <button onClick={() => { setFilters({ ...filters, amountMin: amountRange.min, amountMax: amountRange.max }); setAmountModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold">Apply</button>
              </div>
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
      />

    </div>
  );
}