import { Zap, TrendingUp, AlertTriangle } from 'lucide-react'

export default function VibeScoreCard({ score, classification }) {
  const getScoreAccent = (score) => {
    if (score >= 500) return 'bg-red-600'
    if (score >= 100) return 'bg-purple-600'
    return 'bg-gray-500'
  }

  const getClassificationBadge = (classification) => {
    switch (classification) {
      case 'Deep Flow':
        return { bg: 'bg-purple-600', icon: TrendingUp }
      case 'High Dependency':
        return { bg: 'bg-red-600', icon: AlertTriangle }
      default:
        return { bg: 'bg-gray-500', icon: Zap }
    }
  }

  const badge = getClassificationBadge(classification)
  const Icon = badge.icon

  return (
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        VIBE SCORE
      </h2>

      <div className="text-center py-4 mb-4">
        <div className={`inline-block ${getScoreAccent(score)} text-white px-8 py-4 border-4 border-black`}>
          <div className="text-5xl font-black">{score || 'N/A'}</div>
        </div>
      </div>

      {classification && (
        <div className={`flex items-center justify-center gap-3 ${badge.bg} text-white p-3 border-2 border-black mb-4`}>
          <Icon className="w-5 h-5" />
          <span className="font-black">{classification.toUpperCase()}</span>
        </div>
      )}

      <div className="border-t-4 border-black pt-4 mt-4">
        <p className="font-black text-sm text-gray-500 mb-3">THRESHOLDS</p>
        <div className="space-y-2">
          {[
            { label: 'NORMAL', range: '< 100', color: 'bg-gray-500' },
            { label: 'DEEP FLOW', range: '100 - 499', color: 'bg-purple-600' },
            { label: 'HIGH DEP.', range: '>= 500', color: 'bg-red-600' },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${t.color} border border-black`} />
                <span className="font-bold text-sm">{t.label}</span>
              </div>
              <span className="font-bold text-sm text-gray-500">{t.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
