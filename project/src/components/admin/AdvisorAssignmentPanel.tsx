import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { adminApi, advisorApi, studentApi } from '../../lib/backend-api';

interface Advisor {
  id: number;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  specialization?: string;
  assignedCount?: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
  batchYear?: number;
  currentGpa?: number;
  advisor?: Advisor | null;
}

export function AdvisorAssignmentPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [filterAdvisorId, setFilterAdvisorId] = useState<number | 'ALL'>('ALL');

  // Selection states for bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [targetAdvisorId, setTargetAdvisorId] = useState<number | ''>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, advisorsRes, statsRes] = await Promise.all([
        studentApi.getAllStudents(),
        advisorApi.getAllAdvisors(),
        adminApi.getAssignmentStats().catch(() => null)
      ]);

      setStudents(studentsRes || []);

      // If statsRes has advisorWorkloads, merge assigned counts
      if (statsRes?.advisorWorkloads) {
        const workloadMap = new Map<number, number>();
        statsRes.advisorWorkloads.forEach((w: any) => workloadMap.set(w.id, w.assignedCount || 0));
        const merged = (advisorsRes || []).map((adv: Advisor) => ({
          ...adv,
          assignedCount: workloadMap.get(adv.id) || 0
        }));
        setAdvisors(merged);
      } else {
        // Calculate assigned count directly from studentsRes
        const countMap = new Map<number, number>();
        (studentsRes || []).forEach((st: Student) => {
          if (st.advisor?.id) {
            countMap.set(st.advisor.id, (countMap.get(st.advisor.id) || 0) + 1);
          }
        });
        const merged = (advisorsRes || []).map((adv: Advisor) => ({
          ...adv,
          assignedCount: countMap.get(adv.id) || 0
        }));
        setAdvisors(merged);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load advisor & student data');
    } finally {
      setLoading(false);
    }
  };

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q));

      // Year filter
      const matchesYear =
        selectedYear === 'ALL' ||
        (s.currentYear && s.currentYear.toLowerCase().includes(selectedYear.toLowerCase()));

      // Assignment status filter
      const hasAdvisor = Boolean(s.advisor?.id);
      const matchesStatus =
        assignmentFilter === 'ALL' ||
        (assignmentFilter === 'ASSIGNED' && hasAdvisor) ||
        (assignmentFilter === 'UNASSIGNED' && !hasAdvisor);

      // Filter by specific advisor
      const matchesAdvisor =
        filterAdvisorId === 'ALL' || (s.advisor && s.advisor.id === filterAdvisorId);

      return matchesSearch && matchesYear && matchesStatus && matchesAdvisor;
    });
  }, [students, searchQuery, selectedYear, assignmentFilter, filterAdvisorId]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk assignment action
  const handleBulkAssign = async () => {
    if (!targetAdvisorId) {
      setError('Please choose an advisor to assign the selected students to.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student to assign.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      await adminApi.assignAdvisor(Number(targetAdvisorId), selectedStudentIds);
      const targetAdvisor = advisors.find((a) => a.id === Number(targetAdvisorId));
      setSuccessMsg(
        `Successfully assigned ${selectedStudentIds.length} student(s) to ${targetAdvisor?.name || 'Advisor'}.`
      );
      setSelectedStudentIds([]);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Bulk assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk unassign action
  const handleBulkUnassign = async () => {
    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student to unassign.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      await adminApi.unassignAdvisor(selectedStudentIds);
      setSuccessMsg(`Successfully unassigned ${selectedStudentIds.length} student(s).`);
      setSelectedStudentIds([]);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Unassign failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Single inline reassignment handler
  const handleInlineAssign = async (studentId: number, advisorId: number | '') => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      if (advisorId === '') {
        await adminApi.unassignAdvisor([studentId]);
        setSuccessMsg('Advisor removed from student.');
      } else {
        await adminApi.assignAdvisor(Number(advisorId), [studentId]);
        const adv = advisors.find((a) => a.id === Number(advisorId));
        setSuccessMsg(`Student assigned to ${adv?.name || 'Advisor'}.`);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update student assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalAssigned = students.filter((s) => s.advisor?.id).length;
  const totalUnassigned = students.length - totalAssigned;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading advisor allocation management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{students.length}</p>
          <p className="text-xs text-slate-500 mt-1">Across all academic years</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Advisors
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{advisors.length}</p>
          <p className="text-xs text-slate-500 mt-1">Faculty advisors available</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Advisees
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{totalAssigned}</p>
          <p className="text-xs text-slate-500 mt-1">
            {students.length > 0
              ? `${((totalAssigned / students.length) * 100).toFixed(0)}% allocation rate`
              : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unassigned Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${totalUnassigned > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {totalUnassigned}
          </p>
          <p className="text-xs text-slate-500 mt-1">Require academic advisor</p>
        </div>
      </div>

      {/* Advisor Workload Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Advisor Workload Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click an advisor card to view only their assigned students in the directory below.
            </p>
          </div>
          {filterAdvisorId !== 'ALL' && (
            <button
              onClick={() => setFilterAdvisorId('ALL')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
            >
              Clear Advisor Filter
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advisors.map((adv) => {
            const isSelected = filterAdvisorId === adv.id;
            return (
              <div
                key={adv.id}
                onClick={() => setFilterAdvisorId(isSelected ? 'ALL' : adv.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {adv.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{adv.name}</h4>
                      <p className="text-xs text-slate-500">{adv.department || 'Department'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      (adv.assignedCount || 0) > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {adv.assignedCount || 0} Advisees
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[180px]">{adv.email}</span>
                  {adv.specialization && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                      {adv.specialization}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Allocation Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Batch Allocation Control
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Select students from the table below, pick a target advisor, and assign in a single click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[220px]">
              <select
                value={targetAdvisorId}
                onChange={(e) => setTargetAdvisorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose Target Advisor --</option>
                {advisors.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.name} ({adv.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleBulkAssign}
              disabled={actionLoading || !targetAdvisorId || selectedStudentIds.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Assign Selected ({selectedStudentIds.length})
            </button>

            <button
              onClick={handleBulkUnassign}
              disabled={actionLoading || selectedStudentIds.length === 0}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 border border-slate-700"
            >
              <UserX className="w-4 h-4 text-red-400" />
              Unassign Selected
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Student Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, registration no, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value as any)}
                className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">All Students</option>
                <option value="ASSIGNED">Assigned Only</option>
                <option value="UNASSIGNED">Unassigned Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-4 w-12 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {filteredStudents.length > 0 &&
                    selectedStudentIds.length === filteredStudents.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Student</th>
                <th className="p-4">Reg Number</th>
                <th className="p-4">Year / Batch</th>
                <th className="p-4">GPA</th>
                <th className="p-4">Current Advisor</th>
                <th className="p-4 text-right">Quick Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  const isAssigned = Boolean(st.advisor?.id);

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStudent(st.id)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {st.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{st.name}</p>
                            <p className="text-slate-500 text-[11px]">{st.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-slate-700 text-xs">
                          {st.registrationNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                          <GraduationCap className="w-3 h-3" />
                          {st.currentYear || '1st Year'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">
                          {st.currentGpa ? st.currentGpa.toFixed(2) : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        {isAssigned ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {st.advisor?.name}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Unassigned
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={st.advisor?.id || ''}
                          disabled={actionLoading}
                          onChange={(e) =>
                            handleInlineAssign(
                              st.id,
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="">-- No Advisor --</option>
                          {advisors.map((adv) => (
                            <option key={adv.id} value={adv.id}>
                              {adv.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredStudents.length} of {students.length} student(s)
          </span>
          {selectedStudentIds.length > 0 && (
            <span className="font-semibold text-indigo-700">
              {selectedStudentIds.length} student(s) currently selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
