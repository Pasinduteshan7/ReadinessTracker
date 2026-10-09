const CATEGORY_ICONS = {
  'AI/ML Engineering':    '🤖',
  'Data Science':         '📊',
  'Software Engineering': '💻',
  'Web Development':      '🌐',
  'Mobile Development':   '📱',
  'Cloud/DevOps':         '☁️',
  'Networking':           '🌍',
  'Cybersecurity':        '🔒',
}

function barColor(pct) {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-primary-500'
  if (pct >= 30) return 'bg-amber-500'
  return 'bg-gray-400'
}

export default function JobFitBars({ jobFit = {} }) {
  const entries = Object.entries(jobFit).slice(0, 8)  // top 8
  const topScore = entries[0]?.[1] || 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Job Category Fit
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Semantic + skill-based match across IT roles
          </p>
        </div>
        <span className="text-xs text-gray-500">
          Top: <span className="font-semibold text-primary-600">{topScore.toFixed(1)}%</span>
        </span>
      </div>

      <div className="space-y-3">
        {entries.map(([cat, pct]) => (
          <div key={cat}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{CATEGORY_ICONS[cat] || '📌'}</span>
                <span className="text-gray-700 font-medium">{cat}</span>
              </div>
              <span className="font-semibold text-gray-900 tabular-nums">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor(pct)} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}