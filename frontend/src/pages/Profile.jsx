import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const COLOR_SWATCHES = [
  { name: "Indigo",   value: "#6366f1" },
  { name: "Violet",   value: "#8b5cf6" },
  { name: "Cyan",     value: "#06b6d4" },
  { name: "Rose",     value: "#f43f5e" },
  { name: "Amber",    value: "#f59e0b" },
  { name: "Emerald",  value: "#10b981" },
]

// ── Reusable text input ──────────────────────────────────────────────
function Input({ label, id, type = "text", value, onChange, placeholder, rightIcon }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full px-4 py-3 bg-[#0a0f1e] border border-[rgba(99,102,241,0.2)] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Password field with eye toggle ───────────────────────────────────
function PasswordInput({ label, id, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <Input
      label={label}
      id={id}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  )
}

export default function Profile() {
  const { user, updateUser } = useAuth()

  // ── Profile form state ─────────────────────────────────────────────
  const [name, setName]               = useState("")
  const [company, setCompany]         = useState("")
  const [jobTitle, setJobTitle]       = useState("")
  const [avatarColor, setAvatarColor] = useState("#6366f1")
  const [savingProfile, setSavingProfile] = useState(false)

  // ── Password form state ────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw]         = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [savingPw, setSavingPw]   = useState(false)

  // Pre-fill form with current user data on mount / user change
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setCompany(user.company || "")
      setJobTitle(user.job_title || "")
      setAvatarColor(user.avatar_color || "#6366f1")
    }
  }, [user])

  const getInitials = () =>
    (user?.name || "U")
      .split(" ")
      .map(p => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  // ── Save profile ───────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.put("/api/users/me", {
        name,
        company,
        job_title: jobTitle,
        avatar_color: avatarColor,
      })
      updateUser(res.data)
      toast.success("Profile updated!")
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile.")
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change password ────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.")
      return
    }
    setSavingPw(true)
    try {
      await api.put("/api/users/me/password", {
        current_password: currentPw,
        new_password: newPw,
      })
      toast.success("Password changed successfully!")
      setCurrentPw(""); setNewPw(""); setConfirmPw("")
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to change password.")
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-slate-800/60 pb-6">
        <h1 className="text-2xl font-bold text-slate-100">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details and security preferences</p>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Edit Profile ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-7 flex flex-col gap-6"
        >
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Edit Profile</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/10 shadow-lg transition-all duration-300"
              style={{ backgroundColor: avatarColor, fontSize: "24px" }}
            >
              {getInitials()}
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2.5">
              {COLOR_SWATCHES.map(swatch => (
                <button
                  key={swatch.value}
                  type="button"
                  title={swatch.name}
                  onClick={() => setAvatarColor(swatch.value)}
                  className="w-7 h-7 rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: swatch.value,
                    outline: avatarColor === swatch.value ? `3px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              id="p-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
            />
            <Input
              label="Company"
              id="p-company"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Acme Corp"
            />
            <Input
              label="Job Title"
              id="p-job"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="Customer Success Manager"
            />

            <button
              type="submit"
              disabled={savingProfile}
              className={`btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2
                ${savingProfile ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {savingProfile
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                : "Save Changes"
              }
            </button>
          </form>
        </motion.div>

        {/* ── RIGHT: Change Password ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="glass-card p-7 flex flex-col gap-6"
        >
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Security</h2>
          <p className="text-xs text-slate-500 -mt-3">Change your account password below.</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Current Password"
              id="pw-current"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Your current password"
            />
            <PasswordInput
              label="New Password"
              id="pw-new"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="New password"
            />
            <PasswordInput
              label="Confirm New Password"
              id="pw-confirm"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat new password"
            />

            {/* Mismatch hint */}
            {confirmPw && newPw !== confirmPw && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
            )}

            <button
              type="submit"
              disabled={savingPw || (!!confirmPw && newPw !== confirmPw)}
              className={`btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2
                ${(savingPw || (!!confirmPw && newPw !== confirmPw)) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {savingPw
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
                : "Change Password"
              }
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  )
}
