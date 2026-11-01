import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Filter,
  GraduationCap,
  UserX,
  Mail,
  ExternalLink
} from 'lucide-react';
import { studentApi, adminApi } from '../../lib/backend-api';

interface Advisor {
  id: number;
  name: string;
  email?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
  batchYear?: number;
  currentGpa?: number;
  githubUsername?: string;
  advisor?: Advisor | null;
  createdAt?: number;
}

interface AdminStudentManagementPanelProps {
  onStudentDeleted?: () => void;
}

export function AdminStudentManagementPanel({ onStudentDeleted }: AdminStudentManagementPanelProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');

  // Deletion modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentApi.getAllStudents();
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const yr = s.currentYear || 'Unassigned';
      if (batchFilter !== 'ALL' && yr !== batchFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesReg = s.registrationNumber ? s.registrationNumber.toLowerCase().includes(q) : false;
        const matchesGithub = s.githubUsername ? s.githubUsername.toLowerCase().includes(q) : false;
        return matchesName || matchesEmail || matchesReg || matchesGithub;
      }
      return true;
    });
  }, [students, search, batchFilter]);

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await adminApi.deleteStudent(studentToDelete.id);

      // Optimistically remove from state
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setSuccessMessage(`Student account "${studentToDelete.name}" (${studentToDelete.email}) was permanently deleted.`);
      setStudentToDelete(null);

      if (onStudentDeleted) {
        onStudentDeleted();
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete student account');
    } finally {
      setIsDeleting(false);
    }
  };

  const batches = ['ALL', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadStudents} className="text-xs underline hover:text-red-800 font-bold ml-3">
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">Registered Student Directory</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {students.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage student accounts, inspect registration details, and permanently remove accounts when necessary.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-slate-50/50"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadStudents}
              disabled={loading}
              title="Refresh student list"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Batch Filter Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Batch:
          </span>
          {batches.map((batch) => {
            const count = batch === 'ALL'
              ? students.length
              : students.filter((s) => s.currentYear === batch).length;
            return (
              <button
                key={batch}
                onClick={() => setBatchFilter(batch)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  batchFilter === batch
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {batch === 'ALL' ? 'All Cohorts' : batch}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  batchFilter === batch ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Student Details</th>
                <th className="py-3 px-4">Registration #</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4 text-center">GPA</th>
                <th className="py-3 px-4">Assigned Advisor</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserX className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No students found matching your search</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 hover:text-red-600 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {student.email}
                            </p>
                            {student.githubUsername && (
                              <a
                                href={`https://github.com/${student.githubUsername}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>@{student.githubUsername}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Registration Number */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {student.registrationNumber ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {student.registrationNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Academic Year */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <GraduationCap className="w-3 h-3" />
                          {student.currentYear || 'Unassigned'}
                        </span>
                      </td>

                      {/* GPA */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                        {student.currentGpa != null && student.currentGpa > 0 ? (
                          <span className={student.currentGpa >= 3.5 ? 'text-emerald-600' : 'text-slate-800'}>
                            {student.currentGpa.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Advisor */}
                      <td className="py-3.5 px-4">
                        {student.advisor ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                            <span className="font-semibold text-slate-800">{student.advisor.name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all inline-flex items-center gap-1.5"
                          title="Delete this student account"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Double Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Student Account</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete this account? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 text-sm">{studentToDelete.name}</p>
              <p className="text-slate-600 font-mono">{studentToDelete.email}</p>
              {studentToDelete.registrationNumber && (
                <p className="text-slate-500">
                  Reg No: <span className="font-mono font-semibold text-slate-800">{studentToDelete.registrationNumber}</span>
                </p>
              )}
              {studentToDelete.currentYear && (
                <p className="text-slate-500">
                  Cohort: <span className="font-semibold text-slate-800">{studentToDelete.currentYear}</span>
                </p>
              )}
            </div>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-normal">
              ⚠️ All associated GitHub analyses, academic module grades, resume evaluations, and unified readiness scores will also be permanently deleted.
            </div>

            {deleteError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setStudentToDelete(null);
                  setDeleteError('');
                }}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
