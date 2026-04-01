import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const f = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } })

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen text-white">

      {/* nav */}
      <div className="max-w-[1100px] mx-auto px-5 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
            <span className="text-[9px] font-black leading-none">VT</span>
          </div>
          <span className="text-sm font-semibold text-zinc-300">VibeTrack</span>
        </div>
        <Link to="/dashboard" className="btn btn-accent text-[13px]" style={{ padding: '6px 16px' }}>
          Open app
        </Link>
      </div>

      {/* hero */}
      <div className="max-w-[1100px] mx-auto px-5 pt-24 pb-32">
        <motion.div {...f(0)} className="max-w-[680px]">
          <p className="text-indigo-400 text-sm font-semibold mb-4 tracking-wide">AI coding behavior analyzer</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-6">
            See what your AI<br />dependency actually<br />looks like.
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-[520px] mb-10">
            VibeTrack records your sessions with Claude, ChatGPT, and Copilot.
            It scores them, finds patterns, and tells you when you're relying too much.
          </p>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn btn-accent text-base" style={{ padding: '12px 28px' }}>
              Start tracking
            </Link>
            <a href="#how" className="btn btn-ghost text-base" style={{ padding: '12px 28px' }}>
              How it works
            </a>
          </div>
        </motion.div>

        {/* mock dashboard */}
        <motion.div {...f(0.3)} className="mt-20 surface-raised p-1 overflow-hidden">
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg)' }}>
            <div className="p-5 grid grid-cols-4 gap-3">
              {[
                { n: '24', l: 'sessions' },
                { n: '47h', l: 'tracked' },
                { n: '186', l: 'vibe score' },
                { n: '892', l: 'prompts' },
              ].map((s, i) => (
                <div key={i} className="surface-inset p-3 rounded-lg">
                  <div className="text-xl font-bold mono">{s.n}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <div className="surface-inset rounded-lg p-4 flex items-end gap-[3px] h-24">
                {[30,50,35,70,45,80,90,55,65,85,50,40,75,95,60,48,88,72,92,58,68,82,44,76].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ background: h > 70 ? 'var(--accent)' : 'var(--border-bright)' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.02 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* what it does */}
      <div id="how" className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-24">
          <motion.p {...f()} className="label mb-3">How it works</motion.p>
          <motion.h2 {...f(0.05)} className="text-3xl font-bold tracking-tight mb-16">
            Three things. That's it.
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-px rounded-xl overflow-hidden" style={{ background: 'var(--border)' }}>
            {[
              { n: '01', t: 'Track', d: 'Start a session from the dashboard or let the desktop app auto-detect. Every prompt and break gets logged.' },
              { n: '02', t: 'Score', d: 'Your session gets a Vibe Score based on duration, prompt count, and break time. Higher means more dependent.' },
              { n: '03', t: 'Learn', d: 'See patterns over time. ML finds your peak hours, dependency trends, and when you should step away.' },
            ].map((s, i) => (
              <motion.div key={i} {...f(0.1 + i * 0.08)} className="p-8" style={{ background: 'var(--bg-2)' }}>
                <span className="text-indigo-500 mono font-semibold text-sm">{s.n}</span>
                <h3 className="text-xl font-bold mt-3 mb-2">{s.t}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* vibe score */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="label mb-3">The formula</p>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Vibe Score</h2>
              <div className="surface p-4 mb-8">
                <code className="text-indigo-400 mono text-base font-semibold">
                  (duration_min * prompt_count) / (break_min + 1)
                </code>
              </div>
              <div className="space-y-4 text-sm">
                {[
                  { c: 'var(--text-3)', label: 'Normal', range: '< 100', note: 'Balanced. You\'re good.' },
                  { c: 'var(--purple)', label: 'Deep Flow', range: '100 - 499', note: 'Locked in. Watch the clock.' },
                  { c: 'var(--red)', label: 'High Dependency', range: '500+', note: 'Step back. Think for yourself.' },
                ].map(s => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: s.c }} />
                    <div>
                      <span className="font-semibold">{s.label}</span>
                      <span className="text-zinc-500 mono text-xs ml-2">{s.range}</span>
                      <p className="text-zinc-500 text-xs mt-0.5">{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Normal session', score: 45, pct: 9, color: 'var(--text-3)' },
                { label: 'Deep flow session', score: 287, pct: 57, color: 'var(--purple)' },
                { label: 'High dependency', score: 892, pct: 89, color: 'var(--red)' },
              ].map((s, i) => (
                <motion.div key={i} {...f(0.1 + i * 0.1)} className="surface p-5">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-sm text-zinc-400">{s.label}</span>
                    <span className="text-2xl font-bold mono">{s.score}</span>
                  </div>
                  <div className="bar-track">
                    <motion.div
                      className="bar-fill"
                      style={{ background: s.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* features grid */}
      <div className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-24">
          <p className="label mb-3">What you get</p>
          <h2 className="text-3xl font-bold tracking-tight mb-12">Built to actually be useful</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['Session recording', 'Start/stop from web, desktop, or chrome extension. Every prompt timestamped.'],
              ['Pattern detection', 'ML finds your peak hours, break habits, and dependency trends.'],
              ['Desktop tracking', 'Rust-powered Tauri app. Monitors active windows, keystrokes, idle time. Low CPU.'],
              ['Chrome extension', 'Detects Claude, ChatGPT, Copilot tabs automatically.'],
              ['Team dashboards', 'Compare patterns across your team. Share sessions.'],
              ['CSV/JSON export', 'Pull your data out anytime. Research-ready.'],
            ].map(([t, d], i) => (
              <motion.div key={i} {...f(0.05 + i * 0.04)} className="surface p-5">
                <h3 className="text-sm font-semibold mb-1.5">{t}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* cta */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Stop guessing. Start measuring.</h2>
          <p className="text-zinc-500 mb-8">Open source. Self-hosted. Your data stays yours.</p>
          <Link to="/dashboard" className="btn btn-accent text-base" style={{ padding: '12px 32px' }}>
            Open dashboard
          </Link>
        </div>
      </div>

      {/* footer */}
      <div className="border-t py-6 px-5" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <span className="text-xs text-zinc-600">VibeTrack</span>
          <span className="text-xs text-zinc-600">2026</span>
        </div>
      </div>
    </div>
  )
}
