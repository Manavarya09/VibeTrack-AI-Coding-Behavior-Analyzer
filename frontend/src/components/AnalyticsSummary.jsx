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
      .catch(err => {
        console.error('Failed to fetch analytics:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="animate-pulse h-32 bg-slate-200 rounded-xl"></div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Analytics Summary</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-slate-600">Total Sessions</span>
          </div>
          <span className="font-semibold text-slate-800">{analytics?.total_sessions || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-slate-600">Avg Session Length</span>
          </div>
          <span className="font-semibold text-slate-800">{analytics?.avg_session_length || 0} min</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="text-slate-600">Longest Session</span>
          </div>
          <span className="font-semibold text-slate-800">{analytics?.longest_session || 0} min</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-orange-500" />
            <span className="text-slate-600">Break Frequency</span>
          </div>
          <span className="font-semibold text-slate-800">{((analytics?.break_frequency || 0) * 100).toFixed(0)}%</span>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total Prompts</span>
            <span className="font-semibold text-slate-800">{analytics?.total_prompts || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
