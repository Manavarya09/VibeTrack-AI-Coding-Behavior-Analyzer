import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500'
}

export function Toast({ type = 'info', message, onClose, duration = 5000 }) {
  const Icon = icons[type]
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:opacity-80">
        <X className="w-4 h-4" />
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
    info: (msg) => addToast('info', msg)
  }
}
