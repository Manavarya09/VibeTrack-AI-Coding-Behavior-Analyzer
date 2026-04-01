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
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLastEvent(data)
        setEventCount(prev => prev + 1)
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        setTimeout(connectWebSocket, 3000)
      }

      wsRef.current.onerror = () => {}
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
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          REAL-TIME MONITOR
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 border-2 border-black font-black text-sm ${
          isConnected ? 'bg-black text-white' : 'bg-red-600 text-white'
        }`}>
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border-2 border-black p-4">
          <p className="font-black text-sm text-gray-500">EVENTS</p>
          <p className="text-3xl font-black">{eventCount}</p>
        </div>
        <div className="border-2 border-black p-4">
          <p className="font-black text-sm text-gray-500">STATUS</p>
          <p className="text-3xl font-black">{isConnected ? 'LIVE' : 'OFF'}</p>
        </div>
      </div>

      {lastEvent && (
        <div className="bg-gray-100 border-2 border-black p-4 mb-4">
          <p className="font-black text-sm text-gray-500 mb-2">LAST EVENT</p>
          <pre className="text-xs font-mono font-bold overflow-x-auto">
            {JSON.stringify(lastEvent, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={sendPing}
        disabled={!isConnected}
        className="w-full bg-black text-white py-3 px-4 font-black border-4 border-black hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        SEND PING
      </button>
    </div>
  )
}
