import { Briefcase } from 'lucide-react';

interface IndustryDemandTabProps {}

const skills = [
  { skill: 'Python', level: 'Excellent' },
  { skill: 'JavaScript/React', level: 'Excellent' },
  { skill: 'Cloud (AWS/GCP)', level: 'Good' },
  { skill: 'Data Analysis', level: 'Good' },
  { skill: 'DevOps', level: 'Average' },
];

export function IndustryDemandTab({}: IndustryDemandTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-slate-900" />
        <h2 className="text-2xl font-bold text-slate-900">Industry Demand Analysis</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <p className="text-sm text-slate-600 mb-2">Skill Match</p>
          <p className="text-lg font-semibold text-slate-900">Not calculated yet</p>
          <p className="text-xs text-slate-600 mt-1">Your skills match current job market demands</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <p className="text-sm text-slate-600 mb-2">Industry Readiness</p>
          <p className="text-lg font-semibold text-slate-900">Not calculated yet</p>
          <p className="text-xs text-slate-600 mt-1">Based on trending technologies</p>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Most Demanded Skills</h3>
        {skills.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">{item.skill}</p>
              <p className="text-xs text-slate-500">Demand: {item.level}</p>
            </div>
            <div className="text-sm font-semibold text-slate-600">Not calculated yet</div>
          </div>
        ))}
      </div>
    </div>
  );
}
