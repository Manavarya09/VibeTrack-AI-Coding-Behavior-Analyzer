import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../utils/api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #fafaf9 0%, #f5f0eb 50%, #fafaf9 100%)',
    }}>
      <div className="w-full max-w-sm animate-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            boxShadow: '0 4px 12px rgba(180,83,9,0.3)',
          }}>
            <span className="text-white text-lg font-bold">V</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Create account</h1>
          <p className="text-sm text-stone-500 mt-1">Start tracking your coding sessions</p>
        </div>

        <div className="card-raised p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field"
                placeholder="Choose a username"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-700 hover:text-amber-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
