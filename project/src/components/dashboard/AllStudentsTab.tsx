import { useState, useMemo } from 'react';
import { Search, Users, GraduationCap, Filter } from 'lucide-react';
import { getStudentBatch } from './OverviewTab';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
  batchYear?: number;
  currentGpa?: number;
  githubUsername?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  createdAt?: number;
}

interface AllStudentsTabProps {
  allStudents: Student[];
  currentUser?: Student | null;
}

export function AllStudentsTab({ allStudents, currentUser }: AllStudentsTabProps) {
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL'); // 'ALL' | 'MY_BATCH'

  // Resolve current user's batch
  const currentUserBatch = useMemo(() => {
    if (!currentUser) return null;
    return getStudentBatch(currentUser, allStudents);
  }, [currentUser, allStudents]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      const batchName = getStudentBatch(st, allStudents);
      if (selectedBatch === 'MY_BATCH' && currentUserBatch) {
        if (batchName !== currentUserBatch) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = st.name.toLowerCase().includes(q);
        const matchesEmail = st.email.toLowerCase().includes(q);
        const matchesReg = st.registrationNumber ? st.registrationNumber.toLowerCase().includes(q) : false;
        return matchesName || matchesEmail || matchesReg;
      }
      return true;
    });
  }, [allStudents, selectedBatch, currentUserBatch, search]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Students</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and view registered students across faculty cohorts.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Batch Filter Buttons (Restricted for Students: All Batches & My Batch only) */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        <button
          onClick={() => setSelectedBatch('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedBatch === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          All Batches ({allStudents.length})
        </button>

        {currentUserBatch && (
          <button
            onClick={() => setSelectedBatch('MY_BATCH')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedBatch === 'MY_BATCH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            My Batch ({currentUserBatch})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Registration #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Year / Batch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">GPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const batchBadge = getStudentBatch(student, allStudents);
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{student.registrationNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {batchBadge}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {student.currentGpa != null && student.currentGpa > 0 ? student.currentGpa.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
