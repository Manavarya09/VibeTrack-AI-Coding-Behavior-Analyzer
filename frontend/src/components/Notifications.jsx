import { useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const NOTIFICATION_TYPES = {
  success: { icon: CheckCircle, bg: 'bg-black', border: 'border-black' },
  error: { icon: AlertCircle, bg: 'bg-red-600', border: 'border-red-600' },
  info: { icon: Info, bg: 'bg-black', border: 'border-black' },
}

export function Notification({ type = 'info', message, onClose }) {
  const { icon: Icon, bg } = NOTIFICATION_TYPES[type]

  return (
    <div className={`flex items-center gap-3 p-4 ${bg} text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 font-bold text-sm">{message}</p>
      <button onClick={onClose} className="hover:opacity-80">
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
