import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function Settings({ user }) {
  const [cfg, setCfg] = useState(() => {
    const s = localStorage.getItem('vt_settings')
    return s ? JSON.parse(s) : { idle: 5, autoEnd: 30, notifications: true, desktop: false }
  })
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('vt_settings', JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const Toggle = ({ on, onChange }) => (
    <button onClick={() => onChange(!on)}
      className="w-10 h-[22px] rounded-full relative transition-colors"
      style={{ background: on ? 'var(--accent)' : 'var(--bg-3)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}` }}
    >
      <div className="w-4 h-4 rounded-full bg-white absolute top-[2px] transition-transform"
        style={{ left: on ? '21px' : '2px' }}
      />
    </button>
  )

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <Navbar />
      <div className="max-w-[600px] mx-auto px-5 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface p-5">
            <div className="label mb-4">Profile</div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-500 mb-1 block">Username</label>
                <input type="text" value={user?.username || ''} readOnly className="field opacity-60" />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 mb-1 block">User ID</label>
                <input type="text" value={user?.id || ''} readOnly className="field opacity-60" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface p-5">
            <div className="label mb-4">Tracking</div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-400">Idle threshold</span>
                  <span className="text-sm mono font-semibold">{cfg.idle}m</span>
                </div>
                <input type="range" min="1" max="30" value={cfg.idle}
                  onChange={e => setCfg({ ...cfg, idle: +e.target.value })} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-400">Auto-end after inactive</span>
                  <span className="text-sm mono font-semibold">{cfg.autoEnd}m</span>
                </div>
                <input type="range" min="5" max="120" value={cfg.autoEnd}
                  onChange={e => setCfg({ ...cfg, autoEnd: +e.target.value })} className="w-full" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface p-5">
            <div className="label mb-4">Preferences</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Notifications</div>
                  <div className="text-[11px] text-zinc-600">Alert on long sessions</div>
                </div>
                <Toggle on={cfg.notifications} onChange={v => setCfg({ ...cfg, notifications: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Desktop tracking</div>
                  <div className="text-[11px] text-zinc-600">Auto-detect active window</div>
                </div>
                <Toggle on={cfg.desktop} onChange={v => setCfg({ ...cfg, desktop: v })} />
              </div>
            </div>
          </motion.div>

          <button onClick={save} className={`btn w-full ${saved ? 'btn-ghost' : 'btn-accent'}`}>
            {saved ? 'Saved' : 'Save settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
