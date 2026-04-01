import { Clock, Zap } from 'lucide-react'

export default function SessionList({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="h-20 bg-gray-100 border-2 border-black flex items-center justify-center">
        <p className="font-bold text-gray-400">NO SESSIONS RECORDED YET</p>
      </div>
    )
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Deep Flow': return 'bg-purple-600'
      case 'High Dependency': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-2">
      {sessions.map(session => (
        <div key={session.id} className="flex items-center justify-between p-3 border-2 border-black hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-10 ${getClassificationColor(session.classification)}`} />
            <div>
              <p className="font-black text-sm">
                {new Date(session.start_time).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-gray-500">
                {Math.round(session.duration_minutes)} MIN &bull; {session.prompt_count} PROMPTS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session.vibe_score != null && (
              <div className="flex items-center gap-1 bg-black text-white px-2 py-1">
                <Zap className="w-3 h-3" />
                <span className="font-black text-xs">{Math.round(session.vibe_score)}</span>
              </div>
            )}
            <div className={`px-2 py-1 text-white font-black text-xs ${getClassificationColor(session.classification)}`}>
              {(session.classification || 'Normal').toUpperCase()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
