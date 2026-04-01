import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { fetchStats, fetchDailyStats, fetchSessions, startSession, endSession, logEvent } from '../utils/api'

const CLASS_COLOR = { 'Normal': '#71717a', 'Deep Flow': '#a855f7', 'High Dependency': '#ef4444' }

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null)
  const [daily, setDaily] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const [active, setActive] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [prompts, setPrompts] = useState(0)
  const [input, setInput] = useState('')
  const timer = useRef(null)

  const load = useCallback(async () => {
    const [s, d, ss] = await Promise.all([
      fetchStats(user.id).catch(() => null),
      fetchDailyStats(14, user.id).catch(() => []),
      fetchSessions(user.id).catch(() => []),
    ])
    setStats(s)
    setDaily(Array.isArray(d) ? d : [])
    setSessions(Array.isArray(ss) ? ss : [])
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (active) timer.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer.current)
  }, [active])

  const start = async () => {
    const s = await startSession(user.id, 'web')
    setActive(s); setElapsed(0); setPrompts(0)
  }
  const log = async () => {
    if (!active || !input.trim()) return
    await logEvent({ session_id: active.id, user_id: user.id, event_type: 'prompt', source: 'web', content: input.trim() })
    setPrompts(p => p + 1); setInput('')
  }
  const logBreak = async () => {
    if (!active) return
    await logEvent({ session_id: active.id, user_id: user.id, event_type: 'break', source: 'web', content: 'Break', duration_seconds: 300 })
  }
  const end = async () => {
    clearInterval(timer.current)
    await endSession(active.id)
    setActive(null); setElapsed(0); setPrompts(0)
    load()
  }

  const fmt = (s) => {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const chart = daily.map(d => ({ d: d.date.slice(5), min: Math.round(d.total_minutes), s: d.session_count }))
  const cls = [
    { l: 'Normal', n: stats?.normal_count || 0, c: CLASS_COLOR['Normal'] },
    { l: 'Deep Flow', n: stats?.deep_flow_count || 0, c: CLASS_COLOR['Deep Flow'] },
    { l: 'High Dep', n: stats?.high_dependency_count || 0, c: CLASS_COLOR['High Dependency'] },
  ]
  const clsTotal = cls.reduce((a, b) => a + b.n, 0) || 1

  const Tip = ({ active: a, payload, label }) => {
    if (!a || !payload?.length) return null
    return (
      <div className="surface text-xs px-3 py-2">
        <div className="text-zinc-400 mb-1">{label}</div>
        {payload.map((p, i) => <div key={i}><span className="text-zinc-500">{p.name}:</span> <span className="font-semibold">{p.value}</span></div>)}
      </div>
    )
  }

  if (loading) return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-sm text-zinc-600 animate-pulse">Loading...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-5 py-6">

        {/* Active session */}
        <AnimatePresence>
          {active ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="surface-raised p-5" style={{ borderLeft: '2px solid var(--green)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="live-dot" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Recording</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="surface-inset p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold mono">{fmt(elapsed)}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">elapsed</div>
                  </div>
                  <div className="surface-inset p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold mono">{prompts}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">prompts</div>
                  </div>
                  <div className="surface-inset p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold mono">{elapsed > 0 ? (prompts / (elapsed / 60)).toFixed(1) : '0'}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">per min</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && log()}
                    placeholder="What did you just ask the AI?"
                    className="field flex-1"
                  />
                  <button onClick={log} className="btn btn-accent" style={{ padding: '8px 16px' }}>Log</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={logBreak} className="btn btn-ghost flex-1">Break</button>
                  <button onClick={end} className="btn btn-red flex-1">End session</button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <button onClick={start} className="btn btn-accent w-full text-base py-3">
                Start new session
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { l: 'Sessions', v: stats?.total_sessions || 0 },
            { l: 'Minutes', v: Math.round(stats?.total_minutes || 0) },
            { l: 'Avg score', v: stats?.avg_vibe_score ? Math.round(stats.avg_vibe_score) : '--' },
            { l: 'Prompts', v: stats?.total_prompts || 0 },
          ].map((s, i) => (
            <div key={i} className="surface p-4 animate-enter" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="label mb-1">{s.l}</div>
              <div className="text-2xl font-bold mono">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-3 mb-6">
          <div className="surface p-5">
            <div className="label mb-4">Activity</div>
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="min" name="Minutes" stroke="#6366f1" strokeWidth={2} fill="url(#aGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="surface-inset h-[180px] flex items-center justify-center rounded-lg">
                <span className="text-xs text-zinc-600">No data yet</span>
              </div>
            )}
          </div>
          <div className="surface p-5">
            <div className="label mb-4">Sessions per day</div>
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chart}>
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="s" name="Sessions" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="surface-inset h-[180px] flex items-center justify-center rounded-lg">
                <span className="text-xs text-zinc-600">No data yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-3">
          {/* Classification */}
          <div className="surface p-5">
            <div className="label mb-4">Classification</div>
            <div className="space-y-3">
              {cls.map(item => (
                <div key={item.l}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-400">{item.l}</span>
                    <span className="text-xs font-semibold mono" style={{ color: item.c }}>{item.n}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(item.n / clsTotal) * 100}%`, background: item.c }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="surface-inset rounded-lg px-3 py-2">
                <code className="text-[11px] mono text-zinc-500">(dur * prompts) / (breaks + 1)</code>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="surface p-5">
            <div className="flex justify-between mb-4">
              <div className="label">Recent sessions</div>
              <span className="text-[11px] text-zinc-600">{sessions.length} total</span>
            </div>
            {sessions.length > 0 ? (
              <div className="space-y-0">
                {sessions.slice(0, 8).map(s => {
                  const c = s.classification || 'Normal'
                  return (
                    <Link key={s.id} to={`/session/${s.id}`}
                      className="flex items-center gap-3 py-2.5 border-b hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: CLASS_COLOR[c] }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          {new Date(s.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <span className="text-zinc-600 ml-1.5">
                            {new Date(s.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-600">
                          {Math.round(s.duration_minutes)}m / {s.prompt_count} prompts
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {s.vibe_score != null && (
                          <div className="text-sm font-semibold mono" style={{ color: CLASS_COLOR[c] }}>
                            {Math.round(s.vibe_score)}
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-600">{c}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="surface-inset rounded-lg h-24 flex items-center justify-center">
                <span className="text-xs text-zinc-600">No sessions yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav links */}
        <div className="grid md:grid-cols-2 gap-3 mt-6">
          <Link to="/insights" className="surface p-4 flex items-center gap-4 group hover:border-zinc-600 transition-colors">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
              <span className="text-purple-400 text-xs font-bold">ML</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Insights</div>
              <div className="text-[11px] text-zinc-600">Patterns & predictions</div>
            </div>
          </Link>
          <Link to="/settings" className="surface p-4 flex items-center gap-4 group hover:border-zinc-600 transition-colors">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <span className="text-indigo-400 text-xs font-bold">S</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Settings</div>
              <div className="text-[11px] text-zinc-600">Configuration</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
