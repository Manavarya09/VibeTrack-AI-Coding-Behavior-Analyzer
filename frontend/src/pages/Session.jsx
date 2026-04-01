import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { fetchSession, fetchEvents } from '../utils/api'

const CLS = { 'Normal': '#71717a', 'Deep Flow': '#a855f7', 'High Dependency': '#ef4444' }
const EVT = { prompt: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', letter: 'P' },
              break: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', letter: 'B' },
              activity: { bg: 'rgba(161,161,170,0.15)', color: '#a1a1aa', letter: 'A' } }

export default function Session({ user }) {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchSession(id).catch(() => null), fetchEvents(id).catch(() => [])])
      .then(([s, e]) => { setSession(s); setEvents(Array.isArray(e) ? e : []); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[70vh]"><span className="text-sm text-zinc-600">Loading...</span></div>
    </div>
  )

  if (!session) return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[70vh]"><span className="text-sm text-zinc-600">Session not found</span></div>
    </div>
  )

  const c = session.classification || 'Normal'

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-5 py-6">
        <Link to="/dashboard" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-4 inline-block">
          back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold">Session #{session.id}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {new Date(session.start_time).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { l: 'Duration', v: `${Math.round(session.duration_minutes)}m` },
            { l: 'Prompts', v: session.prompt_count },
            { l: 'Score', v: session.vibe_score != null ? Math.round(session.vibe_score) : '--' },
            { l: 'Class', v: c },
          ].map((s, i) => (
            <div key={i} className="surface p-3">
              <div className="label mb-1">{s.l}</div>
              <div className="text-lg font-bold mono" style={{
                color: s.l === 'Class' ? CLS[c] : undefined,
              }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="surface p-5">
          <div className="label mb-4">Event log ({events.length})</div>
          {events.length > 0 ? (
            <div className="space-y-1">
              {events.map((e, i) => {
                const t = EVT[e.event_type] || EVT.activity
                return (
                  <motion.div key={e.id || i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold"
                      style={{ background: t.bg, color: t.color }}>{t.letter}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-500 uppercase">{e.event_type}</div>
                      {e.content && <div className="text-sm text-zinc-300 mt-0.5 truncate">{e.content}</div>}
                    </div>
                    <div className="text-[11px] text-zinc-600 mono flex-shrink-0">
                      {new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="surface-inset rounded-lg h-16 flex items-center justify-center">
              <span className="text-xs text-zinc-600">No events</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
