import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      onLogin(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
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
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Welcome back</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to your VibeTrack account</p>
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
                placeholder="Enter username"
                required
                autoFocus
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
                placeholder="Enter password"
                required
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-5">
          No account?{' '}
          <Link to="/register" className="font-semibold text-amber-700 hover:text-amber-800">
            Create one
          </Link>
        </p>

        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-stone-400 hover:text-stone-600">Back to home</Link>
        </p>
      </div>
    </div>
  )
}
