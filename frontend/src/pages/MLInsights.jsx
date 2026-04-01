import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { fetchPatterns, predict, fetchRecommendations } from '../utils/api'

const CLS = { 'Normal': '#71717a', 'Deep Flow': '#a855f7', 'High Dependency': '#ef4444' }

export default function MLInsights({ user }) {
  const [patterns, setPatterns] = useState(null)
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)

  const [dur, setDur] = useState(60)
  const [pr, setPr] = useState(10)
  const [br, setBr] = useState(5)
  const [pred, setPred] = useState(null)
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchPatterns(user.id).catch(() => null),
      fetchRecommendations(user.id).catch(() => null),
    ]).then(([p, r]) => {
      setPatterns(p)
      setRecs(r?.recommendations || (Array.isArray(r) ? r : []))
      setLoading(false)
    })
  }, [user.id])

  const doPred = async () => {
    setPredicting(true)
    try { setPred(await predict(dur, pr, br)) } catch {} finally { setPredicting(false) }
  }

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-5 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Insights</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Pattern detection and session prediction</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Patterns */}
          <div className="space-y-3">
            <div className="surface p-5">
              <div className="label mb-4">Detected patterns</div>
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="surface-inset h-14 rounded-lg animate-pulse" />)}
                </div>
              ) : patterns?.patterns?.length > 0 ? (
                <div className="space-y-2">
                  {patterns.patterns.map((p, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="surface-inset rounded-lg p-4 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold" style={{
                        background: p.type === 'peak_performance' ? 'rgba(99,102,241,0.2)' :
                          p.type === 'dependency_increasing' ? 'rgba(239,68,68,0.2)' :
                          p.type === 'dependency_decreasing' ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.2)',
                        color: p.type === 'peak_performance' ? '#818cf8' :
                          p.type === 'dependency_increasing' ? '#f87171' :
                          p.type === 'dependency_decreasing' ? '#4ade80' : '#c084fc',
                      }}>
                        {p.type?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.title || p.type?.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{p.description}</div>
                        {p.confidence != null && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="bar-track flex-1">
                              <div className="bar-fill" style={{ width: `${p.confidence * 100}%`, background: 'var(--accent)' }} />
                            </div>
                            <span className="text-[10px] text-zinc-500 mono">{Math.round(p.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="surface-inset rounded-lg h-24 flex items-center justify-center">
                  <span className="text-xs text-zinc-600">Not enough data. Keep tracking.</span>
                </div>
              )}
            </div>

            {/* Recs */}
            {(patterns?.recommendations?.length > 0 || recs.length > 0) && (
              <div className="surface p-5">
                <div className="label mb-4">Recommendations</div>
                <div className="space-y-2">
                  {[...(patterns?.recommendations || []), ...recs.map(r => typeof r === 'string' ? r : r.message)]
                    .filter(Boolean).slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-start gap-3 py-1.5">
                      <span className="text-indigo-500 mono text-xs font-semibold mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-zinc-400">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Predictor */}
          <div className="space-y-3">
            <div className="surface p-5">
              <div className="label mb-4">Session predictor</div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1 block">Duration (min)</label>
                  <input type="number" value={dur} onChange={e => setDur(+e.target.value)} className="field" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1 block">Prompts</label>
                  <input type="number" value={pr} onChange={e => setPr(+e.target.value)} className="field" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1 block">Break time (min)</label>
                  <input type="number" value={br} onChange={e => setBr(+e.target.value)} className="field" />
                </div>
                <button onClick={doPred} disabled={predicting} className="btn btn-accent w-full disabled:opacity-50">
                  {predicting ? 'Predicting...' : 'Predict'}
                </button>

                {pred && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="surface-inset rounded-lg p-4 mt-2">
                    <div className="text-3xl font-bold mono mb-1">{Math.round(pred.predicted_score || 0)}</div>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mb-2"
                      style={{ background: CLS[pred.predicted_classification] || '#71717a' }}>
                      {pred.predicted_classification || 'Normal'}
                    </div>
                    <div className="bar-track mt-2">
                      <div className="bar-fill" style={{ width: `${(pred.confidence || 0) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                    <div className="text-[10px] text-zinc-500 mono mt-1">confidence {Math.round((pred.confidence || 0) * 100)}%</div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="surface p-5">
              <div className="label mb-3">Score reference</div>
              <div className="space-y-2 text-sm">
                {[
                  { l: 'Normal', r: '< 100', c: '#71717a' },
                  { l: 'Deep Flow', r: '100-499', c: '#a855f7' },
                  { l: 'High Dep', r: '500+', c: '#ef4444' },
                ].map(s => (
                  <div key={s.l} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.c }} />
                    <span className="text-zinc-400 flex-1">{s.l}</span>
                    <span className="text-zinc-600 mono text-xs">{s.r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
