import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'
import Settings from './pages/Settings'
import MLInsights from './pages/MLInsights'

const USER = { id: 1, username: 'dev' }

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard user={USER} />} />
        <Route path="/session/:id" element={<Session user={USER} />} />
        <Route path="/insights" element={<MLInsights user={USER} />} />
        <Route path="/settings" element={<Settings user={USER} />} />
      </Routes>
    </Router>
  )
}

export default App
