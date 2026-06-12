import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { UploadCloud, FileText, X, Sparkles, Loader2 } from "lucide-react"
import api from "../utils/api"
import CustomerTable from "../components/CustomerTable"

const STATUS_STEPS = [
  "Preprocessing customer data...",
  "Running XGBoost model...",
  "Computing SHAP values...",
  "Generating AI insights with Gemini...",
]

export default function Analysis() {
  const [file, setFile]               = useState(null)
  const [dragActive, setDragActive]   = useState(false)
  const [loading, setLoading]         = useState(false)
  const [statusIdx, setStatusIdx]     = useState(0)
  const [analysis, setAnalysis]       = useState(null)
  const fileInputRef                  = useRef(null)
  const statusTimerRef                = useRef(null)

  // Cycle status text every 2 s while loading
  useEffect(() => {
    if (loading) {
      setStatusIdx(0)
      statusTimerRef.current = setInterval(() => {
        setStatusIdx(i => (i + 1) % STATUS_STEPS.length)
      }, 2000)
    } else {
      clearInterval(statusTimerRef.current)
    }
    return () => clearInterval(statusTimerRef.current)
  }, [loading])

  // ── drag handlers ──────────────────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith(".csv")) setFile(dropped)
    else toast.error("Only .csv files are accepted.")
  }

  // ── submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setAnalysis(null)

    const form = new FormData()
    form.append("file", file)

    try {
      const uploadRes = await api.post("/api/analysis/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const detailRes = await api.get(`/api/analysis/${uploadRes.data.analysis_id}`)
      setAnalysis(detailRes.data)
      toast.success("Analysis complete!")
    } catch (err) {
      toast.error(err.response?.data?.detail || "Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setAnalysis(null) }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-slate-800/60 pb-6">
        <h1 className="text-2xl font-bold text-slate-100">New Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload a customer CSV file to run churn predictions and generate AI retention strategies.
        </p>
      </div>

      {/* Upload zone / loading / results */}
      {!analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-5"
        >
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => !loading && !file && fileInputRef.current?.click()}
            className={`glass-card min-h-[260px] flex flex-col items-center justify-center text-center
              border-dashed border-2 transition-all duration-300 cursor-pointer relative overflow-hidden
              ${dragActive
                ? "border-[#6366f1] bg-[#6366f1]/5"
                : "border-[rgba(99,102,241,0.35)] hover:border-[#6366f1]/70"
              }
              ${loading ? "cursor-default" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f?.name.endsWith(".csv")) setFile(f)
                else if (f) toast.error("Only .csv files are accepted.")
              }}
            />

            {/* Loading overlay */}
            {loading && (
              <div className="w-full px-10 space-y-6">
                <Loader2 className="h-10 w-10 text-[#6366f1] animate-spin mx-auto" />
                
                {/* Animated progress bar */}
                <div className="w-full bg-[#0a0f1e] rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full"
                    style={{
                      width: "0%",
                      animation: "progressFill 8s ease-out forwards"
                    }}
                  />
                </div>
                <style>{`
                  @keyframes progressFill {
                    0%   { width: 0% }
                    100% { width: 90% }
                  }
                `}</style>

                <p className="text-xs font-semibold text-[#6366f1] tracking-wide">
                  {STATUS_STEPS[statusIdx]}
                </p>
              </div>
            )}

            {/* File selected state */}
            {!loading && file && (
              <div
                className="flex items-center gap-3 px-5 py-3.5 bg-[#0a0f1e] border border-[rgba(99,102,241,0.25)] rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-5 w-5 text-[#6366f1] shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate max-w-[220px]">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Default empty state */}
            {!loading && !file && (
              <>
                <UploadCloud className="h-12 w-12 text-[#6366f1] mb-4" />
                <p className="text-base font-bold text-slate-200 mb-1">Drag & drop your CSV file</p>
                <p className="text-xs text-slate-500">or click to browse · Max 1,000 customers</p>
              </>
            )}
          </div>

          {/* Run Analysis Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2
              ${(!file || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              : <><Sparkles className="h-4 w-4" /> Run Analysis</>
            }
          </button>
        </motion.div>

      ) : (
        /* ── RESULTS ─────────────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Sub-header with file info + new upload CTA */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Results for: <span className="text-[#6366f1] font-semibold">{analysis.filename}</span>
              {" · "}{analysis.total_customers} customers
            </p>
            <button
              onClick={reset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 px-4 py-2 rounded-xl hover:border-slate-700 transition-all cursor-pointer"
            >
              Upload New File
            </button>
          </div>

          {/* Executive Summary Card */}
          <div
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
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
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
          </div>

          {/* Customer Table */}
          <CustomerTable customers={analysis.customers || []} />
        </motion.div>
      )}

    </div>
  )
}
