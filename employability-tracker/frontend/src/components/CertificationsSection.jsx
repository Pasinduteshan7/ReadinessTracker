const KNOWN_TIERS = {
  'aws certified solutions architect': 4,
  'google cloud professional': 4,
  'cissp': 4,
  'ceh': 4,
  'pmp': 4,
  'tensorflow developer certificate': 3,
  'aws certified developer': 3,
  'cisco ccna': 3,
  'meta frontend developer': 3,
  'meta backend developer': 3,
  'google data analytics': 3,
  'comptia security+': 3,
  'deeplearning.ai specialization': 3,
  'aws certified cloud practitioner': 2,
  'google cloud associate': 2,
  'coursera python': 2,
  'python for everybody': 2,
  'agile project management': 2,
  'hugging face agents course': 2,
  'sololearn python developer': 1,
  'sololearn python': 1,
  'ai/ml engineer stage 1': 1,
  'ai/ml engineer - stage 1': 1,
}

const TIER_CONFIG = {
  4: { label: 'Expert',       bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  3: { label: 'Professional', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  2: { label: 'Associate',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  1: { label: 'Foundation',   bg: 'bg-gray-100',   text: 'text-gray-600',    border: 'border-gray-200' },
}

function getTier(certName) {
  const key = certName.toLowerCase().trim()
  if (KNOWN_TIERS[key]) return KNOWN_TIERS[key]
  for (const [known, tier] of Object.entries(KNOWN_TIERS)) {
    if (key.includes(known) || known.includes(key)) return tier
  }
  return 1
}

export default function CertificationsSection({ certifications = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Certifications
        </h3>
        <span className="text-xs text-gray-500">{certifications.length} certified</span>
      </div>

      {certifications.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          No certifications detected
        </div>
      ) : (
        <ul className="space-y-3">
          {certifications.map((cert, i) => {
            const tier = getTier(cert)
            const cfg = TIER_CONFIG[tier]
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                    🏆
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {cert}
                    </div>
                    <div className="text-xs text-gray-500">Tier {tier}</div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
                >
                  {cfg.label}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}