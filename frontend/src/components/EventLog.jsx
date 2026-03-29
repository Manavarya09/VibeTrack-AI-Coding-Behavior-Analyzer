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
      .catch(err => {
        console.error('Failed to fetch events:', err)
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

  const getEventColor = (type) => {
    switch (type) {
      case 'prompt': return 'text-blue-500 bg-blue-50'
      case 'break': return 'text-orange-500 bg-orange-50'
      case 'activity': return 'text-green-500 bg-green-50'
      default: return 'text-slate-500 bg-slate-50'
    }
  }

  if (loading) {
    return <div className="animate-pulse h-48 bg-slate-200 rounded-xl"></div>
  }

  if (!events.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Events</h2>
        <p className="text-slate-500 text-sm">No events recorded in this session.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Events ({events.length})</h2>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.event_type)
          const colorClass = getEventColor(event.event_type)
          
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 capitalize">{event.event_type}</p>
                <p className="text-xs text-slate-500 truncate">{event.content || 'No content'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
