import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { fetchStats, fetchDailyStats, fetchSessions, startSession, endSession, logEvent } from '../utils/api'

function StatCard({ label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card p-4"
    >
      <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold dial text-stone-800">{value}</div>
      {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
    </motion.div>
  )
}

function SessionRow({ session }) {
  const classColor = {
    'Normal': '#78716c',
    'Deep Flow': '#7c3aed',
    'High Dependency': '#dc2626',
  }
  const c = session.classification || 'Normal'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="w-1.5 h-8 rounded-full" style={{ background: classColor[c] || '#78716c' }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-stone-700">
          {new Date(session.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' '}
          <span className="font-normal text-stone-400">
            {new Date(session.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-xs text-stone-400">
          {Math.round(session.duration_minutes)} min -- {session.prompt_count} prompts
        </div>
      </div>
      <div className="text-right">
        {session.vibe_score != null && (
          <div className="text-sm font-bold dial" style={{ color: classColor[c] }}>
            {Math.round(session.vibe_score)}
          </div>
        )}
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: classColor[c] }}>
          {c}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null)
  const [dailyStats, setDailyStats] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  // Active session state
  const [activeSession, setActiveSession] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [promptCount, setPromptCount] = useState(0)
  const [promptText, setPromptText] = useState('')
  const timerRef = useRef(null)

  const loadData = useCallback(async () => {
    try {
      const [s, d, sess] = await Promise.all([
        fetchStats(user?.id).catch(() => null),
        fetchDailyStats(14, user?.id).catch(() => []),
        fetchSessions(user?.id).catch(() => []),
      ])
      setStats(s)
      setDailyStats(Array.isArray(d) ? d : [])
      setSessions(Array.isArray(sess) ? sess : [])
    } catch {} finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadData() }, [loadData])

  // Timer for active session
  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [activeSession])

  const handleStart = async () => {
    try {
      const s = await startSession(user.id, 'web')
      setActiveSession(s)
      setElapsed(0)
      setPromptCount(0)
    } catch (err) {
      console.error('Failed to start session:', err)
    }
  }

  const handleLogPrompt = async () => {
    if (!activeSession || !promptText.trim()) return
    try {
      await logEvent({
        session_id: activeSession.id,
        user_id: user.id,
        event_type: 'prompt',
        source: 'web',
        content: promptText.trim(),
      })
      setPromptCount(c => c + 1)
      setPromptText('')
    } catch (err) {
      console.error('Failed to log event:', err)
    }
  }

  const handleLogBreak = async () => {
    if (!activeSession) return
    try {
      await logEvent({
        session_id: activeSession.id,
        user_id: user.id,
        event_type: 'break',
        source: 'web',
        content: 'Break taken',
        duration_seconds: 300,
      })
    } catch {}
  }

  const handleEnd = async () => {
    if (!activeSession) return
    try {
      clearInterval(timerRef.current)
      await endSession(activeSession.id)
      setActiveSession(null)
      setElapsed(0)
      setPromptCount(0)
      await loadData()
    } catch (err) {
      console.error('Failed to end session:', err)
    }
  }

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const chartData = dailyStats.map(d => ({
    date: d.date.slice(5),
    sessions: d.session_count,
    minutes: Math.round(d.total_minutes),
  }))

  const classData = [
    { label: 'Normal', count: stats?.normal_count || 0, color: '#78716c' },
    { label: 'Deep Flow', count: stats?.deep_flow_count || 0, color: '#7c3aed' },
    { label: 'High Dependency', count: stats?.high_dependency_count || 0, color: '#dc2626' },
  ]
  const classTotal = classData.reduce((a, b) => a + b.count, 0) || 1

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="card px-3 py-2 text-xs">
        <div className="font-semibold text-stone-600 mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="text-stone-500">{p.name}: <span className="font-semibold text-stone-700">{p.value}</span></div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
        <Navbar user={user} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center animate-in">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              animation: 'pulse 2s ease infinite',
            }}>
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <p className="text-sm text-stone-400 font-medium">Loading your data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {user?.username ? `Welcome back, ${user.username}` : 'Track. Analyze. Improve.'}
          </p>
        </motion.div>

        {/* Active Session Panel */}
        <AnimatePresence>
          {activeSession ? (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className="mb-6"
            >
              <div className="card-raised p-5" style={{ borderLeft: '3px solid #16a34a' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="live-dot" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Session active</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="inset p-3 text-center">
                    <div className="text-2xl font-bold dial text-stone-800">{formatTime(elapsed)}</div>
                    <div className="text-[10px] text-stone-400 font-medium mt-0.5">Elapsed</div>
                  </div>
                  <div className="inset p-3 text-center">
                    <div className="text-2xl font-bold dial text-stone-800">{promptCount}</div>
                    <div className="text-[10px] text-stone-400 font-medium mt-0.5">Prompts</div>
                  </div>
                  <div className="inset p-3 text-center">
                    <div className="text-2xl font-bold dial text-stone-800">
                      {elapsed > 0 ? Math.round((promptCount / (elapsed / 60)) * 10) / 10 : 0}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium mt-0.5">Prompts/min</div>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogPrompt()}
                    placeholder="Describe your prompt or paste it here..."
                    className="input-field flex-1"
                  />
                  <button onClick={handleLogPrompt} className="btn-primary whitespace-nowrap" style={{ padding: '8px 16px' }}>
                    Log prompt
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleLogBreak} className="btn-secondary flex-1" style={{ padding: '8px 16px' }}>
                    Log break (5 min)
                  </button>
                  <button onClick={handleEnd} className="btn-danger flex-1" style={{ padding: '8px 16px' }}>
                    End session
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <button onClick={handleStart} className="btn-primary w-full text-base" style={{ padding: '14px 24px' }}>
                Start new session
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Sessions" value={stats?.total_sessions || 0} delay={0.05} />
          <StatCard label="Total minutes" value={Math.round(stats?.total_minutes || 0)} delay={0.1} />
          <StatCard label="Avg vibe score" value={stats?.avg_vibe_score ? Math.round(stats.avg_vibe_score) : '--'} delay={0.15} />
          <StatCard label="Total prompts" value={stats?.total_prompts || 0} delay={0.2} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-stone-600 mb-4">Daily activity (minutes)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="minutes" name="Minutes" stroke="#b45309" strokeWidth={2} dot={{ fill: '#b45309', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="inset h-[200px] flex items-center justify-center">
                <p className="text-sm text-stone-400">No data yet. Start a session to see activity.</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-stone-600 mb-4">Sessions per day</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" name="Sessions" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="inset h-[200px] flex items-center justify-center">
                <p className="text-sm text-stone-400">No data yet.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Classification + Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-stone-600 mb-4">Classification breakdown</h3>
            <div className="space-y-3">
              {classData.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-stone-500">{item.label}</span>
                    <span className="text-sm font-bold dial" style={{ color: item.color }}>{item.count}</span>
                  </div>
                  <div className="gauge-track">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${(item.count / classTotal) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Formula</div>
              <div className="inset px-3 py-2">
                <code className="text-xs font-mono text-stone-600">(Duration x Prompts) / (Breaks + 1)</code>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-600">Recent sessions</h3>
              <span className="text-xs text-stone-400">{sessions.length} total</span>
            </div>

            {sessions.length > 0 ? (
              <div>
                {sessions.slice(0, 8).map(s => <SessionRow key={s.id} session={s} />)}
              </div>
            ) : (
              <div className="inset h-32 flex items-center justify-center">
                <p className="text-sm text-stone-400">No sessions yet. Start tracking to see history.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link to="/insights" className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              boxShadow: '0 2px 6px rgba(109,40,217,0.2)',
            }}>
              <span className="text-white text-sm font-bold">ML</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-stone-700">ML Insights</div>
              <div className="text-xs text-stone-400">Pattern detection and predictions</div>
            </div>
            <svg className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <Link to="/settings" className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #57534e, #44403c)',
              boxShadow: '0 2px 6px rgba(68,64,60,0.2)',
            }}>
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-stone-700">Settings</div>
              <div className="text-xs text-stone-400">Configure your tracking</div>
            </div>
            <svg className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
