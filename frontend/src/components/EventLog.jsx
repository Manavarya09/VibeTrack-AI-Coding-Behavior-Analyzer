import { useState, useEffect } from 'react'
import { MessageSquare, Clock, Coffee, MousePointer } from 'lucide-react'

export default function EventLog({ sessionId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    fetch(`/api/reports/session/${sessionId}/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [sessionId])

  const getEventIcon = (type) => {
    switch (type) {
      case 'prompt': return MessageSquare
      case 'break': return Coffee
      case 'activity': return MousePointer
      default: return Clock
    }
  }

  const getEventAccent = (type) => {
    switch (type) {
      case 'prompt': return 'bg-black'
      case 'break': return 'bg-red-600'
      case 'activity': return 'bg-black'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-100 border-2 border-black animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6">SESSION EVENTS ({events.length})</h2>

      {!events.length ? (
        <div className="h-32 bg-gray-100 border-2 border-black flex items-center justify-center">
          <p className="font-bold text-gray-400">NO EVENTS RECORDED</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.event_type)
            const accent = getEventAccent(event.event_type)

            return (
              <div key={index} className="flex items-start gap-3 p-3 border-2 border-black hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 ${accent} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm uppercase">{event.event_type}</p>
                  <p className="text-sm font-bold text-gray-500 truncate">{event.content || 'No content'}</p>
                </div>
                <span className="font-bold text-xs text-gray-400 flex-shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
