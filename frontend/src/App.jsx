import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Landing   from "./pages/Landing"
import Login     from "./pages/Login"
import Register  from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Analysis  from "./pages/Analysis"
import History   from "./pages/History"
import HistoryDetail from "./pages/HistoryDetail"
import Profile   from "./pages/Profile"
import Layout    from "./components/Layout"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#0f1629", color: "#f1f5f9", border: "1px solid #2d3a56" }
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard"       element={<Dashboard />} />
            <Route path="analysis"        element={<Analysis />} />
            <Route path="history"         element={<History />} />
            <Route path="history/:id"     element={<HistoryDetail />} />
            <Route path="profile"         element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}