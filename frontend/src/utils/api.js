const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    
    return response
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

export async function checkHealth() {
  try {
    const response = await fetch('/health')
    return response.ok
  } catch {
    return false
  }
}

export async function fetchStats(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/stats${query}`)
}

export async function fetchSessions(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/sessions${query}`)
}

export async function fetchDailyStats(days = 7, userId) {
  let query = `?days=${days}`
  if (userId) query += `&user_id=${userId}`
  return api.get(`/stats/daily${query}`)
}

export async function startSession(userId, source = 'web') {
  return api.post('/session/start', { user_id: userId, source })
}

export async function endSession(sessionId) {
  await api.post(`/session/end/${sessionId}`)
  return api.post(`/session/calculate-vibe/${sessionId}`)
}

export async function logEvent(eventData) {
  return api.post('/event', eventData)
}

export async function fetchAnalytics(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return api.get(`/analytics/summary${query}`)
}

export async function exportCSV(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  const response = await fetch(`${API_BASE}/analytics/export${query}`)
  const blob = await response.blob()
  return blob
}
