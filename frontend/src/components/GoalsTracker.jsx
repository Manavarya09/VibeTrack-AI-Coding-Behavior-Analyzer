import { useState, useEffect } from 'react'
import { Target, Check } from 'lucide-react'

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
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        GOALS & PROGRESS
      </h2>

      <div className="space-y-5">
        {goals.map(goal => {
          const progress = Math.min((goal.current / goal.target) * 100, 100)
          const isComplete = goal.current >= goal.target

          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 border-2 border-black flex items-center justify-center ${
                    isComplete ? 'bg-black' : 'bg-white'
                  }`}>
                    {isComplete && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`font-bold text-sm ${isComplete ? 'line-through text-gray-400' : ''}`}>
                    {goal.title}
                  </span>
                </div>
                <span className="font-black text-sm">
                  {Math.round(goal.current)}/{goal.target}
                </span>
              </div>
              <div className="h-4 bg-gray-200 border-2 border-black">
                <div
                  className={`h-full transition-all duration-500 ${isComplete ? 'bg-black' : 'bg-red-600'}`}
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
