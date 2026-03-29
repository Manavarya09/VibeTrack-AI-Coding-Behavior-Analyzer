import { Zap, TrendingUp, AlertTriangle } from 'lucide-react'

export default function VibeScoreCard({ score, classification }) {
  const getScoreColor = (score) => {
    if (score >= 500) return 'text-red-600 bg-red-50'
    if (score >= 100) return 'text-purple-600 bg-purple-50'
    return 'text-slate-600 bg-slate-50'
  }

  const getClassificationBadge = (classification) => {
    switch (classification) {
      case 'Deep Flow':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: TrendingUp }
      case 'High Dependency':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle }
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', icon: Zap }
    }
  }

  const badge = getClassificationBadge(classification)
  const Icon = badge.icon

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Vibe Score Analysis
      </h2>
      
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className={`text-5xl font-bold rounded-xl p-4 inline-block ${getScoreColor(score)}`}>
            {score || 'N/A'}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Score = (duration × prompts) / (break_time + 1)
          </p>
        </div>

        {classification && (
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${badge.bg}`}>
            <Icon className={`w-5 h-5 ${badge.text}`} />
            <span className={`font-semibold ${badge.text}`}>{classification}</span>
          </div>
        )}

        <div className="text-sm text-slate-600 space-y-2 pt-4 border-t">
          <p><strong>Score Thresholds:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Normal: &lt; 100</li>
            <li>Deep Flow: 100 - 499</li>
            <li>High Dependency: ≥ 500</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
