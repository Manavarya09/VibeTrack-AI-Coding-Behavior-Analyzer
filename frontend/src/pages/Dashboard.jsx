import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Zap, Clock, Activity, BarChart3, ArrowLeft, Brain, TrendingUp, Coffee, ChevronRight } from 'lucide-react'
import { fetchStats, fetchDailyStats, fetchSessions } from '../utils/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [dailyStats, setDailyStats] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, dailyData, sessionsData] = await Promise.all([
          fetchStats().catch(() => null),
          fetchDailyStats().catch(() => []),
          fetchSessions().catch(() => []),
        ])
        setStats(statsData)
        setDailyStats(Array.isArray(dailyData) ? dailyData : [])
        setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <p className="font-black text-xl">LOADING...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black text-2xl text-red-600 mb-2">ERROR</p>
          <p className="font-bold">{error}</p>
        </div>
      </div>
    )
  }

  const chartData = dailyStats.map(d => ({
    name: d.date.slice(5),
    sessions: d.session_count,
    minutes: Math.round(d.total_minutes)
  }))

  const classificationData = [
    { name: 'NORMAL', value: stats?.normal_count || 0, color: 'bg-gray-500' },
    { name: 'DEEP FLOW', value: stats?.deep_flow_count || 0, color: 'bg-purple-600' },
    { name: 'HIGH DEPENDENCY', value: stats?.high_dependency_count || 0, color: 'bg-red-600' },
  ]

  const totalSessions = stats?.total_sessions || 0
  const totalMinutes = Math.round(stats?.total_minutes || 0)
  const avgScore = stats?.avg_vibe_score ? Math.round(stats.avg_vibe_score) : 0
  const totalPrompts = stats?.total_prompts || 0

  const getClassificationColor = (c) => {
    if (c === 'Deep Flow') return 'bg-purple-600'
    if (c === 'High Dependency') return 'bg-red-600'
    return 'bg-gray-500'
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-black text-white p-3 border-2 border-black font-bold text-sm">
        <p className="mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Top Nav */}
      <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">VIBETRACK</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="font-black text-red-600 border-b-4 border-red-600 pb-1">DASHBOARD</a>
              <a href="/insights" className="font-bold hover:underline">INSIGHTS</a>
              <a href="/settings" className="font-bold hover:underline">SETTINGS</a>
              <a href="/" className="font-bold hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> HOME
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
            YOUR <span className="text-red-600">DASHBOARD</span>
          </h1>
          <p className="text-lg font-bold text-gray-600">TRACK. ANALYZE. OPTIMIZE.</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Activity, label: 'SESSIONS', value: totalSessions, accent: 'bg-black' },
            { icon: Clock, label: 'TOTAL MINUTES', value: totalMinutes, accent: 'bg-red-600' },
            { icon: Zap, label: 'AVG VIBE SCORE', value: avgScore, accent: 'bg-black' },
            { icon: BarChart3, label: 'TOTAL PROMPTS', value: totalPrompts, accent: 'bg-red-600' },
          ].map((stat, i) => (
            <div key={i} className="border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform">
              <div className={`w-10 h-10 ${stat.accent} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-black">{stat.value}</div>
              <div className="text-sm font-bold text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Daily Activity Chart */}
          <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6">DAILY ACTIVITY</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#000" fontWeight={700} fontSize={12} />
                  <YAxis stroke="#000" fontWeight={700} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="minutes" name="Minutes" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', r: 5, strokeWidth: 2, stroke: '#000' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] bg-gray-100 border-2 border-black flex items-center justify-center">
                <p className="font-bold text-gray-400">NO DATA YET</p>
              </div>
            )}
          </div>

          {/* Sessions Per Day Chart */}
          <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6">SESSIONS PER DAY</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#000" fontWeight={700} fontSize={12} />
                  <YAxis stroke="#000" fontWeight={700} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" name="Sessions" fill="#000" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] bg-gray-100 border-2 border-black flex items-center justify-center">
                <p className="font-bold text-gray-400">NO DATA YET</p>
              </div>
            )}
          </div>
        </div>

        {/* Classifications + Recent Sessions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Classification Breakdown */}
          <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6">CLASSIFICATIONS</h2>
            <div className="space-y-4">
              {classificationData.map(item => {
                const total = classificationData.reduce((s, d) => s + d.value, 0) || 1
                const pct = Math.round((item.value / total) * 100)
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm">{item.name}</span>
                      <span className="font-black text-lg">{item.value}</span>
                    </div>
                    <div className="h-5 bg-gray-200 border-2 border-black">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Vibe Formula */}
            <div className="mt-6 pt-6 border-t-4 border-black">
              <p className="font-black text-sm text-gray-500 mb-2">VIBE SCORE FORMULA</p>
              <div className="bg-black text-white p-3">
                <code className="font-mono font-bold text-sm">(Duration × Prompts) / (Breaks + 1)</code>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="lg:col-span-2 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">RECENT SESSIONS</h2>
              <span className="text-sm font-bold text-gray-500">{sessions.length} TOTAL</span>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(0, 6).map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 border-2 border-black hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-12 ${getClassificationColor(session.classification)}`} />
                      <div>
                        <p className="font-black">
                          {new Date(session.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-gray-500">
                          {Math.round(session.duration_minutes)} MIN &bull; {session.prompt_count} PROMPTS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.vibe_score != null && (
                        <div className="flex items-center gap-1 bg-black text-white px-3 py-1">
                          <Zap className="w-4 h-4" />
                          <span className="font-black">{Math.round(session.vibe_score)}</span>
                        </div>
                      )}
                      <div className={`px-3 py-1 font-black text-xs text-white ${getClassificationColor(session.classification)}`}>
                        {(session.classification || 'NORMAL').toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 bg-gray-100 border-2 border-black flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="font-bold text-gray-400">NO SESSIONS YET</p>
                  <p className="text-sm font-bold text-gray-400">START TRACKING TO SEE DATA</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/insights" className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-transform flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-600 flex items-center justify-center border-2 border-black">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black">ML INSIGHTS</h3>
                <p className="font-bold text-gray-500">AI-powered pattern analysis</p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </a>

          <a href="/settings" className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-transform flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black flex items-center justify-center border-2 border-black">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black">SETTINGS</h3>
                <p className="font-bold text-gray-500">Configure your tracking</p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-black">VIBETRACK</span>
          </div>
          <span className="font-bold text-gray-400">&copy; 2026 VibeTrack</span>
        </div>
      </footer>
    </div>
  )
}
