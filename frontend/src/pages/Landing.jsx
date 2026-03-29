import { useState, useEffect } from 'react'
import { ArrowRight, Zap, Brain, BarChart3, Users, Webhook, Activity, Clock, Target, ChevronRight, X, Menu } from 'lucide-react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b-4 border-black transition-all ${scrolled ? 'bg-white' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">VIBETRACK</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="font-bold hover:underline">FEATURES</a>
              <a href="#how-it-works" className="font-bold hover:underline">HOW IT WORKS</a>
              <a href="#pricing" className="font-bold hover:underline">PRICING</a>
              <a href="/dashboard" className="bg-red-600 text-white px-6 py-3 font-black border-2 border-black hover:bg-red-700 transition-colors">
                DASHBOARD
              </a>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t-4 border-black">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block font-bold text-lg">FEATURES</a>
              <a href="#how-it-works" className="block font-bold text-lg">HOW IT WORKS</a>
              <a href="#pricing" className="block font-bold text-lg">PRICING</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-black text-white px-4 py-2 font-bold mb-6 border-2 border-black">
                AI CODING BEHAVIOR ANALYZER
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6">
                TRACK YOUR
                <br />
                <span className="text-red-600">VIBE CODING</span>
                <br />
                SESSIONS
              </h1>
              <p className="text-xl font-bold mb-8 max-w-xl">
                Detect "vibe coding loops", analyze engagement patterns, and optimize your AI-assisted development workflow with precision tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/dashboard" className="bg-black text-white px-8 py-4 text-xl font-black border-2 border-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  START TRACKING <ArrowRight className="w-6 h-6" />
                </a>
                <a href="#features" className="bg-white text-black px-8 py-4 text-xl font-black border-4 border-black hover:bg-gray-100 transition-colors flex items-center justify-center">
                  LEARN MORE
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-4 border-black bg-red-600"></div>
              <div className="relative border-4 border-black bg-white p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black p-4 text-white">
                    <Clock className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-black">127</div>
                    <div className="text-sm font-bold">HOURS TRACKED</div>
                  </div>
                  <div className="bg-red-600 p-4 text-white">
                    <Zap className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-black">89</div>
                    <div className="text-sm font-bold">VIBE SCORE</div>
                  </div>
                </div>
                <div className="h-48 bg-gray-100 border-2 border-black p-4">
                  <div className="flex items-end gap-2 h-full">
                    {[65, 80, 45, 90, 70, 85, 95, 60, 75, 88, 92, 78].map((h, i) => (
                      <div key={i} className="flex-1 bg-black" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-black text-white py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black text-red-600">10K+</div>
              <div className="font-bold mt-2">SESSIONS TRACKED</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-red-600">500+</div>
              <div className="font-bold mt-2">ACTIVE USERS</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-red-600">50K+</div>
              <div className="font-bold mt-2">PROMPTS ANALYZED</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-red-600">99%</div>
              <div className="font-bold mt-2">ACCURACY RATE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-4">FEATURES</h2>
            <p className="text-xl font-bold">EVERYTHING YOU NEED TO TRACK YOUR AI CODING</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: 'REAL-TIME TRACKING', desc: 'Monitor sessions as they happen with live updates', color: 'bg-red-600' },
              { icon: Brain, title: 'ML INSIGHTS', desc: 'AI-powered pattern detection and predictions', color: 'bg-black' },
              { icon: BarChart3, title: 'ADVANCED ANALYTICS', desc: 'Deep dive into your coding behavior', color: 'bg-red-600' },
              { icon: Users, title: 'TEAM COLLAB', desc: 'Share sessions with your team', color: 'bg-black' },
              { icon: Webhook, title: 'WEBHOOKS', desc: 'Integrate with Slack, Discord, and more', color: 'bg-red-600' },
              { icon: Target, title: 'GOALS TRACKING', desc: 'Set and achieve productivity targets', color: 'bg-black' },
            ].map((feature, i) => (
              <div key={i} className="border-4 border-black p-6 hover:translate-x-1 hover:-translate-y-1 transition-transform duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className={`w-16 h-16 ${feature.color} flex items-center justify-center mb-4 border-2 border-black`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2">{feature.title}</h3>
                <p className="font-bold text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-red-600 border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4">HOW IT WORKS</h2>
            <p className="text-xl font-bold text-white">THREE SIMPLE STEPS</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'START SESSION', desc: 'Click start to begin tracking your coding session' },
              { step: '02', title: 'CODE WITH AI', desc: 'Use your favorite AI tools while we track' },
              { step: '03', title: 'GET INSIGHTS', desc: 'Receive detailed analytics and recommendations' },
            ].map((item, i) => (
              <div key={i} className="bg-white border-4 border-black p-8 text-center">
                <div className="text-6xl font-black text-red-600 mb-4">{item.step}</div>
                <h3 className="text-2xl font-black mb-2">{item.title}</h3>
                <p className="font-bold text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vibe Score Demo */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black mb-6">
                VIBE SCORE
                <br />
                <span className="text-red-600">FORMULA</span>
              </h2>
              <div className="bg-white text-black p-6 border-4 border-white mb-6">
                <code className="text-2xl font-mono font-bold">
                  (Duration × Prompts) / (Break Time + 1)
                </code>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-500 border-2 border-white"></div>
                  <span className="font-bold">Normal: &lt; 100</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-500 border-2 border-white"></div>
                  <span className="font-bold">Deep Flow: 100 - 499</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-600 border-2 border-white"></div>
                  <span className="font-bold">High Dependency: ≥ 500</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                { label: 'Normal', score: 45, color: 'bg-gray-500' },
                { label: 'Deep Flow', score: 287, color: 'bg-purple-500' },
                { label: 'High Dependency', score: 892, color: 'bg-red-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white border-4 border-white p-4 flex items-center gap-4">
                  <div className={`w-16 h-16 ${item.color} flex items-center justify-center`}>
                    <span className="text-2xl font-black text-white">{item.score}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 mb-2">
                      <div className={`h-full ${item.color}`} style={{ width: `${Math.min(item.score / 10, 100)}%` }}></div>
                    </div>
                    <span className="font-black text-black">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6">READY TO TRACK?</h2>
          <p className="text-xl font-bold mb-8">Join thousands of developers optimizing their AI coding workflow</p>
          <a href="/dashboard" className="inline-block bg-red-600 text-white px-12 py-6 text-2xl font-black border-4 border-black hover:bg-black transition-colors flex items-center gap-3 mx-auto w-fit">
            GET STARTED FREE <ArrowRight className="w-8 h-8" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <span className="text-xl font-black">VIBETRACK</span>
              </div>
              <p className="font-bold text-gray-400">AI Coding Behavior Analyzer</p>
            </div>
            <div>
              <h4 className="font-black mb-4">PRODUCT</h4>
              <ul className="space-y-2 font-bold">
                <li><a href="#" className="hover:text-red-600">Features</a></li>
                <li><a href="#" className="hover:text-red-600">Pricing</a></li>
                <li><a href="#" className="hover:text-red-600">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-4">COMPANY</h4>
              <ul className="space-y-2 font-bold">
                <li><a href="#" className="hover:text-red-600">About</a></li>
                <li><a href="#" className="hover:text-red-600">Blog</a></li>
                <li><a href="#" className="hover:text-red-600">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-4">LEGAL</h4>
              <ul className="space-y-2 font-bold">
                <li><a href="#" className="hover:text-red-600">Privacy</a></li>
                <li><a href="#" className="hover:text-red-600">Terms</a></li>
                <li><a href="#" className="hover:text-red-600">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center font-bold">
            © 2026 VibeTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
