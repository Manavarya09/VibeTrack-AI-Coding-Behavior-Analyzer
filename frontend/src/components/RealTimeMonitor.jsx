import { useState, useEffect, useRef } from 'react'
import { Activity, Wifi, WifiOff } from 'lucide-react'

export default function RealTimeMonitor() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [eventCount, setEventCount] = useState(0)
  const wsRef = useRef(null)

  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/1')
      
      wsRef.current.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLastEvent(data)
        setEventCount(prev => prev + 1)
      }
      
      wsRef.current.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
        setTimeout(connectWebSocket, 3000)
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const sendPing = () => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-Time Monitor
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Events Received</p>
            <p className="text-2xl font-bold text-slate-800">{eventCount}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Connection Status</p>
            <p className="text-2xl font-bold text-slate-800">{isConnected ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        {lastEvent && (
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Last Event</p>
            <pre className="text-xs text-indigo-800 mt-2 overflow-x-auto">
              {JSON.stringify(lastEvent, null, 2)}
            </pre>
          </div>
        )}

        <button
          onClick={sendPing}
          disabled={!isConnected}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Send Ping
        </button>
      </div>
    </div>
  )
}
