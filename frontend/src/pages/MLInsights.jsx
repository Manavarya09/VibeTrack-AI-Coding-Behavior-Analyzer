import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, Lightbulb, AlertCircle } from 'lucide-react'

export default function MLInsights() {
  const [patterns, setPatterns] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ml/patterns?user_id=1')
      .then(res => res.json())
      .then(data => {
        setPatterns(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch patterns:', err)
        setLoading(false)
      })
  }, [])

  const getPatternIcon = (type) => {
    switch (type) {
      case 'peak_performance': return TrendingUp
      case 'dependency_increasing': return AlertCircle
      case 'dependency_decreasing': return TrendingDown
      case 'break_habits': return Brain
      default: return Lightbulb
    }
  }

  const getPatternColor = (type) => {
    switch (type) {
      case 'peak_performance': return 'text-green-600 bg-green-50'
      case 'dependency_increasing': return 'text-red-600 bg-red-50'
      case 'dependency_decreasing': return 'text-green-600 bg-green-50'
      case 'break_habits': return 'text-blue-600 bg-blue-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        AI-Powered Insights
      </h2>

      {patterns?.patterns?.length > 0 ? (
        <div className="space-y-4">
          {patterns.patterns.map((pattern, index) => {
            const Icon = getPatternIcon(pattern.type)
            const colorClass = getPatternColor(pattern.type)
            
            return (
              <div key={index} className={`p-4 rounded-lg ${colorClass}`}>
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-medium">{pattern.description}</p>
                    {pattern.confidence && (
                      <p className="text-sm opacity-75 mt-1">
                        Confidence: {(pattern.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {patterns.recommendations?.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-medium text-slate-800 mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {patterns.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">
          Not enough data yet. Keep tracking your sessions to get personalized insights!
        </p>
      )}
    </div>
  )
}
