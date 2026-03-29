import { useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'

export default function PromptInput({ sessionId, onPromptSent }) {
  const [prompt, setPrompt] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || !sessionId) return

    setSending(true)
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: 1,
          event_type: 'prompt',
          source: 'web',
          content: prompt.substring(0, 500),
          duration_seconds: 0
        })
      })
      setPrompt('')
      if (onPromptSent) onPromptSent()
    } catch (err) {
      console.error('Failed to send prompt:', err)
    } finally {
      setSending(false)
    }
  }

  if (!sessionId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-slate-500 text-sm">Start a session to log prompts.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Log AI Prompt
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt to AI assistant..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={sending || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Log Prompt'}
        </button>
      </form>
    </div>
  )
}
