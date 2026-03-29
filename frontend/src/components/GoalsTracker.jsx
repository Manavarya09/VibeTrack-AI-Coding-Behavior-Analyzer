import { useState, useEffect } from 'react'
import { Target, CheckCircle, Circle } from 'lucide-react'

export default function GoalsTracker() {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Complete 5 coding sessions this week', target: 5, current: 0, type: 'sessions' },
    { id: 2, title: 'Code for at least 2 hours daily', target: 120, current: 0, type: 'minutes' },
    { id: 3, title: 'Achieve Deep Flow in 3 sessions', target: 3, current: 0, type: 'deep_flow' },
    { id: 4, title: 'Take breaks every 45 minutes', target: 10, current: 0, type: 'breaks' },
  ])

  useEffect(() => {
    fetch('/api/stats?user_id=1')
      .then(res => res.json())
      .then(data => {
        setGoals(prev => prev.map(goal => {
          if (goal.type === 'sessions') {
            return { ...goal, current: Math.min(data.total_sessions || 0, goal.target) }
          }
          if (goal.type === 'minutes') {
            return { ...goal, current: Math.min(data.total_minutes || 0, goal.target) }
          }
          return goal
        }))
      })
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-500" />
        Goals & Progress
      </h2>

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = Math.min((goal.current / goal.target) * 100, 100)
          const isComplete = goal.current >= goal.target

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                  <span className={`text-sm ${isComplete ? 'text-slate-600 line-through' : 'text-slate-800'}`}>
                    {goal.title}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {goal.current} / {goal.target}
                </span>
              </div>
              
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
