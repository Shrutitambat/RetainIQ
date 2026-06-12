import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import api from "../utils/api"
import CustomerTable from "../components/CustomerTable"

const fmtDate = (ds) =>
  new Date(ds).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  })

export default function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/analysis/${id}`)
        setAnalysis(res.data)
      } catch (err) {
        toast.error("Failed to load analysis details.")
        navigate("/history")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <Loader2 className="h-9 w-9 text-[#6366f1] animate-spin" />
        <p className="text-xs text-slate-500">Loading analysis details...</p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="space-y-8">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 px-4 py-2 rounded-xl hover:border-slate-700 transition-all cursor-pointer self-start"
      >
        <ArrowLeft className="h-4 w-4" /> Back to History
      </button>

      {/* Title + date */}
      <div className="border-b border-slate-800/60 pb-6">
        <h1 className="text-xl font-bold text-slate-100 truncate">{analysis.filename}</h1>
        <p className="text-xs text-slate-500 mt-1">{fmtDate(analysis.created_at)}</p>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-4 gap-4"
      >
        {[
          { label: "Total",   value: analysis.total_customers,   color: "text-[#6366f1]" },
          { label: "High",    value: analysis.high_risk_count,    color: "text-red-400"   },
          { label: "Medium",  value: analysis.medium_risk_count,  color: "text-amber-400" },
          { label: "Safe",    value: analysis.low_risk_count,     color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-card p-6 flex gap-4"
        style={{ borderLeft: "4px solid #6366f1" }}
      >
        <Sparkles className="h-5 w-5 text-[#6366f1] shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-2">
            AI Executive Summary
          </p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {analysis.executive_summary}
          </p>
        </div>
      </motion.div>

      {/* Customer Table (shared component) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <CustomerTable customers={analysis.customers || []} />
      </motion.div>

    </div>
  )
}
