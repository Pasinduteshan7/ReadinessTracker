import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
            ET
          </div>
          <div>
            <div className="font-bold text-gray-900 leading-tight">
              Employability Tracker
            </div>
            <div className="text-[11px] text-gray-500">
              Readiness Dashboard
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            📊 Overview
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            🏆 Leaderboard
          </NavLink>
          <NavLink to="/upload" className={linkClass}>
            ⬆️ Upload PDF
          </NavLink>
        </div>
      </div>
    </nav>
  )
}