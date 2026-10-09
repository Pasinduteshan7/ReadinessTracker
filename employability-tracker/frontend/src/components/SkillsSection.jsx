const DEMAND_COLORS = {
  high:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  low:    { bg: 'bg-gray-100',   text: 'text-gray-600',    border: 'border-gray-200' },
}

const HIGH_DEMAND = [
  'python', 'javascript', 'react', 'tensorflow', 'pytorch', 'sql',
  'docker', 'aws', 'git', 'node.js', 'machine learning', 'llm',
  'typescript', 'kubernetes', 'rest api',
]

const MEDIUM_DEMAND = [
  'java', 'c++', 'flask', 'django', 'mysql', 'mongodb', 'nlp',
  'scikit-learn', 'github', 'ci/cd', 'linux',
]

function demandLevel(skill) {
  const s = skill.toLowerCase()
  if (HIGH_DEMAND.includes(s)) return 'high'
  if (MEDIUM_DEMAND.includes(s)) return 'medium'
  return 'low'
}

export default function SkillsSection({ skills = [], softSkills = [] }) {
  const techSkills = skills.filter(s => !softSkills.includes(s))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Technical Skills
        </h3>
        <span className="text-xs text-gray-500">{techSkills.length} skills</span>
      </div>

      {techSkills.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          No technical skills detected
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {techSkills.map(skill => {
            const level = demandLevel(skill)
            const c = DEMAND_COLORS[level]
            return (
              <span
                key={skill}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
              >
                {skill}
                {level === 'high' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </span>
            )
          })}
        </div>
      )}

      {softSkills.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Soft Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {softSkills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}