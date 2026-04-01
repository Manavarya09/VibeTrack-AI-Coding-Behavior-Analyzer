import { useLocation, Link } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const link = (to, label) => (
    <Link to={to} className={`text-[13px] transition-colors ${
      pathname === to ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
    }`}>{label}</Link>
  )

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
      borderColor: 'var(--border)',
      background: 'rgba(10,10,11,0.8)',
    }}>
      <div className="max-w-[1100px] mx-auto px-5 flex items-center justify-between h-12">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
            <span className="text-[9px] font-black text-white leading-none">VT</span>
          </div>
          <span className="text-[13px] font-semibold text-zinc-300">VibeTrack</span>
        </Link>
        <div className="flex items-center gap-5">
          {link('/dashboard', 'Dashboard')}
          {link('/insights', 'Insights')}
          {link('/settings', 'Settings')}
        </div>
      </div>
    </nav>
  )
}
