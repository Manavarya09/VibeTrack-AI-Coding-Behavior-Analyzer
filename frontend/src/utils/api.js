const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('vibetrack_token')
}

export function setToken(token) {
  localStorage.setItem('vibetrack_token', token)
}

export function clearToken() {
  localStorage.removeItem('vibetrack_token')
  localStorage.removeItem('vibetrack_user')
}

export function getStoredUser() {
  const u = localStorage.getItem('vibetrack_user')
  return u ? JSON.parse(u) : null
}

export function setStoredUser(user) {
  localStorage.setItem('vibetrack_user', JSON.stringify(user))
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const token = getToken()

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (response.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

// Auth
export async function register(username, email, password) {
  const data = await api.post('/auth/register', { username, email, password })
  return data
}

export async function login(username, password) {
  const data = await api.post('/auth/login/json', { username, password })
  setToken(data.access_token)
  const user = await api.get('/auth/me')
  setStoredUser(user)
  return user
}

export function logout() {
  clearToken()
  window.location.href = '/login'
}

export async function getMe() {
  return api.get('/auth/me')
}

// Sessions
export async function startSession(userId, source = 'web') {
  return api.post('/session/start', { user_id: userId, source })
}

export async function endSession(sessionId) {
  const session = await api.post(`/session/end/${sessionId}`)
  await api.post(`/session/calculate-vibe/${sessionId}`)
  return session
}

export async function fetchSessions(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/sessions${query}`)
}

export async function fetchSession(sessionId) {
  return api.get(`/session/${sessionId}`)
}

// Events
export async function logEvent(data) {
  return api.post('/event', data)
}

export async function fetchEvents(sessionId) {
  return api.get(`/events?session_id=${sessionId}`)
}

// Stats
export async function fetchStats(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/stats${query}`)
}

export async function fetchDailyStats(days = 7, userId) {
  let query = `?days=${days}`
  if (userId) query += `&user_id=${userId}`
  return api.get(`/stats/daily${query}`)
}

// ML
export async function fetchPatterns(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/ml/patterns${query}`)
}

export async function predict(duration, promptCount, breakMinutes) {
  return api.get(`/ml/predict?duration=${duration}&prompt_count=${promptCount}&break_minutes=${breakMinutes}`)
}

export async function fetchRecommendations(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/recommendations${query}`)
}

// Health
export async function checkHealth() {
  try {
    const r = await fetch('/health')
    return r.ok
  } catch {
    return false
  }
}
