import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { fetchSession, fetchEvents } from '../utils/api'

export default function Session({ user }) {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchSession(id).catch(() => null),
      fetchEvents(id).catch(() => []),
    ]).then(([s, e]) => {
      setSession(s)
      setEvents(Array.isArray(e) ? e : [])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
        <Navbar user={user} />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-sm text-stone-400">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
        <Navbar user={user} />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-sm text-stone-400">Session not found.</p>
        </div>
      </div>
    )
  }

  const classColor = {
    'Normal': '#78716c',
    'Deep Flow': '#7c3aed',
    'High Dependency': '#dc2626',
  }
  const c = session.classification || 'Normal'

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/dashboard" className="text-xs font-semibold text-stone-400 hover:text-stone-600 transition-colors mb-4 inline-block">
          Back to dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Session #{session.id}</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {new Date(session.start_time).toLocaleString()}
            {session.end_time && ` -- ${new Date(session.end_time).toLocaleTimeString()}`}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Duration', value: `${Math.round(session.duration_minutes)} min` },
            { label: 'Prompts', value: session.prompt_count },
            { label: 'Vibe Score', value: session.vibe_score != null ? Math.round(session.vibe_score) : '--' },
            { label: 'Classification', value: c },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-xl font-bold dial" style={{
                color: s.label === 'Classification' ? classColor[c] : '#1c1917',
              }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h3 className="text-sm font-semibold text-stone-600 mb-4">Event log ({events.length} events)</h3>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((e, i) => (
                <div key={e.id || i} className="flex items-start gap-3 py-2 border-b border-stone-100 last:border-0">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{
                    background: e.event_type === 'prompt' ? '#b45309' : e.event_type === 'break' ? '#16a34a' : '#78716c',
                  }}>
                    {e.event_type === 'prompt' ? 'P' : e.event_type === 'break' ? 'B' : 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-stone-500 uppercase">{e.event_type}</div>
                    {e.content && <div className="text-sm text-stone-600 mt-0.5 truncate">{e.content}</div>}
                  </div>
                  <div className="text-xs text-stone-400 flex-shrink-0">
                    {new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="inset h-20 flex items-center justify-center">
              <p className="text-sm text-stone-400">No events recorded.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
