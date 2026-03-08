import { BookOpen } from 'lucide-react';

interface ModulesTabProps {}

const modules = [
  { name: 'Data Structures', progress: 90, status: 'Completed' },
  { name: 'Web Development', progress: 75, status: 'In Progress' },
  { name: 'Machine Learning', progress: 60, status: 'In Progress' },
  { name: 'Database Design', progress: 85, status: 'Completed' },
  { name: 'Cloud Computing', progress: 45, status: 'In Progress' },
];

export function ModulesTab({}: ModulesTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-slate-900" />
        <h2 className="text-2xl font-bold text-slate-900">Module Progress</h2>
      </div>
      <div className="space-y-4">
        {modules.map((module, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">{module.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                module.status === 'Completed' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {module.status}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${module.progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{module.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}
