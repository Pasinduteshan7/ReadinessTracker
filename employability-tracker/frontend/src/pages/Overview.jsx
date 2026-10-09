import { useEffect, useState } from 'react'
import { api } from '../api'
import ReadinessGauge from '../components/ReadinessGauge'
import DimensionRadar from '../components/DimensionRadar'
import PercentileBars from '../components/PercentileBars'
import SkillsSection from '../components/SkillsSection'
import CertificationsSection from '../components/CertificationsSection'
import ExperienceSection from '../components/ExperienceSection'
import JobFitBars from '../components/JobFitBars'
import RecommendationsSection from '../components/RecommendationsSection'

export default function Overview() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [ranking, setRanking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getStudents()
      .then(list => {
        setStudents(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    setError(null)
    Promise.all([
      api.getStudent(selectedId),
      api.getRanking(selectedId).catch(() => null),
    ])
      .then(([d, r]) => {
        setDetail(d)
        setRanking(r)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedId])

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded">
          ⚠️ {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Student Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Realtime employability readiness dashboard
            </p>
          </div>
          <select
            value={selectedId || ''}
            onChange={e => setSelectedId(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {students.length === 0 && <option>No students</option>}
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.total_score.toFixed(1)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="text-gray-500">Loading analysis...</div>
        </div>
      )}

      {!loading && detail && (
        <main className="p-8 max-w-7xl mx-auto">
          {/* Student card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {detail.name}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  {detail.email && <span>✉️ {detail.email}</span>}
                  {detail.linkedin && (
                    <a
                      href={`https://${detail.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                  {detail.github && (
                    <a
                      href={`https://${detail.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      💻 GitHub
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Top Category
                </div>
                <div className="text-lg font-semibold text-primary-600 mt-1">
                  {Object.keys(detail.job_fit || {})[0] || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Gauge + Radar + Percentiles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Readiness Score
              </h3>
              <ReadinessGauge
                score={detail.readiness?.total || 0}
                level={detail.readiness?.level || ''}
              />
              {ranking && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <div className="text-sm text-gray-500">Cohort Rank</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    #{ranking.rank}{' '}
                    <span className="text-sm font-normal text-gray-500">
                      of {ranking.cohort_size}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Top {100 - ranking.overall_percentile}% of cohort
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Skill Dimensions
              </h3>
              <DimensionRadar breakdown={detail.readiness?.breakdown || {}} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Percentile vs Cohort
              </h3>
              {ranking ? (
                <PercentileBars percentiles={ranking.dimension_percentile} />
              ) : (
                <div className="text-sm text-gray-400 py-8 text-center">
                  No ranking data
                </div>
              )}
            </div>
          </div>

          {/* Dimension breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Dimension Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(detail.readiness?.breakdown || {}).map(([k, v]) => {
                const max = detail.readiness?.max_scores?.[k] || 0
                const pct = max ? (v / max) * 100 : 0
                return (
                  <div key={k} className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="text-xs uppercase text-gray-500 tracking-wide">
                      {k}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {v.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">/ {max}</div>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-6">
            <SkillsSection
              skills={detail.profile?.skills || []}
              softSkills={detail.profile?.soft_skills || []}
            />
          </div>

          {/* Certifications Section */}
          <div className="mt-6">
            <CertificationsSection
              certifications={detail.profile?.certifications || []}
            />
          </div>

          {/* Experience + Education */}
          <div className="mt-6">
            <ExperienceSection
              experience={detail.profile?.experience || []}
              education={detail.profile?.education || []}
            />
          </div>
                    {/* Job Fit */}
          <div className="mt-6">
            <JobFitBars jobFit={detail.job_fit || {}} />
          </div>

          {/* AI Recommendations */}
          <div className="mt-6">
            <RecommendationsSection
              recommendations={detail.recommendations || {}}
            />
          </div>
        </main>
      )}
    </div>
  )
}