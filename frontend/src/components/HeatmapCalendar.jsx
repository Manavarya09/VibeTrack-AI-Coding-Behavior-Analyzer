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
    if (minutes === 0) return 'bg-gray-200'
    if (minutes < 30) return 'bg-gray-400'
    if (minutes < 60) return 'bg-gray-600'
    if (minutes < 120) return 'bg-red-500'
    return 'bg-red-600'
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
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6">ACTIVITY HEATMAP</h2>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 ${getColor(day.minutes)} border border-black`}
                  title={`${day.display}: ${Math.round(day.minutes)} min`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 font-bold text-xs text-gray-500">
        <span>LESS</span>
        <div className="w-3 h-3 bg-gray-200 border border-black" />
        <div className="w-3 h-3 bg-gray-400 border border-black" />
        <div className="w-3 h-3 bg-gray-600 border border-black" />
        <div className="w-3 h-3 bg-red-500 border border-black" />
        <div className="w-3 h-3 bg-red-600 border border-black" />
        <span>MORE</span>
      </div>
    </div>
  )
}
