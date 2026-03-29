import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const NOTIFICATION_TYPES = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-800' },
  error: { icon: AlertCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
}

export function Notification({ type = 'info', message, onClose }) {
  const { icon: Icon, bg, text } = NOTIFICATION_TYPES[type]
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bg} animate-slide-in`}>
      <Icon className={`w-5 h-5 ${text}`} />
      <p className={`flex-1 text-sm ${text}`}>{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = (type, message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => removeNotification(id), 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {children({ addNotification })}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  )
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([])

  const notify = (type, message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, notify, dismiss }
}
