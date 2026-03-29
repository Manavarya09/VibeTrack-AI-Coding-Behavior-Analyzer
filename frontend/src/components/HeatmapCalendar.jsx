import { useState, useEffect } from 'react'

export default function HeatmapCalendar({ sessions = [] }) {
  const [heatmapData, setHeatmapData] = useState({})
  
  useEffect(() => {
    const data = {}
    sessions.forEach(session => {
      if (session.start_time) {
        const date = new Date(session.start_time).toISOString().split('T')[0]
        if (!data[date]) data[date] = 0
        data[date] += session.duration_minutes || 0
      }
    })
    setHeatmapData(data)
  }, [sessions])

  const getColor = (minutes) => {
    if (minutes === 0) return 'bg-slate-100'
    if (minutes < 30) return 'bg-green-200'
    if (minutes < 60) return 'bg-green-300'
    if (minutes < 120) return 'bg-green-400'
    return 'bg-green-500'
  }

  const generateCalendarDays = () => {
    const days = []
    const today = new Date()
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        minutes: heatmapData[dateStr] || 0,
        display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }
    
    return days
  }

  const days = generateCalendarDays()
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Activity Heatmap</h2>
      
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 rounded-sm ${getColor(day.minutes)}`}
                  title={`${day.display}: ${Math.round(day.minutes)} min`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
        <span>Less</span>
        <div className="w-3 h-3 bg-slate-100 rounded-sm" />
        <div className="w-3 h-3 bg-green-200 rounded-sm" />
        <div className="w-3 h-3 bg-green-300 rounded-sm" />
        <div className="w-3 h-3 bg-green-400 rounded-sm" />
        <div className="w-3 h-3 bg-green-500 rounded-sm" />
        <span>More</span>
      </div>
    </div>
  )
}
