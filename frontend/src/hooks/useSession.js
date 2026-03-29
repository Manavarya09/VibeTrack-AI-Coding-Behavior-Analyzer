import { useState, useCallback } from 'react'

export function useSession() {
  const [currentSession, setCurrentSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const startSession = useCallback(async (userId = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, source: 'web' })
      })
      if (!res.ok) throw new Error('Failed to start session')
      const session = await res.json()
      setCurrentSession(session)
      return session
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const endSession = useCallback(async (sessionId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/session/end/${sessionId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to end session')
      
      await fetch(`/api/session/calculate-vibe/${sessionId}`, { method: 'POST' })
      
      setCurrentSession(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logPrompt = useCallback(async (sessionId, userId = 1, content = '') => {
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          event_type: 'prompt',
          source: 'web',
          content: content,
          duration_seconds: 0
        })
      })
    } catch (err) {
      console.error('Failed to log prompt:', err)
    }
  }, [])

  const logBreak = useCallback(async (sessionId, durationMinutes, userId = 1) => {
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          event_type: 'break',
          source: 'web',
          content: `Break: ${durationMinutes} minutes`,
          duration_seconds: durationMinutes * 60
        })
      })
    } catch (err) {
      console.error('Failed to log break:', err)
    }
  }, [])

  return {
    currentSession,
    loading,
    error,
    startSession,
    endSession,
    logPrompt,
    logBreak
  }
}
