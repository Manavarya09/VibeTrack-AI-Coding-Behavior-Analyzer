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
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          CURRENT SESSION
        </h2>
        {currentSession && (
          <div className="bg-red-600 text-white px-4 py-1 font-black text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ACTIVE
          </div>
        )}
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-black font-mono tracking-wider">
          {formatTime(elapsed)}
        </div>
        <p className="font-bold text-gray-500 mt-2 uppercase">
          {currentSession ? 'Session in progress' : 'No active session'}
        </p>
      </div>

      {!currentSession ? (
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 px-6 font-black text-lg border-4 border-black hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <Play className="w-6 h-6" />
          START SESSION
        </button>
      ) : (
        <button
          onClick={handleEnd}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-4 px-6 font-black text-lg border-4 border-black hover:bg-black transition-colors disabled:opacity-50"
        >
          <Square className="w-6 h-6" />
          END SESSION
        </button>
      )}
    </div>
  )
}
