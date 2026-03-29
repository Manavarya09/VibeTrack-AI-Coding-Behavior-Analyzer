import { useState } from 'react'
import { Sparkles } from 'lucide-react'

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
      case 'Deep Flow': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'High Dependency': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        Session Outcome Predictor
      </h2>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Expected Prompts</label>
          <input
            type="number"
            value={prompts}
            onChange={(e) => setPrompts(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Break Time (minutes)</label>
          <input
            type="number"
            value={breaks}
            onChange={(e) => setBreaks(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Predicting...' : 'Predict Outcome'}
      </button>

      {prediction && (
        <div className={`mt-4 p-4 rounded-lg border ${getClassificationColor(prediction.predicted_classification)}`}>
          <p className="font-semibold">Predicted: {prediction.predicted_classification}</p>
          <p className="text-sm mt-1">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  )
}
