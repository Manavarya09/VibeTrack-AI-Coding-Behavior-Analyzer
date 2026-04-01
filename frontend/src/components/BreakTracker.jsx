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
      <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-20 bg-gray-100 border-2 border-black flex items-center justify-center">
          <p className="font-bold text-gray-400">START A SESSION TO TAKE BREAKS</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
          <Coffee className="w-6 h-6 text-white" />
        </div>
        TAKE A BREAK
      </h2>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-black text-sm text-gray-500 uppercase">BREAK DURATION</label>
            <div className="bg-black text-white px-3 py-1 font-black">{breakDuration} MIN</div>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => setBreakDuration(parseInt(e.target.value))}
            className="w-full accent-red-600"
          />
          <div className="flex justify-between text-xs font-bold text-gray-400 mt-1">
            <span>1 MIN</span>
            <span>30 MIN</span>
          </div>
        </div>
        <button
          onClick={handleTakeBreak}
          disabled={taking}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 font-black border-4 border-black hover:bg-black transition-colors disabled:opacity-50"
        >
          <Coffee className="w-5 h-5" />
          {taking ? 'LOGGING...' : 'LOG BREAK'}
        </button>
      </div>
    </div>
  )
}
