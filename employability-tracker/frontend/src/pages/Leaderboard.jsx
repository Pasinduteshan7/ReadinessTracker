import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const LEVEL_BADGES = {
  'Industry Ready 🟢': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Nearly Ready 🟡':   'bg-amber-100 text-amber-700 border-amber-200',
  'Developing 🟠':     'bg-orange-100 text-orange-700 border-orange-200',
  'Beginner 🔴':       'bg-red-100 text-red-700 border-red-200',
}

const MEDAL = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.getStudents(), api.getCohortStats()])
      .then(([list, s]) => {
        setStudents(list)
        setStats(s)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        Loading cohort...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🏆 Cohort Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          All analyzed students ranked by readiness score
        </p>
      </div>

      {/* Stats row */}
      {stats && stats.total_students > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Students" value={stats.total_students} />
          <StatCard label="Avg Score" value={stats.avg_score.toFixed(1)} />
          <StatCard label="Top Score" value={stats.top_score.toFixed(1)} />
          <StatCard label="Median" value={stats.median_score.toFixed(1)} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Top Category</th>
              <th className="px-6 py-3 text-right">Score</th>
              <th className="px-6 py-3 text-left">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No students yet. Upload a PDF to get started.
                </td>
              </tr>
            ) : (
              students.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => navigate('/')}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-3 font-medium text-gray-700">
                    {MEDAL[i] || `#${s.rank}`}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {s.top_category || '—'}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums text-gray-900">
                    {s.total_score.toFixed(2)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        LEVEL_BADGES[s.level] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {s.level}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="text-xs uppercase text-gray-500 tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  )
}