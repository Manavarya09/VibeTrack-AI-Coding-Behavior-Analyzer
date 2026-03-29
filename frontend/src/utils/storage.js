const STORAGE_KEY = 'vibetrack_cache'

export const storage = {
  get: (key) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return null
      const parsed = JSON.parse(data)
      return parsed[key] ?? null
    } catch {
      return null
    }
  },
  
  set: (key, value) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const parsed = data ? JSON.parse(data) : {}
      parsed[key] = value
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } catch (e) {
      console.error('Storage error:', e)
    }
  },
  
  remove: (key) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return
      const parsed = JSON.parse(data)
      delete parsed[key]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } catch (e) {
      console.error('Storage error:', e)
    }
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEY)
  }
}
