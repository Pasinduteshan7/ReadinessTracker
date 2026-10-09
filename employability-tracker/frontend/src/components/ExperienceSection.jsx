function formatDuration(months) {
  if (!months) return '—'
  if (months < 12) return `${months} mo`
  const y = Math.floor(months / 12)
  const m = months % 12
  return m ? `${y}y ${m}m` : `${y}y`
}

export default function ExperienceSection({ experience = [], education = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Experience
          </h3>
          <span className="text-xs text-gray-500">{experience.length} roles</span>
        </div>

        {experience.length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            No experience detected
          </div>
        ) : (
          <ol className="relative border-l border-gray-200 ml-2 space-y-5">
            {experience.map((exp, i) => (
              <li key={i} className="pl-5 relative">
                <span
                  className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                    exp.is_it ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
                <div className="text-sm font-medium text-gray-900">
                  {exp.role || 'Role'}
                </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <span>{formatDuration(exp.duration_months)}</span>
                  {exp.is_it ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                      IT
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                      Non-IT
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Education
          </h3>
          <span className="text-xs text-gray-500">{education.length} entries</span>
        </div>

        {education.length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            No education detected
          </div>
        ) : (
          <ul className="space-y-3">
            {education.map((edu, i) => (
              <li key={i} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                    🎓
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {edu.institution || 'Institution'}
                    </div>
                    {(edu.degree || edu.field) && (
                      <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {edu.degree || edu.field}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}