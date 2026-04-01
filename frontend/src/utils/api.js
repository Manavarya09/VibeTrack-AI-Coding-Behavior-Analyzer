const API = '/api'

async function req(endpoint, opts = {}) {
  const r = await fetch(`${API}${endpoint}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.detail || `HTTP ${r.status}`)
  }
  return r.headers.get('content-type')?.includes('json') ? r.json() : r
}

const get = (e) => req(e)
const post = (e, d) => req(e, { method: 'POST', body: JSON.stringify(d) })

export const startSession = (uid, source = 'web') => post('/session/start', { user_id: uid, source })
export const endSession = async (sid) => { await post(`/session/end/${sid}`); return post(`/session/calculate-vibe/${sid}`) }
export const fetchSessions = (uid) => get(uid ? `/sessions?user_id=${uid}` : '/sessions')
export const fetchSession = (sid) => get(`/session/${sid}`)
export const logEvent = (d) => post('/event', d)
export const fetchEvents = (sid) => get(`/events?session_id=${sid}`)
export const fetchStats = (uid) => get(uid ? `/stats?user_id=${uid}` : '/stats')
export const fetchDailyStats = (days = 14, uid) => get(`/stats/daily?days=${days}${uid ? `&user_id=${uid}` : ''}`)
export const fetchPatterns = (uid) => get(uid ? `/ml/patterns?user_id=${uid}` : '/ml/patterns')
export const predict = (dur, prompts, brk) => get(`/ml/predict?duration=${dur}&prompt_count=${prompts}&break_minutes=${brk}`)
export const fetchRecommendations = (uid) => get(uid ? `/recommendations?user_id=${uid}` : '/recommendations')
