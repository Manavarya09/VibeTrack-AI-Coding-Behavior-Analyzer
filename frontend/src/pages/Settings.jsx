import { useState } from 'react'
import { Settings, User, Bell, Database } from 'lucide-react'

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState({
    username: 'Developer',
    email: 'dev@example.com',
    idleThreshold: 5,
    autoEndSession: 30,
    notifications: true
  })

  const handleSave = () => {
    localStorage.setItem('vibetrack_settings', JSON.stringify(userSettings))
    alert('Settings saved!')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings
      </h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
              <input
                type="text"
                value={userSettings.username}
                onChange={(e) => setUserSettings({...userSettings, username: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={userSettings.email}
                onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={userSettings.notifications}
                onChange={(e) => setUserSettings({...userSettings, notifications: e.target.checked})}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-slate-600">Enable notifications</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Session Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Idle Threshold (minutes)
              </label>
              <input
                type="number"
                value={userSettings.idleThreshold}
                onChange={(e) => setUserSettings({...userSettings, idleThreshold: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Auto-end inactive session (minutes)
              </label>
              <input
                type="number"
                value={userSettings.autoEndSession}
                onChange={(e) => setUserSettings({...userSettings, autoEndSession: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
