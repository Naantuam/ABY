import { useState, useEffect } from "react";
import {
  Download, Trash, Plus, Eye, Edit, X, User, Users,
  Search, Filter, ChevronDown, MapPin
} from "lucide-react";
import api from "../../api";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [currentProject, setCurrentProject] = useState(null);

  // Filter Modal States (Desktop)
  const [snModalOpen, setSnModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Mobile Filter Drawer State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");

  // Filter Values
  const [filters, setFilters] = useState({
    name: "", location: "", status: "", owner: "", team: "",
    snMin: "", snMax: "",
    dateMin: "", dateMax: "",
    budgetMin: "", budgetMax: ""
  });

  // Range Local States
  const [snRange, setSnRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

  const [visibleCount, setVisibleCount] = useState(10);

  // Check active filters for mobile badge
  const hasActiveFilters =
    filters.status || filters.owner || filters.team || filters.location ||
    filters.snMin || filters.dateMin || filters.budgetMin;

  // ────────────────────────────────
  // 1️⃣ Fetch Data
  // ────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const projectRes = await api.get("/projects/");
      const formattedProjects = (projectRes.data.results || projectRes.data || []).map((p) => ({
        ...p,
        id: p.id,
        name: p.project_name,
        startDate: p.start_date,
        endDate: p.end_date,
        budget: p.budget,
        owner: p.owner || null,
        assigned_team: p.assigned_team || []
      }));
      setProjects(formattedProjects);

      const userRes = await api.get("/users/");
      setAllUsers(userRes.data.results || userRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ────────────────────────────────
  // 2️⃣ Filter Logic
  // ────────────────────────────────
  const filteredProjects = projects.filter((pr) => {
    // Desktop & Mobile Search (Name)
    const searchName = mobileSearch || filters.name;

    // 1. Text Filters
    const matchName = searchName ? pr.name.toLowerCase().includes(searchName.toLowerCase()) : true;
    const matchLocation = filters.location ? pr.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
    const matchStatus = filters.status ? pr.status === filters.status : true;

    // 2. Owner & Team Filters
    const matchOwner = filters.owner
      ? pr.owner?.username?.toLowerCase().includes(filters.owner.toLowerCase())
      : true;

    const matchTeam = filters.team
      ? pr.assigned_team?.some(member => member.username.toLowerCase().includes(filters.team.toLowerCase()))
      : true;

    // 3. ID Range Filter
    const idNum = Number(pr.id);
    const matchID = (filters.snMin && filters.snMax)
      ? idNum >= Number(filters.snMin) && idNum <= Number(filters.snMax)
      : (filters.snMin)
        ? idNum === Number(filters.snMin)
        : true;

    // 4. Date Range Filter
    const matchDate = (filters.dateMin && filters.dateMax)
      ? pr.startDate >= filters.dateMin && pr.startDate <= filters.dateMax
      : (filters.dateMin)
        ? pr.startDate === filters.dateMin
        : true;

    // 5. Budget Range Filter
    const budgetNum = Number(String(pr.budget).replace(/[^0-9.]/g, ""));
    const matchBudget = (filters.budgetMin && filters.budgetMax)
      ? budgetNum >= Number(filters.budgetMin) && budgetNum <= Number(filters.budgetMax)
      : (filters.budgetMin)
        ? budgetNum === Number(filters.budgetMin)
        : true;

    return matchName && matchLocation && matchStatus && matchOwner && matchTeam && matchID && matchDate && matchBudget;
  });

  // ────────────────────────────────
  // 3️⃣ CRUD Handlers
  // ────────────────────────────────
  const openModal = (project, mode) => {
    setModalMode(mode);
    if (mode === 'add') {
      setCurrentProject({
        project_name: "", location: "", start_date: new Date().toISOString().slice(0, 10),
        end_date: "", budget: "", status: "Active", owner: null, assigned_team: []
      });
    } else {
      setCurrentProject({
        ...project,
        project_name: project.name, start_date: project.startDate, end_date: project.endDate
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentProject) return;
    const payload = {
      project_name: currentProject.project_name,
      location: currentProject.location,
      start_date: currentProject.start_date,
      end_date: currentProject.end_date,
      budget: currentProject.budget,
      status: currentProject.status,
      owner_id: currentProject.owner?.id || currentProject.owner,
      assigned_team_ids: currentProject.assigned_team.map(u => u.id)
    };

    try {
      if (modalMode === 'add') {
        await api.post("/projects/", payload);
        alert("Project Created!");
      } else {
        await api.put(`/projects/${currentProject.id}/`, payload);
        alert("Project Updated!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save project.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}/`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) { alert("Could not delete project"); }
  }

  const addTeamMember = (userId) => {
    const userToAdd = allUsers.find(u => Number(u.id) === Number(userId));
    if (userToAdd && !currentProject.assigned_team.find(m => m.id === userToAdd.id)) {
      setCurrentProject(prev => ({ ...prev, assigned_team: [...prev.assigned_team, userToAdd] }));
    }
  };

  const removeTeamMember = (userId) => {
    setCurrentProject(prev => ({ ...prev, assigned_team: prev.assigned_team.filter(m => m.id !== userId) }));
  };

  const formatCurrency = (val) => val ? `₦${Number(val).toLocaleString()}` : "₦0";
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-500 text-white";
      case "Active": return "bg-blue-500 text-white";
      case "Cancelled": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="p-0 sm:p-6 bg-white sm:bg-transparent rounded-none sm:rounded-xl shadow-none sm:shadow-sm min-h-screen">

      {/* 📱 MOBILE: Sticky Filter Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm transition duration-150 ease-in-out"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className={`relative p-2.5 rounded-xl border transition-colors ${hasActiveFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* 🖥️ DESKTOP: Header */}
      <div className="hidden lg:flex flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Projects Directory</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 border px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => openModal(null, 'add')} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-none sm:rounded-lg border-t sm:border border-gray-100">
        <div className="min-w-[1200px] sm:min-w-full">
          <table className="w-full text-sm text-left hidden sm:table">
            <thead className="bg-gray-50 text-gray-600 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3 w-20">
                  <button onClick={() => setSnModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-2 py-1 text-left flex justify-between ${snModalOpen || filters.snMin ? "bg-blue-50 border-blue-200" : ""}`}>ID</button>
                </th>
                <th className="px-4 py-3">
                  <input placeholder="Project Name" className="bg-transparent w-full outline-none" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
                </th>
                <th className="px-4 py-3 w-32">
                  <input placeholder="Location" className="bg-transparent w-full outline-none" value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
                </th>
                <th className="px-4 py-3 w-28">
                  <button onClick={() => setDateModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-2 py-1 text-left flex justify-between ${dateModalOpen || filters.dateMin ? "bg-blue-50 border-blue-200" : ""}`}>Date</button>
                </th>
                <th className="px-4 py-3 w-32">
                  <button onClick={() => setBudgetModalOpen(true)} className={`hover:bg-gray-200 w-full rounded px-2 py-1 text-left flex justify-between ${budgetModalOpen || filters.budgetMin ? "bg-blue-50 border-blue-200" : ""}`}>Budget</button>
                </th>

                <th className="px-4 py-3 w-32">
                  <input placeholder="Owner" className="bg-transparent w-full outline-none" value={filters.owner} onChange={e => setFilters({ ...filters, owner: e.target.value })} />
                </th>

                <th className="px-4 py-3 w-32">
                  <input placeholder="Team" className="bg-transparent w-full outline-none" value={filters.team} onChange={e => setFilters({ ...filters, team: e.target.value })} />
                </th>

                <th className="px-4 py-3 w-32">
                  <select className="bg-transparent w-full outline-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">Status</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : filteredProjects.length === 0 ? (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">No projects found.</td></tr>
              ) : (
                filteredProjects.slice(0, visibleCount).map((pr) => (
                  <tr key={pr.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{pr.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{pr.name}</td>
                    <td className="px-4 py-3 text-gray-600">{pr.location}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div>{pr.startDate}</div>
                      <div className="text-gray-400">to {pr.endDate}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{formatCurrency(pr.budget)}</td>
                    <td className="px-4 py-3 text-xs">{pr.owner?.username || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {pr.assigned_team.slice(0, 3).map(m => (
                          <div key={m.id} className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white" title={m.username}>
                            {m.username.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {pr.assigned_team.length > 3 && <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] border border-white">+{pr.assigned_team.length - 3}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(pr.status)}`}>{pr.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button onClick={() => openModal(pr, 'view')} className="text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openModal(pr, 'edit')} className="text-gray-400 hover:text-green-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(pr.id)} className="text-gray-400 hover:text-red-600"><Trash className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 📱 MOBILE LIST VIEW */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {filteredProjects.slice(0, visibleCount).map((pr) => (
              <div key={pr.id} onClick={() => openModal(pr, 'view')} className="p-4 active:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{pr.name}</h3>
                    <p className="text-xs text-gray-500">{pr.location}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getStatusColor(pr.status)}`}>{pr.status}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-mono font-medium text-gray-700">{formatCurrency(pr.budget)}</span>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openModal(pr, 'edit'); }} className="p-1.5 bg-gray-100 rounded text-blue-600"><Edit className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(pr.id); }} className="p-1.5 bg-gray-100 rounded text-red-600"><Trash className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No projects found.</div>}
          </div>

        </div>
      </div>

      {/* 📱 MOBILE FILTER DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="bg-white w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Status</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {["", "Active", "Completed", "Cancelled"].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({ ...filters, status: status })}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filters.status === status
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200"
                        }`}
                    >
                      {status || "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Budget Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min" value={filters.budgetMin} onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input type="number" placeholder="Max" value={filters.budgetMax} onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Start Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={filters.dateMin} onChange={(e) => setFilters({ ...filters, dateMin: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500" />
                  <input type="date" value={filters.dateMax} onChange={(e) => setFilters({ ...filters, dateMax: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500" />
                </div>
              </div>

              {/* Specific Fields */}
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Owner Name" value={filters.owner} onChange={(e) => setFilters({ ...filters, owner: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
                {/* ✅ NEW: Team Member Input */}
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Team Member" value={filters.team} onChange={(e) => setFilters({ ...filters, team: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setFilters({ name: "", location: "", status: "", owner: "", team: "", snMin: "", snMax: "", dateMin: "", dateMax: "", budgetMin: "", budgetMax: "" })}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200"
              >
                Show Results
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────── */}
      {/* DESKTOP FILTER MODALS (Unchanged)      */}
      {/* ────────────────────────────────────── */}

      {snModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSnModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3">Filter ID</h3>
            <div className="space-y-3">
              <select className="w-full border rounded p-2" onChange={e => { setFilters({ ...filters, snMin: e.target.value, snMax: "" }); setSnModalOpen(false); }}>
                <option value="">Select Specific ID</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
              </select>
              <div className="text-center text-xs text-gray-400">- OR -</div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min" className="border rounded p-2" value={snRange.min} onChange={e => setSnRange({ ...snRange, min: e.target.value })} />
                <input type="number" placeholder="Max" className="border rounded p-2" value={snRange.max} onChange={e => setSnRange({ ...snRange, max: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setSnModalOpen(false)} className="text-gray-500 text-sm">Close</button>
                <button onClick={() => { setFilters({ ...filters, snMin: snRange.min, snMax: snRange.max }); setSnModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... (DateModal and BudgetModal remain same as desktop logic) ... */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3">Filter Date</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="border rounded p-2 text-xs" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                <input type="date" className="border rounded p-2 text-xs" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => { setFilters({ ...filters, dateMin: "", dateMax: "" }); setDateModalOpen(false); }} className="text-red-500 text-sm">Clear</button>
                <button onClick={() => { setFilters({ ...filters, dateMin: dateRange.start, dateMax: dateRange.end }); setDateModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {budgetModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setBudgetModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 mb-3">Filter Budget</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min" className="border rounded p-2" value={budgetRange.min} onChange={e => setBudgetRange({ ...budgetRange, min: e.target.value })} />
                <input type="number" placeholder="Max" className="border rounded p-2" value={budgetRange.max} onChange={e => setBudgetRange({ ...budgetRange, max: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setBudgetModalOpen(false)} className="text-gray-500 text-sm">Close</button>
                <button onClick={() => { setFilters({ ...filters, budgetMin: budgetRange.min, budgetMax: budgetRange.max }); setBudgetModalOpen(false); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────── */}
      {/* ADD / EDIT / VIEW MODAL                */}
      {/* ────────────────────────────────────── */}
      {isModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === 'add' ? "New Project" : modalMode === 'edit' ? "Edit Project" : "Project Details"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">General Info</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input disabled={modalMode === 'view'} value={currentProject.project_name} onChange={e => setCurrentProject({ ...currentProject, project_name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 mt-1 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input disabled={modalMode === 'view'} value={currentProject.location} onChange={e => setCurrentProject({ ...currentProject, location: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 mt-1 disabled:bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-500">Start Date</label><input type="date" disabled={modalMode === 'view'} value={currentProject.start_date} onChange={e => setCurrentProject({ ...currentProject, start_date: e.target.value })} className="w-full border rounded-lg p-2 mt-1 disabled:bg-gray-100 text-sm" /></div>
                  <div><label className="block text-xs text-gray-500">End Date</label><input type="date" disabled={modalMode === 'view'} value={currentProject.end_date} onChange={e => setCurrentProject({ ...currentProject, end_date: e.target.value })} className="w-full border rounded-lg p-2 mt-1 disabled:bg-gray-100 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-gray-700">Budget</label><input type="number" disabled={modalMode === 'view'} value={currentProject.budget} onChange={e => setCurrentProject({ ...currentProject, budget: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 mt-1 disabled:bg-gray-100" /></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select disabled={modalMode === 'view'} value={currentProject.status} onChange={e => setCurrentProject({ ...currentProject, status: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 mt-1 disabled:bg-gray-100">
                      <option>Active</option><option>Completed</option><option>Cancelled</option><option>Delayed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RIGHT: Team */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-2"><User className="w-3 h-3" /> Project Owner</h4>
                  <div className="mt-3">
                    {modalMode === 'view' ? <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">{currentProject.owner?.username || "No Owner Assigned"}</div> : (
                      <select value={currentProject.owner?.id || currentProject.owner || ""} onChange={e => setCurrentProject({ ...currentProject, owner: allUsers.find(u => String(u.id) === e.target.value) })} className="w-full border border-gray-300 rounded-lg p-2 text-sm">
                        <option value="">Select Owner</option>
                        {allUsers.map(user => <option key={user.id} value={user.id}>{user.username} ({user.email})</option>)}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-2"><Users className="w-3 h-3" /> Assigned Team</h4>
                  <div className="flex flex-wrap gap-2 mt-3 mb-3">
                    {currentProject.assigned_team.length === 0 && <span className="text-sm text-gray-400 italic">No team members assigned.</span>}
                    {currentProject.assigned_team.map(member => (
                      <div key={member.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                        {member.username}
                        {modalMode !== 'view' && <button onClick={() => removeTeamMember(member.id)} className="hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>}
                      </div>
                    ))}
                  </div>
                  {modalMode !== 'view' && (
                    <div className="flex gap-2">
                      <select id="teamSelect" className="flex-1 border border-gray-300 rounded-lg p-2 text-xs">
                        <option value="">Select Member...</option>
                        {allUsers.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                      </select>
                      <button type="button" onClick={() => { const select = document.getElementById("teamSelect"); if (select.value) { addTeamMember(select.value); select.value = ""; } }} className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-800">Add</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm">Close</button>
              {modalMode !== 'view' && <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm shadow-sm">{modalMode === 'add' ? 'Create Project' : 'Save Changes'}</button>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}