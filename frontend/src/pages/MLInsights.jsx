import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { fetchPatterns, predict, fetchRecommendations } from '../utils/api'

export default function MLInsights({ user }) {
  const [patterns, setPatterns] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  const [duration, setDuration] = useState(60)
  const [prompts, setPrompts] = useState(10)
  const [breaks, setBreaks] = useState(5)
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchPatterns(user?.id).catch(() => null),
      fetchRecommendations(user?.id).catch(() => null),
    ]).then(([p, r]) => {
      setPatterns(p)
      // API returns {user_id, recommendations: [...]}
      const recs = r?.recommendations || (Array.isArray(r) ? r : [])
      setRecommendations(recs)
      setLoading(false)
    })
  }, [user?.id])

  const handlePredict = async () => {
    setPredicting(true)
    try {
      const data = await predict(duration, prompts, breaks)
      setPrediction(data)
    } catch {} finally {
      setPredicting(false)
    }
  }

  const classColor = {
    'Normal': '#78716c',
    'Deep Flow': '#7c3aed',
    'High Dependency': '#dc2626',
  }

  const patternTypeLabel = {
    peak_performance: 'Peak Performance',
    dependency_increasing: 'Rising Dependency',
    dependency_decreasing: 'Improving Independence',
    break_habits: 'Break Patterns',
    high_engagement: 'High Engagement',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">ML Insights</h1>
          <p className="text-sm text-stone-400 mt-0.5">AI-powered pattern detection and session prediction</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patterns */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5"
            >
              <h3 className="text-sm font-semibold text-stone-600 mb-4">Detected patterns</h3>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="inset h-16 animate-pulse" />
                  ))}
                </div>
              ) : patterns?.patterns?.length > 0 ? (
                <div className="space-y-3">
                  {patterns.patterns.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-lg border border-stone-100 hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{
                        background: p.type === 'peak_performance' ? '#b45309'
                          : p.type === 'dependency_increasing' ? '#dc2626'
                          : p.type === 'dependency_decreasing' ? '#16a34a'
                          : '#6d28d9',
                      }}>
                        {p.type.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-stone-700">
                          {p.title || patternTypeLabel[p.type] || p.type}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{p.description}</div>
                        {p.confidence != null && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="gauge-track flex-1">
                              <div className="gauge-fill" style={{
                                width: `${p.confidence * 100}%`,
                                background: '#b45309',
                              }} />
                            </div>
                            <span className="text-[10px] font-semibold text-stone-400 dial">{Math.round(p.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="inset h-28 flex items-center justify-center">
                  <p className="text-sm text-stone-400">Not enough data yet. Keep tracking to get insights.</p>
                </div>
              )}
            </motion.div>

            {/* Recommendations */}
            {(patterns?.recommendations?.length > 0 || recommendations.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-5"
              >
                <h3 className="text-sm font-semibold text-stone-600 mb-4">Recommendations</h3>
                <div className="space-y-2">
                  {(patterns?.recommendations || []).concat(
                    recommendations.map(r => typeof r === 'string' ? r : r.message)
                  ).filter(Boolean).slice(0, 6).map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{
                        background: 'linear-gradient(135deg, #d97706, #b45309)',
                      }}>
                        {i + 1}
                      </div>
                      <span className="text-sm text-stone-600">{rec}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Predictor */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5"
            >
              <h3 className="text-sm font-semibold text-stone-600 mb-4">Session predictor</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Duration (min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Expected prompts</label>
                  <input type="number" value={prompts} onChange={e => setPrompts(+e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Break time (min)</label>
                  <input type="number" value={breaks} onChange={e => setBreaks(+e.target.value)} className="input-field" />
                </div>
                <button
                  onClick={handlePredict}
                  disabled={predicting}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {predicting ? 'Predicting...' : 'Predict outcome'}
                </button>

                {prediction && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inset p-4 mt-3"
                  >
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Prediction</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{
                        background: classColor[prediction.predicted_classification] || '#78716c',
                      }}>
                        {(prediction.predicted_classification || 'Normal').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold dial text-stone-800 mb-1">
                      {Math.round(prediction.predicted_score || 0)}
                    </div>
                    <div className="text-xs text-stone-400 mb-2">Predicted vibe score</div>
                    <div className="gauge-track mb-1">
                      <div className="gauge-fill" style={{
                        width: `${(prediction.confidence || 0) * 100}%`,
                        background: '#b45309',
                      }} />
                    </div>
                    <div className="text-[10px] text-stone-400 dial">
                      Confidence: {Math.round((prediction.confidence || 0) * 100)}%
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Score reference */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-5"
            >
              <h3 className="text-sm font-semibold text-stone-600 mb-3">Score reference</h3>
              <div className="space-y-2">
                {[
                  { label: 'Normal', range: '< 100', color: '#78716c' },
                  { label: 'Deep Flow', range: '100 - 499', color: '#7c3aed' },
                  { label: 'High Dependency', range: '500+', color: '#dc2626' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                    <span className="text-xs font-semibold text-stone-600">{item.label}</span>
                    <span className="text-xs text-stone-400 font-mono ml-auto">{item.range}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="inset px-3 py-2">
                  <code className="text-[11px] font-mono text-stone-500">(Duration x Prompts) / (Breaks + 1)</code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
