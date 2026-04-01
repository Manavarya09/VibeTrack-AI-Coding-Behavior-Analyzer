import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { logout } from '../utils/api'

export default function Settings({ user }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('vibetrack_settings')
    return stored ? JSON.parse(stored) : {
      username: user?.username || '',
      email: user?.email || '',
      idleThreshold: 5,
      autoEndSession: 30,
      notifications: true,
      desktopTracking: false,
    }
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setSettings(s => ({ ...s, username: user.username, email: user.email }))
    }
  }, [user])

  const handleSave = () => {
    localStorage.setItem('vibetrack_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ value, onChange }) => (
    <div
      className={`toggle-track ${value ? 'active' : ''}`}
      onClick={() => onChange(!value)}
    >
      <div className="toggle-knob" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Settings</h1>
          <p className="text-sm text-stone-400 mt-0.5">Configure your tracking preferences</p>
        </motion.div>

        <div className="space-y-4">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-stone-600 mb-4">Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={e => setSettings({ ...settings, username: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </motion.div>

          {/* Session config */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-stone-600 mb-4">Session tracking</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-500">Idle threshold</label>
                  <div className="inset px-2 py-0.5">
                    <span className="text-xs font-bold dial text-stone-700">{settings.idleThreshold} min</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.idleThreshold}
                  onChange={e => setSettings({ ...settings, idleThreshold: +e.target.value })}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-500">Auto-end inactive session</label>
                  <div className="inset px-2 py-0.5">
                    <span className="text-xs font-bold dial text-stone-700">{settings.autoEndSession} min</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={settings.autoEndSession}
                  onChange={e => setSettings({ ...settings, autoEndSession: +e.target.value })}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>
          </motion.div>

          {/* Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-stone-600 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-stone-700">Notifications</div>
                  <div className="text-xs text-stone-400">Get alerts for long sessions</div>
                </div>
                <Toggle value={settings.notifications} onChange={v => setSettings({ ...settings, notifications: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-stone-700">Desktop tracking</div>
                  <div className="text-xs text-stone-400">Auto-detect active window</div>
                </div>
                <Toggle value={settings.desktopTracking} onChange={v => setSettings({ ...settings, desktopTracking: v })} />
              </div>
            </div>
          </motion.div>

          {/* Save */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button onClick={handleSave} className="btn-primary w-full">
              {saved ? 'Settings saved' : 'Save settings'}
            </button>
          </motion.div>

          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-5 mt-6"
            style={{ borderColor: '#fecaca' }}
          >
            <h3 className="text-sm font-semibold text-red-700 mb-3">Account</h3>
            <button onClick={logout} className="btn-danger w-full">
              Sign out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
