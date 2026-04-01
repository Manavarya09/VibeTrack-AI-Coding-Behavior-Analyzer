import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'
import Settings from './pages/Settings'
import MLInsights from './pages/MLInsights'
import { getStoredUser, getMe, clearToken } from './utils/api'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('vibetrack_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [user, setUser] = useState(getStoredUser())
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('vibetrack_token')
    if (token && !user) {
      getMe()
        .then(u => { setUser(u); setChecking(false) })
        .catch(() => { clearToken(); setChecking(false) })
    } else {
      setChecking(false)
    }
  }, [])

  if (checking) return null

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard user={user} /></ProtectedRoute>
        } />
        <Route path="/session/:id" element={
          <ProtectedRoute><Session user={user} /></ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute><MLInsights user={user} /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><Settings user={user} /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
