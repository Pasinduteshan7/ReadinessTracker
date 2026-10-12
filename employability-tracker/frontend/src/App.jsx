import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Overview from './pages/Overview'
import Leaderboard from './pages/Leaderboard'
import Upload from './pages/Upload'

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Router>
  )
}