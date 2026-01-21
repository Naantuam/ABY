"use client"

import { useState, useEffect, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, ChevronDown, Filter, RefreshCcw, LayoutTemplate, Loader2 } from "lucide-react"
import api from "../../api"

// 🎨 CONFIG: Centralized Colors
const METRIC_CONFIG = {
  Income: {
    hex: "#10b981", // Emerald 500
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    ring: "ring-green-500",
  },
  Expenses: {
    hex: "#ef4444", // Red 500
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    ring: "ring-red-500",
  },
  Balance: {
    hex: "#3b82f6", // Blue 500
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-500",
  },
}

// Format ₦ values
const formatCurrency = (value) => `₦${(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`

export default function OperationsChart() {
  const [timeFrame, setTimeFrame] = useState("Daily")
  const [activeChart, setActiveChart] = useState("operations")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)

  // State for interactive interactivity
  const [activeMetric, setActiveMetric] = useState(null)
  const [sidebarMode, setSidebarMode] = useState("total") // 'total' | 'recent'

  // Data State
  const [rawData, setRawData] = useState({ operations: [], maintenance: [] })
  const [summaryData, setSummaryData] = useState({ operations: null, maintenance: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [opsRes, maintRes, opsSumRes, maintSumRes] = await Promise.all([
          api.get("/operation/"),
          api.get("/maintenance/"),
          api.get("/operation/summary/"),
          api.get("/maintenance/summary/")
        ]);

        const opsData = Array.isArray(opsRes.data) ? opsRes.data : (opsRes.data.results || []);
        const maintData = Array.isArray(maintRes.data) ? maintRes.data : (maintRes.data.results || []);

        setRawData({
          operations: opsData,
          maintenance: maintData
        });

        setSummaryData({
          operations: opsSumRes.data,
          maintenance: maintSumRes.data
        });

      } catch (err) {
        console.error("Failed to fetch chart data:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 DATA PROCESSING HELPER
  const processedData = useMemo(() => {
    const records = activeChart === "operations" ? rawData.operations : rawData.maintenance;
    if (!records || records.length === 0) return { daily: [], monthly: [], yearly: [] };

    // Helper to group by key
    const groupBy = (keyFn, labelFn) => {
      const grouped = {};
      records.forEach(item => {
        const key = keyFn(item); // e.g., "2024-01-01" or "2024-01"
        if (!grouped[key]) {
          grouped[key] = {
            name: labelFn ? labelFn(item) : key,
            rawDate: new Date(item.date), // Store for sorting
            Income: 0,
            Expenses: 0,
            Balance: 0
          };
        }
        grouped[key].Income += Number(item.income || 0);
        grouped[key].Expenses += Number(item.expenditure || 0);
      });

      // Calc Balance and Convert to Array
      const result = Object.values(grouped).map(g => ({
        ...g,
        Balance: g.Income - g.Expenses
      }));

      // Sort by date
      return result.sort((a, b) => a.rawDate - b.rawDate);
    };

    // 1. Daily
    const daily = groupBy(
      (item) => item.date,
      (item) => {
        const d = new Date(item.date);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Jan 1"
      }
    );

    // 2. Monthly
    const monthly = groupBy(
      (item) => item.date.substring(0, 7), // "2024-01"
      (item) => {
        const d = new Date(item.date);
        return d.toLocaleDateString("en-US", { month: "short" }); // "Jan"
      }
    );

    // 3. Yearly
    const yearly = groupBy(
      (item) => item.date.substring(0, 4), // "2024"
      (item) => item.date.substring(0, 4) // "2024"
    );

    return { daily, monthly, yearly };

  }, [rawData, activeChart]);

  // Select data based on timeframe
  const data = timeFrame === "Monthly" ? processedData.monthly : timeFrame === "Yearly" ? processedData.yearly : processedData.daily;

  const latest = data.length > 0 ? data[data.length - 1] : { name: "-", Income: 0, Expenses: 0, Balance: 0 };

  // Use Summary API data for totals
  const currentSummary = activeChart === "operations" ? summaryData.operations : summaryData.maintenance;
  const totals = currentSummary ? {
    Income: Number(currentSummary.total_income || 0),
    Expenses: Number(currentSummary.total_expenditure || 0),
    Balance: Number(currentSummary.total_balance || 0)
  } : {
    // Fallback to client-side calc if API fails or is null
    Income: data.reduce((acc, item) => acc + item.Income, 0),
    Expenses: data.reduce((acc, item) => acc + item.Expenses, 0),
    Balance: data.reduce((acc, item) => acc + item.Balance, 0)
  };

  const sidebarData = sidebarMode === "total" ? totals : latest

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl m-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-xl m-4 border border-red-100 p-4 text-center">
        <div>
          <p className="text-red-500 font-medium mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-white border border-red-200 px-3 py-1 rounded shadow-sm hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 py-3 px-4 sm:px-6 bg-gray-50 w-full max-w-7xl mx-auto">

      {/* 🔹 MAIN CHART AREA */}
      <div className="flex-1 bg-white rounded-xl p-4 shadow-sm flex flex-col border border-gray-100">

        {/* Header: Controls */}
        <div className="flex flex-row justify-between items-center mb-4 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>

            {/* Desktop Title */}
            <h2 className="hidden sm:block text-base font-semibold text-gray-800">
              {activeChart === "operations" ? "Operational Records" : "Maintenance Records"}
            </h2>

            {/* Mobile Dropdown */}
            <div className="sm:hidden relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                <span className="capitalize">{activeChart}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border w-36 z-30">
                  {['operations', 'maintenance'].map((type) => (
                    <button key={type} onClick={() => { setActiveChart(type); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 capitalize">
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset Button (Only visible when filtered) */}
            {activeMetric && (
              <button
                onClick={() => setActiveMetric(null)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors bg-gray-100 px-2 py-1.5 rounded-md"
              >
                <RefreshCcw className="w-3 h-3" /> Reset
              </button>
            )}

            {/* Timeframe Dropdown */}
            <div className="relative">
              <button
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium flex items-center gap-2 hover:bg-gray-200 transition"
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              >
                {timeFrame} <Filter className="w-3 h-3" />
              </button>
              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border w-28 z-30">
                  {["Daily", "Monthly", "Yearly"].map((period) => (
                    <button
                      key={period}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${timeFrame === period ? "font-bold text-blue-600" : "text-gray-600"}`}
                      onClick={() => { setTimeFrame(period); setIsTimeDropdownOpen(false); }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 CHART */}
        <div className="h-64 sm:h-80 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), ""]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "600" }}
                />
                {Object.keys(METRIC_CONFIG).map((metric) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_CONFIG[metric].hex}
                    strokeWidth={activeMetric === metric ? 3 : 2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    strokeOpacity={activeMetric && activeMetric !== metric ? 0.15 : 1}
                    animationDuration={800}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No data available for this period
            </div>
          )}
        </div>
      </div>

      {/* 🔹 SIDEBAR (Desktop) / BOTTOM (Mobile) */}
      <div className="lg:w-64 flex flex-col gap-4">

        {/* VIEW TOGGLE (The "Slider") */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex relative">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-900 rounded-lg transition-all duration-300 ${sidebarMode === 'recent' ? 'translate-x-full left-1' : 'left-1'}`}
          />
          <button
            onClick={() => setSidebarMode("total")}
            className={`flex-1 py-1.5 text-xs font-medium z-10 text-center transition-colors ${sidebarMode === 'total' ? 'text-white' : 'text-gray-500'}`}
          >
            Total View
          </button>
          <button
            onClick={() => setSidebarMode("recent")}
            className={`flex-1 py-1.5 text-xs font-medium z-10 text-center transition-colors ${sidebarMode === 'recent' ? 'text-white' : 'text-gray-500'}`}
          >
            Recent
          </button>
        </div>

        {/* METRIC CARDS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1 flex flex-col justify-center gap-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">
            {sidebarMode === "total" ? `Total (${timeFrame})` : `Latest (${latest.name})`}
          </h4>

          {Object.keys(METRIC_CONFIG).map(metric => {
            const config = METRIC_CONFIG[metric];
            const isActive = activeMetric === metric;

            return (
              <div
                key={metric}
                onClick={() => setActiveMetric(isActive ? null : metric)}
                className={`
                    group p-3 rounded-lg cursor-pointer border transition-all duration-200
                    flex items-center justify-between
                    ${isActive ? `${config.bg} ${config.border} border-l-4` : "border-transparent bg-gray-50 hover:bg-gray-100"}
                    ${activeMetric && !isActive ? "opacity-40" : "opacity-100"}
                 `}
                style={{ borderLeftColor: isActive ? config.hex : 'transparent' }}
              >
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${isActive ? config.text : "text-gray-500"}`}>{metric}</span>
                  <span className={`text-sm font-bold text-gray-800`}>{formatCurrency(sidebarData[metric])}</span>
                </div>
                {isActive && <div className={`w-2 h-2 rounded-full ${config.bg.replace('50', '400')}`} />}
              </div>
            )
          })}
        </div>

        {/* DESKTOP ONLY: Quick Chart Switcher */}
        <div className="hidden lg:block bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setActiveChart(activeChart === 'operations' ? 'maintenance' : 'operations')}>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Switch View</span>
            </div>
            <span className="text-xs font-bold text-blue-600 capitalize">{activeChart === 'operations' ? 'Maintenance >' : 'Operations >'}</span>
          </div>
        </div>

      </div>
    </div>
  )
}