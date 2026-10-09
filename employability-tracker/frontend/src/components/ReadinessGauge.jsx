import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

function getColor(score) {
  if (score >= 80) return '#10b981'   // emerald
  if (score >= 60) return '#f59e0b'   // amber
  if (score >= 40) return '#f97316'   // orange
  return '#ef4444'                     // red
}

export default function ReadinessGauge({ score = 0, level = '' }) {
  const data = [{ name: 'score', value: score, fill: getColor(score) }]

  return (
    <div className="relative w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="70%" outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={220} endAngle={-40}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e5e7eb' }} />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-5xl font-bold" style={{ color: getColor(score) }}>
          {score.toFixed(1)}
        </div>
        <div className="text-sm text-gray-500 mt-1">/ 100</div>
        <div className="text-xs text-gray-700 mt-2 font-medium">{level}</div>
      </div>
    </div>
  )
}