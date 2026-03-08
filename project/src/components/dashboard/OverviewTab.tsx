import { Trophy, BookOpen, Target } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  currentYear: string;
  currentGpa: number;
  githubUsername?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  createdAt: number;
}

interface OverviewTabProps {
  currentUser: Student | null;
  allStudents: Student[];
}

export function OverviewTab({ currentUser, allStudents }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{allStudents.length}</p>
            </div>
            <Trophy className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Your GPA</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{currentUser?.currentGpa ?? 'N/A'}</p>
            </div>
            <BookOpen className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Current Year</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{currentUser?.currentYear ?? 'N/A'}</p>
            </div>
            <Target className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
