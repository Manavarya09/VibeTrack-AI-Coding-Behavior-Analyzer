import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import SessionTimer from './components/SessionTimer'
import { Activity, Clock, Zap, Coffee, Download } from 'lucide-react'

function App() {
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [dailyStats, setDailyStats] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [statsRes, sessionsRes, dailyRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/sessions'),
        fetch('/api/stats/daily?days=7')
      ])
      const statsData = await statsRes.json()
      const sessionsData = await sessionsRes.json()
      const dailyData = await dailyRes.json()
      
      setStats(statsData)
      setSessions(sessionsData)
      setDailyStats(dailyData)
      
      const active = sessionsData.find(s => s.is_active)
      setCurrentSession(active || null)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, source: 'web' })
      })
      const session = await res.json()
      setCurrentSession(session)
      fetchData()
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleEndSession = async () => {
    if (!currentSession) return
    try {
      await fetch(`/api/session/end/${currentSession.id}`, { method: 'POST' })
      setCurrentSession(null)
      fetchData()
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/analytics/export?user_id=1')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'vibetrack_sessions.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600">Loading VibeTrack...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-800">VibeTrack</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <span className="text-sm text-slate-500">AI Coding Behavior Analyzer</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Clock className="w-6 h-6 text-blue-500" />}
            label="Total Sessions"
            value={stats?.total_sessions || 0}
            subtext="coding sessions"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-green-500" />}
            label="Total Minutes"
            value={Math.round(stats?.total_minutes || 0)}
            subtext="time coding"
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-purple-500" />}
            label="Avg Vibe Score"
            value={stats?.avg_vibe_score || 'N/A'}
            subtext="engagement level"
          />
          <StatCard
            icon={<Coffee className="w-6 h-6 text-orange-500" />}
            label="Break Time"
            value={Math.round(stats?.total_break_minutes || 0)}
            subtext="minutes break"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Dashboard stats={stats} dailyStats={dailyStats} sessions={sessions} />
          </div>
          <div>
            <SessionTimer
              currentSession={currentSession}
              onStart={handleStartSession}
              onEnd={handleEndSession}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-400">{subtext}</p>
        </div>
      </div>
    </div>
  )
}

export default App
