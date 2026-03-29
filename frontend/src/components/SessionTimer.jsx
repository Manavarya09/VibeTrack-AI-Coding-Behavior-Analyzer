import { useState, useEffect } from 'react'
import { Play, Square, Clock } from 'lucide-react'

export default function SessionTimer({ currentSession, onStart, onEnd }) {
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentSession?.start_time) {
      const start = new Date(currentSession.start_time).getTime()
      const update = () => {
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }
      update()
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    } else {
      setElapsed(0)
    }
  }, [currentSession])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      await onStart()
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = async () => {
    setLoading(true)
    try {
      await onEnd()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Current Session
        </h2>
        {currentSession && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Active
          </span>
        )}
      </div>
      
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-slate-800 font-mono">
          {formatTime(elapsed)}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {currentSession ? 'Session in progress' : 'No active session'}
        </p>
      </div>

      <div className="flex gap-3">
        {!currentSession ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Start Session
          </button>
        ) : (
          <button
            onClick={handleEnd}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Square className="w-5 h-5" />
            End Session
          </button>
        )}
      </div>
    </div>
  )
}
