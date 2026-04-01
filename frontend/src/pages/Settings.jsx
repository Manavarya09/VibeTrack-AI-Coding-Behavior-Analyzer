import { useState } from 'react'
import { Zap, User, Bell, Database, ArrowLeft, Save } from 'lucide-react'

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
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Nav */}
      <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">VIBETRACK</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="font-bold hover:underline">DASHBOARD</a>
              <a href="/insights" className="font-bold hover:underline">INSIGHTS</a>
              <a href="/settings" className="font-black text-red-600 border-b-4 border-red-600 pb-1">SETTINGS</a>
              <a href="/" className="font-bold hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> HOME
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
            <span className="text-red-600">SETTINGS</span>
          </h1>
          <p className="text-lg font-bold text-gray-600">CONFIGURE YOUR TRACKING PREFERENCES</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              PROFILE
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase text-gray-500 mb-2">USERNAME</label>
                <input
                  type="text"
                  value={userSettings.username}
                  onChange={(e) => setUserSettings({...userSettings, username: e.target.value})}
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase text-gray-500 mb-2">EMAIL</label>
                <input
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              NOTIFICATIONS
            </h2>
            <label className="flex items-center gap-4 cursor-pointer">
              <div
                onClick={() => setUserSettings({...userSettings, notifications: !userSettings.notifications})}
                className={`w-14 h-8 border-4 border-black flex items-center transition-colors cursor-pointer ${
                  userSettings.notifications ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white border-2 border-black transition-transform ${
                  userSettings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="font-bold">ENABLE NOTIFICATIONS</span>
            </label>
          </div>

          {/* Session Settings */}
          <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              SESSION SETTINGS
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black uppercase text-gray-500 mb-2">
                  IDLE THRESHOLD (MINUTES)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={userSettings.idleThreshold}
                    onChange={(e) => setUserSettings({...userSettings, idleThreshold: parseInt(e.target.value)})}
                    className="flex-1 accent-black"
                  />
                  <div className="w-16 h-12 border-4 border-black flex items-center justify-center font-black text-xl">
                    {userSettings.idleThreshold}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black uppercase text-gray-500 mb-2">
                  AUTO-END INACTIVE SESSION (MINUTES)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    value={userSettings.autoEndSession}
                    onChange={(e) => setUserSettings({...userSettings, autoEndSession: parseInt(e.target.value)})}
                    className="flex-1 accent-black"
                  />
                  <div className="w-16 h-12 border-4 border-black flex items-center justify-center font-black text-xl">
                    {userSettings.autoEndSession}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-black text-white py-4 px-6 text-xl font-black border-4 border-black hover:bg-red-600 transition-colors flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
          >
            <Save className="w-6 h-6" />
            SAVE SETTINGS
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-black">VIBETRACK</span>
          </div>
          <span className="font-bold text-gray-400">&copy; 2026 VibeTrack</span>
        </div>
      </footer>
    </div>
  )
}
