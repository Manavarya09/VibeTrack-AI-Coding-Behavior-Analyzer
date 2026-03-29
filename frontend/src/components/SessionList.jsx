import { Clock, Zap } from 'lucide-react'

export default function SessionList({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <p className="text-slate-500 text-sm">No sessions recorded yet.</p>
    )
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Deep Flow': return 'bg-purple-100 text-purple-700'
      case 'High Dependency': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-3">
      {sessions.map(session => (
        <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                {new Date(session.start_time).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500">
                {Math.round(session.duration_minutes)} min • {session.prompt_count} prompts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session.vibe_score && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Zap className="w-3 h-3" />
                {session.vibe_score}
              </div>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${getClassificationColor(session.classification)}`}>
              {session.classification}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
