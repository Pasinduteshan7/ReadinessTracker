const LABELS = {
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  experience: 'Experience',
  education: 'Education',
  extras: 'Extras',
}

export default function PercentileBars({ percentiles = {} }) {
  return (
    <div className="space-y-3">
      {Object.keys(LABELS).map(key => {
        const pct = percentiles[key] || 0
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{LABELS[key]}</span>
              <span className="font-medium text-gray-900">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}