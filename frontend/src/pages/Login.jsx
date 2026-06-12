import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Activity, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/api/auth/login", { email, password })
      const { access_token, user } = response.data
      
      login(access_token, user)
      toast.success("Welcome back to RetainIQ!")
      navigate("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
      const errMsg = err.response?.data?.detail || "Invalid email or password. Please try again."
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-4"
      style={{
        backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.08) 1.2px, transparent 1.2px)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* 3 Blurred circle orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#6366f1] opacity-20 filter blur-[80px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#8b5cf6] opacity-20 filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[35%] w-[350px] h-[350px] rounded-full bg-[#06b6d4] opacity-20 filter blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-[#0f1629] border border-[rgba(99,102,241,0.2)] rounded-[20px] p-10 shadow-2xl relative z-10"
      >
        {/* RetainIQ Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">
              RetainIQ
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-2">Welcome back</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in to manage your customer retention</p>
        </div>

        {/* Error inline block */}
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-[#0a0f1e] border border-[rgba(99,102,241,0.2)] focus:border-[#6366f1] rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-[#6366f1] transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-[#0a0f1e] border border-[rgba(99,102,241,0.2)] focus:border-[#6366f1] rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-[#6366f1] transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-semibold flex justify-center items-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-[#6366f1] hover:underline transition-colors">
            Register now
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
