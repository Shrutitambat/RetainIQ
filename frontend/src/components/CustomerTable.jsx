import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X } from "lucide-react"

// ── Churn probability bar and badge helpers ────────────────────────────
function ProbBar({ prob }) {
  const pct = (prob * 100).toFixed(1)
  let color = "#10b981"
  if (prob > 0.7) color = "#ef4444"
  else if (prob >= 0.4) color = "#f59e0b"
  return (
    <div className="flex items-center gap-2 min-w-[150px]">
      <div className="flex-1 h-1.5 bg-[#0a0f1e] rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
  )
}

function RiskBadge({ level }) {
  const styles = {
    High:   "bg-red-500/15 text-red-400 border-red-500/25",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Low:    "bg-green-500/15 text-green-400 border-green-500/25",
  }
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${styles[level] || styles.Low}`}>
      {level}
    </span>
  )
}

// ── AI Insights Modal ──────────────────────────────────────────────────
function InsightsModal({ customer, onClose }) {
  if (!customer) return null
  const customerId = customer.customer_name || `Customer #${customer.customer_index}`

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-[560px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-100 text-base">{customerId}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${
                customer.churn_probability > 0.7
                  ? "bg-red-500/15 text-red-400"
                  : customer.churn_probability >= 0.4
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-green-500/15 text-green-400"
              }`}>
                {(customer.churn_probability * 100).toFixed(1)}% churn probability
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Why they might churn */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Why they might churn
            </h4>
            <div className="bg-[#0a0f1e] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {customer.ai_explanation || "No detailed explanation available. This customer shows low churn risk and is likely to remain loyal."}
              </p>
            </div>
          </div>

          {/* Retention Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Retention Recommendations
            </h4>
            {customer.ai_recommendations && customer.ai_recommendations.length > 0 ? (
              <ol className="space-y-3">
                {customer.ai_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#6366f1]/15 text-[#6366f1] text-[10px] font-bold shrink-0 mt-0.5 border border-[#6366f1]/25">
                      {i + 1}
                    </span>
                    <div className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-[#6366f1] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="bg-green-500/5 border border-green-500/15 text-green-400 text-xs rounded-xl p-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Customer is in good standing. Maintain standard engagement.
              </div>
            )}
          </div>

          {/* Close btn */}
          <button
            onClick={onClose}
            className="w-full mt-8 py-2.5 text-xs font-semibold rounded-xl bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/25 hover:bg-[#6366f1]/20 transition-all cursor-pointer"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ── Main CustomerTable ─────────────────────────────────────────────────
export default function CustomerTable({ customers = [] }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#0a0f1e] border-b border-[rgba(99,102,241,0.15)]">
                {["#", "Customer ID", "Churn Probability", "Risk Level", "Segment", "Actions"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {customers.map((customer, idx) => (
                <tr
                  key={customer.id || idx}
                  className="border-b border-[rgba(99,102,241,0.08)] hover:bg-[#0a0f1e] transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{idx + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-200 max-w-[140px] truncate">
                    {customer.customer_name || `Customer #${customer.customer_index}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <ProbBar prob={customer.churn_probability} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskBadge level={customer.risk_level} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
                      {customer.segment || "Low Risk"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-xs font-semibold text-[#6366f1] hover:text-[#8b5cf6] border border-[#6366f1]/25 hover:border-[#6366f1]/50 px-3 py-1.5 rounded-lg transition-all cursor-pointer bg-[#6366f1]/5 hover:bg-[#6366f1]/10"
                    >
                      View Insights
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Modal */}
      {selectedCustomer && (
        <InsightsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </>
  )
}
