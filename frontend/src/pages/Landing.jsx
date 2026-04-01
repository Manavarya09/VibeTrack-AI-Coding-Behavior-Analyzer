import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

function AnimatedNumber({ value, duration = 2000 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef()
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value, duration])

  return <span ref={ref} className="dial">{display.toLocaleString()}</span>
}

function FeatureCard({ title, desc, index }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <h3 className="text-base font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </motion.div>
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef()
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -40])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-stone-200 bg-white/90 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                boxShadow: '0 1px 3px rgba(180,83,9,0.3)',
              }}>
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="text-base font-bold tracking-tight text-stone-800">VibeTrack</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">Features</a>
              <a href="#how" className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">How it works</a>
              <a href="#formula" className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">Vibe Score</a>
              <Link to="/login" className="text-sm font-semibold text-stone-600 hover:text-stone-800">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm" style={{ padding: '7px 18px' }}>Get started</Link>
            </div>
            <Link to="/register" className="md:hidden btn-primary text-sm" style={{ padding: '6px 14px' }}>Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="pt-28 pb-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-amber-800 mb-6" style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #fcd34d',
              }}>
                AI Coding Behavior Analyzer
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1] mb-5">
                Know how you code<br />
                <span style={{ color: 'var(--accent)' }}>with AI</span>
              </h1>
              <p className="text-lg text-stone-500 leading-relaxed mb-8 max-w-xl mx-auto">
                VibeTrack monitors your AI-assisted coding sessions, detects dependency patterns,
                and gives you actionable insights to become a better developer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/register" className="btn-primary text-base" style={{ padding: '12px 32px' }}>
                Start tracking free
              </Link>
              <a href="#features" className="btn-secondary text-base" style={{ padding: '12px 32px' }}>
                See how it works
              </a>
            </motion.div>
          </div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="card-raised p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Sessions', value: '24' },
                  { label: 'Hours tracked', value: '47.3' },
                  { label: 'Avg vibe score', value: '186' },
                  { label: 'Prompts logged', value: '892' },
                ].map((s, i) => (
                  <div key={i} className="inset p-3 text-center">
                    <div className="text-xl font-bold dial text-stone-800">{s.value}</div>
                    <div className="text-xs text-stone-400 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="inset p-4">
                <div className="flex items-end gap-1.5 h-28">
                  {[35, 55, 42, 68, 52, 78, 90, 65, 72, 85, 60, 48, 82, 95, 70, 58, 88, 76, 92, 63].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.03, ease: 'easeOut' }}
                      className="flex-1 rounded-t"
                      style={{
                        background: h > 75 ? 'linear-gradient(180deg, #d97706, #b45309)' : 'linear-gradient(180deg, #d6d3d1, #a8a29e)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="py-12 px-4" style={{ background: 'linear-gradient(180deg, #292524, #1c1917)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Sessions tracked', value: 10400 },
            { label: 'Active developers', value: 520 },
            { label: 'Prompts analyzed', value: 54200 },
            { label: 'Accuracy rate', value: 99 },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white">
                <AnimatedNumber value={s.value} />
                {s.label === 'Accuracy rate' ? '%' : '+'}
              </div>
              <div className="text-sm text-stone-400 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-800 tracking-tight mb-3">Built for serious developers</h2>
            <p className="text-stone-500 max-w-lg mx-auto">Everything you need to understand and optimize your relationship with AI coding tools.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Real-time session tracking', desc: 'Start a session, log prompts, take breaks. Every interaction is captured with precision timing.' },
              { title: 'ML-powered pattern detection', desc: 'Our engine analyzes your sessions to find peak hours, dependency trends, and break patterns.' },
              { title: 'Vibe Score classification', desc: 'A proprietary formula classifies sessions as Normal, Deep Flow, or High Dependency.' },
              { title: 'Desktop activity tracking', desc: 'A Rust-powered Tauri app monitors active windows, keystrokes, and idle time automatically.' },
              { title: 'Chrome extension', desc: 'Track which AI tools you use -- Claude, ChatGPT, Copilot -- directly from your browser.' },
              { title: 'Team analytics', desc: 'Share sessions, compare patterns, and build healthier AI coding practices as a team.' },
            ].map((f, i) => (
              <FeatureCard key={i} index={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #fef3c7, #fafaf9)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-800 tracking-tight mb-3">Three simple steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Start a session', desc: 'Click start in the dashboard, or let the desktop tracker auto-detect your coding.' },
              { step: '02', title: 'Code with AI', desc: 'Use Claude, ChatGPT, Copilot -- VibeTrack captures every prompt and break automatically.' },
              { step: '03', title: 'Get insights', desc: 'See your vibe score, classification, and personalized recommendations after each session.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="card p-6 text-center"
              >
                <div className="text-3xl font-bold dial mb-3" style={{ color: 'var(--accent)' }}>{item.step}</div>
                <h3 className="text-base font-bold text-stone-800 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vibe Score */}
      <section id="formula" className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #292524, #1c1917)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-4">The Vibe Score</h2>
              <div className="p-4 rounded-xl mb-6" style={{
                background: 'linear-gradient(135deg, #44403c, #292524)',
                border: '1px solid #57534e',
              }}>
                <code className="text-amber-400 font-mono text-lg font-semibold">
                  (Duration x Prompts) / (Breaks + 1)
                </code>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Normal', range: '< 100', color: '#78716c', desc: 'Balanced usage' },
                  { label: 'Deep Flow', range: '100-499', color: '#7c3aed', desc: 'Highly focused' },
                  { label: 'High Dependency', range: '500+', color: '#dc2626', desc: 'Consider breaks' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                    <span className="text-sm font-semibold text-white w-32">{item.label}</span>
                    <span className="text-sm text-stone-400 font-mono">{item.range}</span>
                    <span className="text-xs text-stone-500 ml-auto">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Normal', score: 45, pct: 12, color: '#78716c' },
                { label: 'Deep Flow', score: 287, pct: 57, color: '#7c3aed' },
                { label: 'High Dependency', score: 892, pct: 89, color: '#dc2626' },
              ].map(item => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="p-4 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #44403c, #292524)', border: '1px solid #57534e' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                    <span className="text-lg font-bold dial text-white">{item.score}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#57534e' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-800 tracking-tight mb-4">Ready to understand your coding?</h2>
          <p className="text-stone-500 mb-8">Join developers who track, analyze, and improve their AI-assisted workflow.</p>
          <Link to="/register" className="btn-primary text-base" style={{ padding: '14px 36px' }}>
            Start tracking -- it's free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
            }}>
              <span className="text-white text-[10px] font-bold">V</span>
            </div>
            <span className="text-sm font-semibold text-stone-700">VibeTrack</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-stone-400">
            <span>AI Coding Behavior Analyzer</span>
            <span>2026 All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
