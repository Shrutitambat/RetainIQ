import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer 
} from "recharts"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import {
  Users, AlertTriangle, TrendingDown, CheckCircle, 
  Upload, History, ArrowRight, Loader2
} from "lucide-react"

const COLORS = ["#ef4444", "#f59e0b", "#10b981"] // High, Medium, Low/Safe

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [historyList, setHistoryList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get("/api/analysis/history")
      setHistoryList(response.data)
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Aggregate stats across all analyses
  const totalCustomers = historyList.reduce((s, h) => s + h.total_customers, 0)
  const totalHigh      = historyList.reduce((s, h) => s + h.high_risk_count, 0)
  const totalMedium    = historyList.reduce((s, h) => s + h.medium_risk_count, 0)
  const totalLow       = historyList.reduce((s, h) => s + h.low_risk_count, 0)

  const pieData = [
    { name: "High Risk", value: totalHigh },
    { name: "Medium Risk", value: totalMedium },
    { name: "Low Risk", value: totalLow },
  ].filter(d => d.value > 0) // Only include categories with values

  const barData = historyList.slice(0, 6).reverse().map(h => ({
    name: h.filename.replace(".csv", "").slice(0, 10),
    high: h.high_risk_count,
    medium: h.medium_risk_count,
    low: h.low_risk_count,
  }))

  const statsCards = [
    { 
      label: "Total Customers", 
      value: totalCustomers, 
      icon: Users, 
      iconColor: "text-[#6366f1]", 
      iconBg: "bg-[#6366f1]/10", 
      borderTheme: "border-b-[#6366f1]" 
    },
    { 
      label: "High Risk", 
      value: totalHigh, 
      icon: AlertTriangle, 
      iconColor: "text-[#ef4444]", 
      iconBg: "bg-[#ef4444]/10", 
      borderTheme: "border-b-[#ef4444]" 
    },
    { 
      label: "Medium Risk", 
      value: totalMedium, 
      icon: TrendingDown, 
      iconColor: "text-[#f59e0b]", 
      iconBg: "bg-[#f59e0b]/10", 
      borderTheme: "border-b-[#f59e0b]" 
    },
    { 
      label: "Safe Customers", 
      value: totalLow, 
      icon: CheckCircle, 
      iconColor: "text-[#10b981]", 
      iconBg: "bg-[#10b981]/10", 
      borderTheme: "border-b-[#10b981]" 
    },
  ]

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
        <p className="text-xs text-slate-500">Loading intelligence dashboard...</p>
      </div>
    )
  }

  const firstName = user?.name ? user.name.split(" ")[0] : "User"

  return (
    <div className="space-y-8">
      
      {/* Top Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome back, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's your customer retention overview</p>
        </div>
        <Link
          to="/analysis"
          className="btn-primary text-xs font-semibold px-4.5 py-2.5 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          New Analysis
        </Link>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((card) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            className={`glass-card p-5 flex flex-col justify-between border-b-2 ${card.borderTheme} shadow-sm`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-slate-500 font-semibold uppercase">{card.label}</span>
              <div className={`w-9 h-9 rounded-full ${card.iconBg} flex items-center justify-center shrink-0`}>
                <card.icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-150 font-mono">
              {totalCustomers === 0 ? "0" : card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main dashboard content */}
      {historyList.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center py-20 border border-slate-800/80 bg-[#0f1629]/20 rounded-2xl p-8 space-y-5"
        >
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-full w-fit mx-auto text-slate-500">
            <Upload className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-semibold text-slate-300">No analyses yet</h3>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              You haven't run any customer predictions yet. Upload a CSV file to evaluate retention risks.
            </p>
          </div>
          <Link
            to="/analysis"
            className="text-xs font-semibold text-[#6366f1] hover:underline flex items-center justify-center gap-1 cursor-pointer"
          >
            Upload your first CSV →
          </Link>
        </motion.div>
      ) : (
        /* Charts and Tables */
        <div className="space-y-8">
          
          {/* Charts Row */}
          {totalCustomers > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pie Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">Risk Distribution</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => {
                          // Match correct slice color
                          let color = COLORS[2] // Low Risk
                          if (entry.name === "High Risk") color = COLORS[0]
                          else if (entry.name === "Medium Risk") color = COLORS[1]
                          return <Cell key={`cell-${index}`} fill={color} />
                        })}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #2d3a56", borderRadius: 8, color: "#f1f5f9", fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bar Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">Analyses Over Time</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #2d3a56", borderRadius: 8, color: "#f1f5f9", fontSize: "11px" }} />
                      <Bar dataKey="high" fill="#ef4444" radius={[3, 3, 0, 0]} name="High Risk" />
                      <Bar dataKey="medium" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Medium Risk" />
                      <Bar dataKey="low" fill="#10b981" radius={[3, 3, 0, 0]} name="Safe" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
            </div>
          )}

          {/* Bottom Grid: Quick Actions & Recent History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions (1 Column) */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-5">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate("/analysis")} 
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 hover:border-[#6366f1]/50 text-[#6366f1] transition-all group cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Upload size={15} />
                      New Analysis
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => navigate("/history")} 
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0a0f1e] border border-slate-850 hover:border-[#6366f1]/30 text-slate-300 transition-all group cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <History size={15} />
                      View History
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Analyses (2 Columns) */}
            <div className="lg:col-span-2 glass-card p-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-5">Recent Analyses</h3>
              <div className="space-y-3">
                {historyList.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/history/${item.id}`)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0f1e] border border-slate-850 hover:border-[#6366f1]/20 cursor-pointer transition-all hover:bg-[#0a0f1e]/80"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-xs font-bold text-slate-200 truncate">{item.filename}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 border border-red-500/25 bg-red-500/10 text-red-400 font-bold rounded-md">
                        {item.high_risk_count} high
                      </span>
                      <span className="text-[10px] px-2 py-0.5 border border-slate-700 bg-slate-800 text-slate-400 font-bold rounded-md">
                        {item.total_customers} total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}