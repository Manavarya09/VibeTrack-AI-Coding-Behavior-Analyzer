import { useState } from 'react'
import { Sparkles, Zap } from 'lucide-react'

export default function PredictionCard() {
  const [prediction, setPrediction] = useState(null)
  const [duration, setDuration] = useState(60)
  const [prompts, setPrompts] = useState(10)
  const [breaks, setBreaks] = useState(5)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ml/predict?duration=${duration}&prompt_count=${prompts}&break_minutes=${breaks}`)
      const data = await res.json()
      setPrediction(data)
    } catch (err) {
      console.error('Prediction failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Deep Flow': return 'bg-purple-600'
      case 'High Dependency': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-black flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        SESSION PREDICTOR
      </h2>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-black uppercase text-gray-500 mb-2">DURATION (MIN)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-black uppercase text-gray-500 mb-2">EXPECTED PROMPTS</label>
          <input
            type="number"
            value={prompts}
            onChange={(e) => setPrompts(Number(e.target.value))}
            className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-black uppercase text-gray-500 mb-2">BREAK TIME (MIN)</label>
          <input
            type="number"
            value={breaks}
            onChange={(e) => setBreaks(Number(e.target.value))}
            className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full bg-black text-white py-3 px-4 font-black border-4 border-black hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'PREDICTING...' : 'PREDICT OUTCOME'}
      </button>

      {prediction && (
        <div className="mt-4 border-4 border-black p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`px-4 py-2 text-white font-black ${getClassificationColor(prediction.predicted_classification)}`}>
              {(prediction.predicted_classification || 'NORMAL').toUpperCase()}
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-5 h-5" />
              <span className="font-black text-2xl">{Math.round(prediction.predicted_score || 0)}</span>
            </div>
          </div>
          <div className="h-3 bg-gray-200 border border-black">
            <div className="h-full bg-black" style={{ width: `${(prediction.confidence || 0) * 100}%` }} />
          </div>
          <p className="text-sm font-bold text-gray-500 mt-1">
            CONFIDENCE: {((prediction.confidence || 0) * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  )
}
