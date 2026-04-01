import { useState, useEffect } from 'react'

const colors = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  error: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  info: { bg: '#f5f5f4', border: '#d6d3d1', text: '#44403c' },
}

export function Toast({ type = 'info', message, onClose, duration = 5000 }) {
  const c = colors[type] || colors.info

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] shadow-lg animate-in"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <p className="flex-1 text-sm font-medium" style={{ color: c.text }}>{message}</p>
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
      >
        dismiss
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (type, message, duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message, duration }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return {
    toasts,
    addToast,
    removeToast,
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info: (msg) => addToast('info', msg),
  }
}
