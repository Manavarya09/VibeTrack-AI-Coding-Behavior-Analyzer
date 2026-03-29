import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatsGrid({ stats, comparison }) {
  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const trend = comparison?.[stat.key] ? getTrend(stat.value, comparison[stat.key]) : null
        
        return (
          <div key={index} className="bg-white border-4 border-black p-4">
            <p className="text-sm font-bold text-gray-500 uppercase">{stat.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-black">{stat.value}</span>
              {trend && (
                <span className={`flex items-center text-sm font-bold ${
                  trend.direction === 'up' ? 'text-green-600' : 
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {trend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                   trend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                   <Minus className="w-4 h-4" />}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
