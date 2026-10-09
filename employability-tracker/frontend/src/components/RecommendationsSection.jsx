export default function RecommendationsSection({ recommendations = {} }) {
  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          AI Recommendations
        </h3>
        <div className="text-sm text-gray-400 py-8 text-center">
          No recommendations available
        </div>
      </div>
    )
  }

  if (recommendations.error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          AI Recommendations
        </h3>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          ⚠️ {recommendations.error}
        </div>
      </div>
    )
  }

  const {
    readiness_for_role = 0,
    strengths = [],
    skill_gaps = [],
    recommended_certifications = [],
    recommended_projects = [],
    learning_path = [],
    estimated_time_to_ready_months = 0,
    _source = '',
  } = recommendations

  return (
    <div className="space-y-6">
      {/* Header with readiness */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
              AI Career Coach
            </div>
            <h3 className="text-2xl font-bold">
              Target Role Readiness
            </h3>
            <p className="text-sm opacity-90 mt-1">
              Estimated time to ready:{' '}
              <span className="font-semibold">{estimated_time_to_ready_months} months</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold tabular-nums">
              {readiness_for_role}
            </div>
            <div className="text-xs opacity-80 uppercase tracking-wider">
              / 100 ready
            </div>
          </div>
        </div>
        {_source && (
          <div className="mt-3 text-xs opacity-70">
            Source: {_source}
          </div>
        )}
      </div>

      {/* Strengths + Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
            Strengths
          </h4>
          <ul className="space-y-2.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill Gaps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs">!</span>
            Skill Gaps
          </h4>
          <ul className="space-y-2.5">
            {skill_gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">●</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Certifications */}
      {recommended_certifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            🎓 Recommended Certifications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended_certifications.map((cert, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-primary-200 transition"
              >
                <div className="font-medium text-gray-900 text-sm">
                  {cert.name}
                </div>
                <div className="text-xs text-primary-600 mt-1">
                  {cert.provider}
                </div>
                <div className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {cert.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Projects */}
      {recommended_projects.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            🚀 Recommended Projects
          </h4>
          <div className="space-y-4">
            {recommended_projects.map((proj, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-gray-100 hover:border-primary-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-gray-900">
                    {proj.title}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Project {i + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(proj.tech || []).map((t, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600 mt-3 leading-relaxed">
                  {proj.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {learning_path.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-5">
            🗺️ Learning Path
          </h4>
          <ol className="relative space-y-5">
            {learning_path.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {step.step || i + 1}
                  </div>
                  {i < learning_path.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-sm text-gray-800 leading-relaxed">
                    {step.action}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    ⏱ {step.duration}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}