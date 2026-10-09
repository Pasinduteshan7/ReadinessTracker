import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const LABELS = {
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certs',
  experience: 'Experience',
  education: 'Education',
  extras: 'Extras',
}

const MAX = {
  skills: 30, projects: 20, certifications: 15,
  experience: 15, education: 10, extras: 10,
}

export default function DimensionRadar({ breakdown = {} }) {
  const data = Object.keys(LABELS).map(key => ({
    dim: LABELS[key],
    value: breakdown[key] || 0,
    pct: ((breakdown[key] || 0) / MAX[key]) * 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="dim" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
        <Radar
          name="Score"
          dataKey="pct"
          stroke="#4f46e5"
          fill="#4f46e5"
          fillOpacity={0.45}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}