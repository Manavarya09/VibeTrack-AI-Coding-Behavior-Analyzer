import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Coffee, Zap } from 'lucide-react'

export default function AnalyticsSummary() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/summary?user_id=1')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-32 bg-gray-100 border-2 border-black animate-pulse" />
      </div>
    )
  }

  const stats = [
    { icon: TrendingUp, label: 'TOTAL SESSIONS', value: analytics?.total_sessions || 0, accent: 'bg-black' },
    { icon: Clock, label: 'AVG SESSION', value: `${analytics?.avg_session_length || 0}m`, accent: 'bg-red-600' },
    { icon: Zap, label: 'LONGEST SESSION', value: `${analytics?.longest_session || 0}m`, accent: 'bg-black' },
    { icon: Coffee, label: 'BREAK FREQ', value: `${((analytics?.break_frequency || 0) * 100).toFixed(0)}%`, accent: 'bg-red-600' },
  ]

  return (
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6">ANALYTICS SUMMARY</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, i) => (
          <div key={i} className="border-2 border-black p-3">
            <div className={`w-8 h-8 ${stat.accent} flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-xs font-bold text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-black pt-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-500">TOTAL PROMPTS</span>
          <span className="font-black text-xl">{analytics?.total_prompts || 0}</span>
        </div>
      </div>
    </div>
  )
}
