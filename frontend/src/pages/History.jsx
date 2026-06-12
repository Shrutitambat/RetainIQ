import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { History as HistoryIcon, Trash2, Eye, Plus, Loader2 } from "lucide-react"
import api from "../utils/api"

const fmtDate = (ds) =>
  new Date(ds).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  })

export default function History() {
  const [historyList, setHistoryList] = useState([])
  const [loading, setLoading]         = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/analysis/history")
      setHistoryList(res.data)
    } catch {
      toast.error("Failed to load history.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation()
    if (!window.confirm(`Delete analysis "${item.filename}"? This cannot be undone.`)) return
    try {
      await api.delete(`/api/analysis/${item.id}`)
      setHistoryList(prev => prev.filter(h => h.id !== item.id))
      toast.success("Analysis deleted.")
    } catch {
      toast.error("Failed to delete analysis.")
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analysis History</h1>
          <p className="text-slate-500 text-sm mt-1">All past customer churn prediction batches</p>
        </div>
        <Link
          to="/analysis"
          className="btn-primary text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Analysis
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
          <p className="text-xs text-slate-500">Loading past analyses...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && historyList.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 glass-card max-w-md mx-auto flex flex-col items-center gap-5 p-10"
        >
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-500">
            <HistoryIcon className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-300">No analyses yet</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a customer CSV to start predicting churn.</p>
          </div>
          <Link
            to="/analysis"
            className="btn-primary text-xs font-semibold px-5 py-2.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Start First Analysis
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      {!loading && historyList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {historyList.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5 flex flex-col gap-4 hover:border-[#6366f1]/30 transition-all duration-300"
              >
                {/* Top row: filename + date */}
                <div>
                  <p className="text-sm font-bold text-slate-200 truncate">{item.filename}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{fmtDate(item.created_at)}</p>
                </div>

                {/* Stat chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
                    {item.total_customers} Total
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    {item.high_risk_count} High
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {item.medium_risk_count} Medium
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                    {item.low_risk_count} Low
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(99,102,241,0.08)]">
                  <button
                    onClick={() => navigate(`/history/${item.id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:text-[#8b5cf6] border border-[#6366f1]/25 px-3 py-1.5 rounded-lg hover:border-[#6366f1]/50 transition-all cursor-pointer bg-[#6366f1]/5 hover:bg-[#6366f1]/10"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, item)}
                    className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                    title="Delete analysis"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  )
}
