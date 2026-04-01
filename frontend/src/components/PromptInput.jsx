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
      <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-20 bg-gray-100 border-2 border-black flex items-center justify-center">
          <p className="font-bold text-gray-400">START A SESSION TO LOG PROMPTS</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-black flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        LOG AI PROMPT
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt to AI assistant..."
          className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={sending || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 font-black border-4 border-black hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          {sending ? 'SENDING...' : 'LOG PROMPT'}
        </button>
      </form>
    </div>
  )
}
