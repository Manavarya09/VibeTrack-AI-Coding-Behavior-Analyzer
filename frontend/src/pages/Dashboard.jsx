import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import SessionList from '../components/SessionList'
import AnalyticsSummary from '../components/AnalyticsSummary'

export default function Dashboard({ stats, dailyStats, sessions }) {
  const chartData = dailyStats.map(d => ({
    name: d.date.slice(5),
    sessions: d.session_count,
    minutes: Math.round(d.total_minutes)
  }))

  const classificationData = [
    { name: 'Normal', value: stats?.normal_count || 0, color: '#64748b' },
    { name: 'Deep Flow', value: stats?.deep_flow_count || 0, color: '#8b5cf6' },
    { name: 'High Dependency', value: stats?.high_dependency_count || 0, color: '#ef4444' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Daily Activity</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Sessions per Day</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Classifications</h2>
        <div className="space-y-4">
          {classificationData.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Sessions</h2>
        <SessionList sessions={sessions.slice(0, 5)} />
      </div>

      <div className="lg:col-span-2">
        <AnalyticsSummary />
      </div>
    </div>
  )
}
