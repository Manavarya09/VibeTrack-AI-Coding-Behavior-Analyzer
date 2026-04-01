import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, Lightbulb, AlertCircle, Zap, ArrowLeft, Sparkles } from 'lucide-react'

export default function MLInsights() {
  const [patterns, setPatterns] = useState(null)
  const [loading, setLoading] = useState(true)

  // Prediction state
  const [duration, setDuration] = useState(60)
  const [prompts, setPrompts] = useState(10)
  const [breaks, setBreaks] = useState(5)
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    fetch('/api/ml/patterns?user_id=1')
      .then(res => res.json())
      .then(data => {
        setPatterns(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handlePredict = async () => {
    setPredicting(true)
    try {
      const res = await fetch(`/api/ml/predict?duration=${duration}&prompt_count=${prompts}&break_minutes=${breaks}`)
      const data = await res.json()
      setPrediction(data)
    } catch (err) {
      console.error('Prediction failed:', err)
    } finally {
      setPredicting(false)
    }
  }

  const getPatternIcon = (type) => {
    switch (type) {
      case 'peak_performance': return TrendingUp
      case 'dependency_increasing': return AlertCircle
      case 'dependency_decreasing': return TrendingDown
      case 'break_habits': return Brain
      default: return Lightbulb
    }
  }

  const getPatternAccent = (type) => {
    switch (type) {
      case 'peak_performance': return 'bg-black'
      case 'dependency_increasing': return 'bg-red-600'
      case 'dependency_decreasing': return 'bg-black'
      case 'break_habits': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getClassificationColor = (c) => {
    if (c === 'Deep Flow') return 'bg-purple-600'
    if (c === 'High Dependency') return 'bg-red-600'
    return 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Nav */}
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
              <a href="/dashboard" className="font-bold hover:underline">DASHBOARD</a>
              <a href="/insights" className="font-black text-red-600 border-b-4 border-red-600 pb-1">INSIGHTS</a>
              <a href="/settings" className="font-bold hover:underline">SETTINGS</a>
              <a href="/" className="font-bold hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> HOME
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
            ML <span className="text-red-600">INSIGHTS</span>
          </h1>
          <p className="text-lg font-bold text-gray-600">AI-POWERED PATTERN DETECTION & PREDICTIONS</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patterns Section */}
          <div className="lg:col-span-2">
            <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                DETECTED PATTERNS
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 border-2 border-black animate-pulse" />
                  ))}
                </div>
              ) : patterns?.patterns?.length > 0 ? (
                <div className="space-y-4">
                  {patterns.patterns.map((pattern, index) => {
                    const Icon = getPatternIcon(pattern.type)
                    const accent = getPatternAccent(pattern.type)

                    return (
                      <div key={index} className="border-2 border-black p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                        <div className={`w-12 h-12 ${accent} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black uppercase">{pattern.title || pattern.type.replace(/_/g, ' ')}</h3>
                          <p className="font-bold text-gray-600 mt-1">{pattern.description}</p>
                          {pattern.confidence != null && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-3 flex-1 bg-gray-200 border border-black">
                                <div className="h-full bg-black" style={{ width: `${pattern.confidence * 100}%` }} />
                              </div>
                              <span className="font-black text-sm">{(pattern.confidence * 100).toFixed(0)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Recommendations */}
                  {patterns.recommendations?.length > 0 && (
                    <div className="border-t-4 border-black pt-6 mt-6">
                      <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        RECOMMENDATIONS
                      </h3>
                      <div className="space-y-3">
                        {patterns.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-black">
                            <div className="w-8 h-8 bg-red-600 flex items-center justify-center flex-shrink-0">
                              <span className="font-black text-white text-sm">{index + 1}</span>
                            </div>
                            <span className="font-bold">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gray-100 border-2 border-black flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-black text-gray-400">NOT ENOUGH DATA YET</p>
                    <p className="font-bold text-sm text-gray-400 mt-1">KEEP TRACKING TO GET INSIGHTS</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Predictor Sidebar */}
          <div className="space-y-6">
            <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                PREDICTOR
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black uppercase text-gray-500 mb-2">DURATION (MIN)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase text-gray-500 mb-2">EXPECTED PROMPTS</label>
                  <input
                    type="number"
                    value={prompts}
                    onChange={(e) => setPrompts(Number(e.target.value))}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase text-gray-500 mb-2">BREAK TIME (MIN)</label>
                  <input
                    type="number"
                    value={breaks}
                    onChange={(e) => setBreaks(Number(e.target.value))}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <button
                  onClick={handlePredict}
                  disabled={predicting}
                  className="w-full bg-black text-white py-3 px-4 font-black border-4 border-black hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {predicting ? 'PREDICTING...' : 'PREDICT OUTCOME'}
                </button>

                {prediction && (
                  <div className="border-4 border-black p-4 mt-4">
                    <p className="font-black text-sm text-gray-500 mb-2">PREDICTION</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-4 py-2 text-white font-black ${getClassificationColor(prediction.predicted_classification)}`}>
                        {(prediction.predicted_classification || 'NORMAL').toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-black text-2xl">{Math.round(prediction.predicted_score || 0)}</span>
                      <span className="font-bold text-gray-500 text-sm">VIBE SCORE</span>
                    </div>
                    <div className="mt-3 h-3 bg-gray-200 border border-black">
                      <div className="h-full bg-black" style={{ width: `${(prediction.confidence || 0) * 100}%` }} />
                    </div>
                    <p className="text-sm font-bold text-gray-500 mt-1">
                      CONFIDENCE: {((prediction.confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Score Reference */}
            <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black mb-4">SCORE REFERENCE</h3>
              <div className="space-y-3">
                {[
                  { label: 'NORMAL', range: '< 100', color: 'bg-gray-500' },
                  { label: 'DEEP FLOW', range: '100 - 499', color: 'bg-purple-600' },
                  { label: 'HIGH DEPENDENCY', range: '>= 500', color: 'bg-red-600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-6 h-6 ${item.color} border-2 border-black`} />
                    <div>
                      <span className="font-black text-sm">{item.label}</span>
                      <span className="font-bold text-gray-500 text-sm ml-2">{item.range}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t-4 border-black">
                <div className="bg-black text-white p-3">
                  <code className="font-mono font-bold text-xs">(Duration x Prompts) / (Breaks + 1)</code>
                </div>
              </div>
            </div>
          </div>
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
