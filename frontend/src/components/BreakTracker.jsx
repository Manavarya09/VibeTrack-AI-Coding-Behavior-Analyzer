import { useState } from 'react'
import { Coffee } from 'lucide-react'

export default function BreakTracker({ sessionId, onBreakTaken }) {
  const [breakDuration, setBreakDuration] = useState(5)
  const [taking, setTaking] = useState(false)

  const handleTakeBreak = async () => {
    if (!sessionId) return
    
    setTaking(true)
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: 1,
          event_type: 'break',
          source: 'web',
          content: `Break: ${breakDuration} minutes`,
          duration_seconds: breakDuration * 60
        })
      })
      if (onBreakTaken) onBreakTaken(breakDuration)
    } catch (err) {
      console.error('Failed to log break:', err)
    } finally {
      setTaking(false)
    }
  }

  if (!sessionId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-slate-500 text-sm">Start a session to take breaks.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Coffee className="w-5 h-5 text-orange-500" />
        Take a Break
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Break duration: {breakDuration} minutes
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => setBreakDuration(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={handleTakeBreak}
          disabled={taking}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          <Coffee className="w-4 h-4" />
          {taking ? 'Logging...' : 'Log Break'}
        </button>
      </div>
    </div>
  )
}
