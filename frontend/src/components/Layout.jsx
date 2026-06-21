import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import {
  LayoutDashboard, Upload, History,
  UserCircle, LogOut, Activity, Sun, Moon
} from "lucide-react"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analysis",  icon: Upload,          label: "Analysis"  },
  { to: "/history",   icon: History,         label: "History"   },
  { to: "/profile",   icon: UserCircle,      label: "Profile"   },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // Get first letter of user's name
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U"

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col fixed h-full z-10">
        
        {/* Top: Logo row */}
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">RetainIQ</span>
          </div>
        </div>

        {/* Middle Nav */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[rgba(99,102,241,0.15)] text-[#6366f1] border border-[rgba(99,102,241,0.3)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle Switch */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </span>
          <div
            onClick={toggleTheme}
            className="w-12 h-6 rounded-full bg-[var(--bg-tertiary)] relative cursor-pointer border border-[var(--border-color)]"
          >
            <div
              className={`w-5 h-5 rounded-full bg-indigo-500 absolute top-0.5 transition-all duration-200 ${
                theme === "dark" ? "left-0.5" : "left-6"
              }`}
            />
          </div>
        </div>

        {/* Bottom User Info + Sign Out */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 border border-white/5"
              style={{ backgroundColor: user?.avatar_color || "#6366f1" }}
            >
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name || "User"}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user?.company || "Company"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen p-8 bg-[var(--bg-primary)]">
        <Outlet />
      </main>
    </div>
  )
}