import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { logout } from '../utils/api'

export default function Navbar({ user }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`text-sm font-semibold tracking-wide transition-colors ${
        isActive(path)
          ? 'text-amber-700 border-b-2 border-amber-600 pb-0.5'
          : 'text-stone-500 hover:text-stone-800'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200" style={{
      background: 'linear-gradient(180deg, #ffffff, #fafaf9)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              boxShadow: '0 1px 3px rgba(180,83,9,0.3)',
            }}>
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="text-base font-bold tracking-tight text-stone-800">VibeTrack</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLink('/dashboard', 'Dashboard')}
            {navLink('/insights', 'Insights')}
            {navLink('/settings', 'Settings')}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <span className="text-xs font-medium text-stone-400">{user.username}</span>
            )}
            <button
              onClick={logout}
              className="text-xs font-semibold text-stone-400 hover:text-stone-600 transition-colors"
            >
              Sign out
            </button>
          </div>

          <button
            className="md:hidden text-stone-600 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {menuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-in" style={{ animationDuration: '0.2s' }}>
            <Link to="/dashboard" className="block text-sm font-semibold text-stone-600">Dashboard</Link>
            <Link to="/insights" className="block text-sm font-semibold text-stone-600">Insights</Link>
            <Link to="/settings" className="block text-sm font-semibold text-stone-600">Settings</Link>
            <button onClick={logout} className="block text-sm font-semibold text-stone-400">Sign out</button>
          </div>
        )}
      </div>
    </nav>
  )
}
