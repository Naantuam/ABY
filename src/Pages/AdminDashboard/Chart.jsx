"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, BarChart3, ChevronDown } from "lucide-react"

const sampleData = {
  operations: {
    daily: [
    { name: "Jan 1", Income: 150000, Expenses: 80000, Balance: 70000 },
    { name: "Jan 2", Income: 200000, Expenses: 120000, Balance: 80000 },
    { name: "Jan 3", Income: 350000, Expenses: 150000, Balance: 200000 },
    { name: "Jan 4", Income: 280000, Expenses: 140000, Balance: 140000 },
    { name: "Jan 5", Income: 300000, Expenses: 120000, Balance: 180000 },
    { name: "Jan 6", Income: 400000, Expenses: 160000, Balance: 240000 },
    { name: "Jan 7", Income: 380000, Expenses: 170000, Balance: 210000 },
    { name: "Jan 8", Income: 250000, Expenses: 110000, Balance: 140000 },
    { name: "Jan 9", Income: 180000, Expenses: 90000, Balance: 90000 },
    { name: "Jan 10", Income: 290000, Expenses: 150000, Balance: 140000 },
    { name: "Jan 11", Income: 320000, Expenses: 130000, Balance: 190000 },
    { name: "Jan 12", Income: 450000, Expenses: 180000, Balance: 270000 },
    { name: "Jan 13", Income: 420000, Expenses: 160000, Balance: 260000 },
    { name: "Jan 14", Income: 190000, Expenses: 100000, Balance: 90000 },
    { name: "Jan 15", Income: 230000, Expenses: 90000, Balance: 140000 },
    { name: "Jan 16", Income: 270000, Expenses: 130000, Balance: 140000 },
    { name: "Jan 17", Income: 310000, Expenses: 150000, Balance: 160000 },
    { name: "Jan 18", Income: 410000, Expenses: 170000, Balance: 240000 },
    { name: "Jan 19", Income: 500000, Expenses: 200000, Balance: 300000 },
    { name: "Jan 20", Income: 480000, Expenses: 190000, Balance: 290000 },
    { name: "Jan 21", Income: 200000, Expenses: 110000, Balance: 90000 },
    { name: "Jan 22", Income: 240000, Expenses: 120000, Balance: 120000 },
    { name: "Jan 23", Income: 280000, Expenses: 140000, Balance: 140000 },
    { name: "Jan 24", Income: 330000, Expenses: 160000, Balance: 170000 },
    { name: "Jan 25", Income: 370000, Expenses: 180000, Balance: 190000 },
    { name: "Jan 26", Income: 520000, Expenses: 220000, Balance: 300000 },
    { name: "Jan 27", Income: 550000, Expenses: 240000, Balance: 310000 },
    { name: "Jan 28", Income: 210000, Expenses: 100000, Balance: 110000 },
    { name: "Jan 29", Income: 260000, Expenses: 130000, Balance: 130000 },
    { name: "Jan 30", Income: 340000, Expenses: 150000, Balance: 190000 },
    { name: "Jan 31", Income: 400000, Expenses: 180000, Balance: 220000 }
],
    monthly: [
      { name: "Jan", Income: 8000000, Expenses: 3000000, Balance: 11000000 },
      { name: "Feb", Income: 15000000, Expenses: 8000000, Balance: 23000000 },
      { name: "Mar", Income: 12000000, Expenses: 6000000, Balance: 18000000 },
      { name: "Apr", Income: 20000000, Expenses: 10000000, Balance: 30000000 },
      { name: "May", Income: 17000000, Expenses: 12000000, Balance: 29000000 },
      { name: "Jun", Income: 22000000, Expenses: 15000000, Balance: 37000000 },
      { name: "Jul", Income: 18000000, Expenses: 9000000, Balance: 27000000 },
      { name: "Aug", Income: 25000000, Expenses: 11000000, Balance: 36000000 },
      { name: "Sep", Income: 20000000, Expenses: 8000000, Balance: 28000000 },
      { name: "Oct", Income: 23000000, Expenses: 12000000, Balance: 35000000 },
      { name: "Nov", Income: 19000000, Expenses: 7000000, Balance: 26000000 },
      { name: "Dec", Income: 20785000, Expenses: 5040000, Balance: 20785000 },
    ],
    yearly: [
      { name: "2020", Income: 180000000, Expenses: 85000000, Balance: 265000000 },
      { name: "2021", Income: 195000000, Expenses: 92000000, Balance: 287000000 },
      { name: "2022", Income: 210000000, Expenses: 98000000, Balance: 308000000 },
      { name: "2023", Income: 225000000, Expenses: 105000000, Balance: 330000000 },
      { name: "2024", Income: 219785000, Expenses: 106040000, Balance: 325825000 },
    ],
  },
  maintenance: {
    "daily": [
    { name: "Jan 1", Income: 100000, Expenses: 50000, Balance: 50000 },
    { name: "Jan 2", Income: 150000, Expenses: 70000, Balance: 80000 },
    { name: "Jan 3", Income: 200000, Expenses: 80000, Balance: 120000 },
    { name: "Jan 4", Income: 180000, Expenses: 75000, Balance: 105000 },
    { name: "Jan 5", Income: 250000, Expenses: 100000, Balance: 150000 },
    { name: "Jan 6", Income: 300000, Expenses: 110000, Balance: 190000 },
    { name: "Jan 7", Income: 120000, Expenses: 60000, Balance: 60000 },
    { name: "Jan 8", Income: 130000, Expenses: 55000, Balance: 75000 },
    { name: "Jan 9", Income: 170000, Expenses: 65000, Balance: 105000 },
    { name: "Jan 10", Income: 210000, Expenses: 90000, Balance: 120000 },
    { name: "Jan 11", Income: 230000, Expenses: 95000, Balance: 135000 },
    { name: "Jan 12", Income: 320000, Expenses: 120000, Balance: 200000 },
    { name: "Jan 13", Income: 280000, Expenses: 100000, Balance: 180000 },
    { name: "Jan 14", Income: 110000, Expenses: 50000, Balance: 60000 },
    { name: "Jan 15", Income: 140000, Expenses: 60000, Balance: 80000 },
    { name: "Jan 16", Income: 190000, Expenses: 70000, Balance: 120000 },
    { name: "Jan 17", Income: 220000, Expenses: 85000, Balance: 135000 },
    { name: "Jan 18", Income: 260000, Expenses: 110000, Balance: 150000 },
    { name: "Jan 19", Income: 350000, Expenses: 130000, Balance: 220000 },
    { name: "Jan 20", Income: 310000, Expenses: 120000, Balance: 190000 },
    { name: "Jan 21", Income: 125000, Expenses: 55000, Balance: 70000 },
    { name: "Jan 22", Income: 160000, Expenses: 65000, Balance: 95000 },
    { name: "Jan 23", Income: 200000, Expenses: 75000, Balance: 125000 },
    { name: "Jan 24", Income: 240000, Expenses: 100000, Balance: 140000 },
    { name: "Jan 25", Income: 270000, Expenses: 110000, Balance: 160000 },
    { name: "Jan 26", Income: 380000, Expenses: 140000, Balance: 240000 },
    { name: "Jan 27", Income: 330000, Expenses: 130000, Balance: 200000 },
    { name: "Jan 28", Income: 135000, Expenses: 60000, Balance: 75000 },
    { name: "Jan 29", Income: 175000, Expenses: 70000, Balance: 105000 },
    { name: "Jan 30", Income: 255000, Expenses: 105000, Balance: 150000 },
    { name: "Jan 31", Income: 260000, Expenses: 105000, Balance: 155000 }
],
    monthly: [
      { name: "Jan", Income: 5000000, Expenses: 2000000, Balance: 7000000 },
      { name: "Feb", Income: 8000000, Expenses: 4000000, Balance: 12000000 },
      { name: "Mar", Income: 6000000, Expenses: 3000000, Balance: 9000000 },
      { name: "Apr", Income: 12000000, Expenses: 5000000, Balance: 17000000 },
      { name: "May", Income: 10000000, Expenses: 6000000, Balance: 16000000 },
      { name: "Jun", Income: 14000000, Expenses: 7000000, Balance: 21000000 },
      { name: "Jul", Income: 11000000, Expenses: 4000000, Balance: 15000000 },
      { name: "Aug", Income: 16000000, Expenses: 6000000, Balance: 22000000 },
      { name: "Sep", Income: 13000000, Expenses: 5000000, Balance: 18000000 },
      { name: "Oct", Income: 15000000, Expenses: 7000000, Balance: 22000000 },
      { name: "Nov", Income: 12000000, Expenses: 4000000, Balance: 16000000 },
      { name: "Dec", Income: 14500000, Expenses: 3500000, Balance: 18000000 },
    ],
    yearly: [
      { name: "2020", Income: 95000000, Expenses: 45000000, Balance: 140000000 },
      { name: "2021", Income: 105000000, Expenses: 48000000, Balance: 153000000 },
      { name: "2022", Income: 115000000, Expenses: 52000000, Balance: 167000000 },
      { name: "2023", Income: 125000000, Expenses: 55000000, Balance: 180000000 },
      { name: "2024", Income: 136500000, Expenses: 56500000, Balance: 193000000 },
    ],
  },
}

// Helper function to format ₦ values
const formatCurrency = (value) => `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`

export default function OperationsChart() {
  const [timeFrame, setTimeFrame] = useState("Daily")
  const [activeChart, setActiveChart] = useState("operations")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)

  const getDataForTimeFrame = () => {
    const chartData = activeChart === "operations" ? sampleData.operations : sampleData.maintenance
    switch (timeFrame) {
      case "Monthly":
        return chartData.monthly
      case "Yearly":
        return chartData.yearly
      default:
        return chartData.daily
    }
  }

  const data = getDataForTimeFrame()
  const latest = data[data.length - 1]

  const totals = data.reduce(
    (acc, item) => {
      acc.Income += item.Income
      acc.Expenses += item.Expenses
      return acc
    },
    { Income: 0, Expenses: 0, Balance: 0 }
  )

  totals.Balance = totals.Income - totals.Expenses 


  return (
    <div className="flex flex-col lg:flex-row gap-0 sm:gap-6 py-0 sm:py-3 px-0 sm:px-6 bg-gray-50 w-full">
      
      {/* Main Chart Area */}
      <div className="flex-1 bg-white rounded-none sm:rounded-2xl p-0 md:p-4 shadow-none sm:shadow-sm">
        
        {/* Header Row */}
        <div className="flex flex-row justify-between items-center px-4 pt-4 sm:px-0 sm:pt-0 mb-3 relative z-20">
          
          {/* Left Side: Chart Type Selector */}
          <div className="flex items-center">
            
            {/* DESKTOP ONLY: Title */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                {activeChart === "operations" ? "Operational Records" : "Maintenance Records"}
              </h2>
            </div>

            {/* MOBILE ONLY: Chart Selector Dropdown */}
            <div className="sm:hidden relative">
                <div 
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className="px-2 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <BarChart3 className="w-3 h-3 text-blue-600" />
                    <span className="capitalize">{activeChart}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {/* Dropdown Body */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 w-40 z-30 overflow-hidden">
                    <button
                      onClick={() => { setActiveChart("operations"); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 ${activeChart === 'operations' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                       <BarChart3 className="w-3 h-3" /> Operations
                    </button>
                    <button
                      onClick={() => { setActiveChart("maintenance"); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 ${activeChart === 'maintenance' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                       <BarChart3 className="w-3 h-3" /> Maintenance
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Right Side: Time Period Dropdown */}
          <div className="relative">
            <div
              className="px-2 py-2 bg-gray-100 text-black rounded-lg text-xs md:text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-between gap-1 sm:gap-0 w-auto"
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            >
              <span>{timeFrame}</span>
              <svg
                className={`w-3 h-3 transform transition-transform ${
                  isTimeDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-28 sm:w-32 z-30">
                {["Daily", "Monthly", "Yearly"].map((period) => (
                  <div
                    key={period}
                    className={`px-3 py-2 text-xs md:text-sm cursor-pointer transition-colors ${
                      timeFrame === period
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setTimeFrame(period);
                      setIsTimeDropdownOpen(false);
                    }}
                  >
                    {period}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-50 md:h-60 mb-2 overflow-x-auto no-scrollbar relative z-0">
          <div className="min-w-[500px] sm:min-w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), ""]}
                labelStyle={{ color: "#333" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "white" }} />
              <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2, fill: "white" }} />
              <Line type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2, fill: "white" }} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Summary Cards (Totals) */}
        <div className="flex justify-around items-center gap-2 sm:gap-4 flex-wrap px-4 pb-4 sm:px-0 sm:pb-0">
          <div className="flex-1 rounded-lg p-1 text-center cursor-pointer bg-green-50 sm:bg-transparent sm:hover:bg-green-100 transition-colors">
            <p className="text-xs sm:text-base font-medium text-green-600">{formatCurrency(totals.Income)}</p>
          </div>
          <div className="flex-1 rounded-lg p-1 text-center cursor-pointer bg-red-50 sm:bg-transparent sm:hover:bg-red-100 transition-colors">
            <p className="text-xs sm:text-base font-medium text-red-600">{formatCurrency(totals.Expenses)}</p>
          </div>
          <div className="flex-1 rounded-lg p-1 text-center cursor-pointer bg-blue-50 sm:bg-transparent sm:hover:bg-blue-100 transition-colors">
            <p className="text-xs sm:text-base font-medium text-blue-600">{formatCurrency(totals.Balance)}</p>
          </div>
        </div>
      </div>

       {/* Summary for mobile (appears below chart) */}
        <div className="lg:hidden mt-3 px-4 pb-6">
          <div className="relative">
            <div className="bg-white rounded-xl p-4 shadow-sm w-full h-30">
              
              {/* FIXED: Changed header to just "Latest" as requested */}
              <h4 className="text-base justify-center text-center font-medium text-black mb-2">
                Latest
              </h4>

              <div className="flex flex-row justify-between">
                <div className="rounded-lg p-1 text-center cursor-pointer hover:bg-green-100 transition-colors">
                  <p className="text-sm font-semibold text-green-700 mb-1">Income</p>
                  <p className="text-xs sm:text-base font-medium text-green-600">{formatCurrency(latest.Income)}</p>
                </div>
                <div className="rounded-lg p-1 text-center cursor-pointer hover:bg-red-100 transition-colors">
                  <p className="text-sm font-semibold text-red-700 mb-1">Expenses</p>
                  <p className="text-xs sm:text-base font-medium text-red-600">{formatCurrency(latest.Expenses)}</p>
                </div>
                <div className="rounded-lg p-1 text-center cursor-pointer hover:bg-blue-100 transition-colors">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Balance</p>
                  <p className="text-xs sm:text-base font-medium text-blue-600">{formatCurrency(latest.Balance)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Right Sidebar - Hidden on Mobile */}
      <div className="hidden lg:block w-35 space-y-4">
        <div className="relative">
    <div
      className={`bg-white rounded-2xl p-2 shadow-sm cursor-pointer transition-colors ${
        activeChart ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
      }`}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <div className="flex items-center justify-between">
        <div className="w-auto h-8 rounded-lg flex flex-row items-center justify-center">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <h3 className="font-medium text-gray-900 hover:text-blue-600 capitalize ml-1">
            {activeChart || "Select Option"}
          </h3>
        </div>
      </div>
    </div>

    {/* Dropdown Menu */}
    {isDropdownOpen && (
      <div className="absolute mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 w-full z-10">
        {["operations", "maintenance"].map((option) => (
          <div
            key={option}
            className={`p-2 cursor-pointer flex items-center gap-2 transition-colors ${
              activeChart === option
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-50 text-gray-900"
            }`}
            onClick={() => {
              setActiveChart(option);
              setIsDropdownOpen(false);
            }}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="capitalize">{option}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Summary Card */}
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-4 h-70">
      {/* FIXED: Changed header to just "Latest" as requested */}
      <h4 className="text-base font-medium text-black mb-5 justify-center text-center">
        Latest
      </h4>
      <div className="space-y-6">
        <div className="rounded-lg p-1 text-center cursor-pointer hover:bg-green-100 transition-colors">
            <p className="text-xs font-semibold text-green-700 mb-1">Income</p>
            <p className="text-sm font-medium text-green-600">{formatCurrency(latest.Income)}</p>
          </div>
          <div className="rounded-lg p-1 text-center cursor-pointer hover:bg-red-100 transition-colors">
            <p className="text-xs font-semibold text-red-700 mb-1">Expenses</p>
            <p className="text-sm font-medium text-red-600">{formatCurrency(latest.Expenses)}</p>
          </div>
          <div className="rounded-lg p-1 text-center cursor-pointer hover:bg-blue-100 transition-colors">
            <p className="text-xs font-semibold text-blue-700 mb-1">Balance</p>
            <p className="text-sm font-medium text-blue-600">{formatCurrency(latest.Balance)}</p>
          </div>
      </div>
      </div>
      </div>
      </div>
  )
}