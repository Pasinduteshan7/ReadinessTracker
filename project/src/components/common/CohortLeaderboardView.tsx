import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Search,
  Filter,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
  X,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import {
  overallReadinessApi,
  studentApi,
  UnifiedReadinessStudent,
  CohortReadinessData
} from '../../lib/backend-api';
import { getStudentBatch } from '../dashboard/OverviewTab';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
  batchYear?: number;
  currentGpa?: number;
  advisor?: { id: number; name: string } | null;
}

interface CohortLeaderboardViewProps {
  role: 'admin' | 'advisor';
  advisorId?: number;
  title?: string;
  subtitle?: string;
  onGradeStudent?: (student: Student) => void;
}

export function CohortLeaderboardView({
  role,
  advisorId,
  title = 'Cohort Leaderboard & Year-Wise Readiness Rankings',
  subtitle = 'Evaluate student readiness, compare across academic years, and drill down into batch performance.',
  onGradeStudent
}: CohortLeaderboardViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [cohortData, setCohortData] = useState<CohortReadinessData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL'); // 'ALL' or specific batch like '3rd Year'
  const [compareStudentA, setCompareStudentA] = useState<UnifiedReadinessStudent | null>(null);
  const [compareStudentB, setCompareStudentB] = useState<UnifiedReadinessStudent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsList, cohortRes] = await Promise.all([
        studentApi.getAllStudents().catch(() => []),
        overallReadinessApi.getCohortReadiness().catch(() => null)
      ]);
      setAllStudents(studentsList || []);
      setCohortData(cohortRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load cohort data');
    } finally {
      setLoading(false);
    }
  };

  // Enrich ranked students with normalized currentYear & batchYear from allStudents
  const rankedCohort = useMemo<UnifiedReadinessStudent[]>(() => {
    if (!cohortData?.rankedStudents) return [];
    const enriched = cohortData.rankedStudents.map((st) => {
      let yr = st.currentYear;
      let by = st.batchYear;
      let advId: number | undefined = undefined;
      const found = allStudents.find(
        (a) => a.id === st.studentId || (st.email && a.email && a.email.toLowerCase().trim() === st.email.toLowerCase().trim())
      );
      if (found) {
        if (!yr) yr = found.currentYear;
        if (!by) by = found.batchYear;
        advId = found.advisor?.id;
      }
      return {
        ...st,
        currentYear: yr,
        batchYear: by,
        assignedAdvisorId: advId
      };
    });

    if (role === 'advisor' && advisorId) {
      return enriched.filter((st: any) => st.assignedAdvisorId === advisorId);
    }
    return enriched;
  }, [cohortData, allStudents, role, advisorId]);


  // Discover all unique academic batches/years present in the data
  const availableBatches = useMemo(() => {
    const counts = new Map<string, number>();
    rankedCohort.forEach((s) => {
      const b = getStudentBatch(s, allStudents);
      counts.set(b, (counts.get(b) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.name.localeCompare(a.name));
  }, [rankedCohort, allStudents]);

  // Filter & Re-rank per Selected Batch
  const { filteredLeaderboard, activeBatchStats } = useMemo(() => {
    const targetBatch = selectedBatch !== 'ALL' ? selectedBatch : null;

    // Filter pool by target batch if selected
    const pool = targetBatch
      ? rankedCohort.filter((s) => getStudentBatch(s, allStudents) === targetBatch)
      : rankedCohort;

    const inBatchTotal = pool.length;
    const inBatchSum = pool.reduce((acc, s) => acc + s.overallScore, 0);
    const inBatchAvg = inBatchTotal > 0 ? Math.round((inBatchSum / inBatchTotal) * 10) / 10 : 0;
    const topScore = pool.length > 0 ? Math.max(...pool.map((s) => s.overallScore)) : 0;

    const readyCount = pool.filter((s) => s.readinessTier === 'Industry Ready').length;
    const nearlyCount = pool.filter((s) => s.readinessTier === 'Nearly Ready').length;
    const developingCount = pool.filter((s) => s.readinessTier === 'Developing' || s.readinessTier === 'Foundational').length;

    // Re-rank within this batch
    const reRankedPool = pool.map((st, index) => {
      const batchRank = index + 1;
      const batchPercentile = inBatchTotal > 1
        ? Math.round(((inBatchTotal - batchRank) / (inBatchTotal - 1)) * 1000) / 10
        : 100;

      return {
        ...st,
        batchRank,
        batchPercentile,
        cohortRank: st.rank,
        batchName: getStudentBatch(st, allStudents)
      };
    });

    // Apply search filter
    let displayList = reRankedPool;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayList = displayList.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q))
      );
    }

    return {
      filteredLeaderboard: displayList,
      activeBatchStats: {
        targetBatch,
        total: inBatchTotal,
        average: inBatchAvg,
        topScore,
        readyCount,
        nearlyCount,
        developingCount
      }
    };
  }, [rankedCohort, allStudents, selectedBatch, searchQuery]);

  // Handle open comparison modal
  const handleOpenCompare = (student: UnifiedReadinessStudent) => {
    setCompareStudentA(student);
    // Automatically pick the top student of the batch or the #1 ranked student as student B if different
    const candidateB = filteredLeaderboard.find((s) => s.studentId !== student.studentId) || rankedCohort[0] || null;
    setCompareStudentB(candidateB);
  };

  // Dual Radar Comparison Data
  const comparisonRadarData = useMemo(() => {
    if (!compareStudentA || !compareStudentB) return [];
    return [
      {
        pillar: 'Academic Marks (25%)',
        [compareStudentA.studentName]: compareStudentA.academicScore ?? 0,
        [compareStudentB.studentName]: compareStudentB.academicScore ?? 0,
        fullMark: 100
      },
      {
        pillar: 'GitHub Quality (30%)',
        [compareStudentA.studentName]: compareStudentA.githubScore ?? 0,
        [compareStudentB.studentName]: compareStudentB.githubScore ?? 0,
        fullMark: 100
      },
      {
        pillar: 'Industry Alignment (20%)',
        [compareStudentA.studentName]: compareStudentA.industryScore ?? 0,
        [compareStudentB.studentName]: compareStudentB.industryScore ?? 0,
        fullMark: 100
      },
      {
        pillar: 'Profile & Resume (25%)',
        [compareStudentA.studentName]: compareStudentA.profileScore ?? 0,
        [compareStudentB.studentName]: compareStudentB.profileScore ?? 0,
        fullMark: 100
      }
    ];
  }, [compareStudentA, compareStudentB]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-600 text-sm font-medium">Loading cohort readiness analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or registration..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              title="Refresh Leaderboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Year-Wise / Batch Filter Pill Bar (ADMIN & ADVISOR FULL VISIBILITY) */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Academic Year:
            </span>

            {/* All Batches Button */}
            <button
              onClick={() => setSelectedBatch('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedBatch === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Batches ({rankedCohort.length})
            </button>

            {/* Discovered Yearwise / Batch Tabs */}
            {availableBatches.map((batch) => {
              const isSelected = selectedBatch === batch.name;
              return (
                <button
                  key={batch.name}
                  onClick={() => setSelectedBatch(batch.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-bold ring-2 ring-indigo-500/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  {batch.name} ({batch.count})
                </button>
              );
            })}
          </div>

          {/* Batch Metrics Summary Pill */}
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-indigo-50/90 border border-indigo-200/70 px-3 py-1 rounded-lg">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                {activeBatchStats.targetBatch || 'All Batches'}
              </span>
              <span className="text-indigo-300">•</span>
              <span className="text-slate-600 font-medium">{activeBatchStats.total} Students</span>
              <span className="text-indigo-300">•</span>
              <span className="text-slate-600">
                Avg: <strong className="text-indigo-950 font-bold">{activeBatchStats.average}%</strong>
              </span>
              <span className="text-indigo-300">•</span>
              <span className="text-slate-600">
                Top: <strong className="text-emerald-700 font-bold">{activeBatchStats.topScore}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-20 text-center">
                  {selectedBatch !== 'ALL' ? (
                    <div>
                      <span>Batch Rank</span>
                      <span className="block text-[9px] text-slate-400 font-normal lowercase">(cohort rank)</span>
                    </div>
                  ) : (
                    <span>Rank</span>
                  )}
                </th>
                <th className="py-3 px-4">Student & Academic Year</th>
                <th className="py-3 px-4 text-center">Overall Score</th>
                <th className="py-3 px-4 text-center">Academic (25%)</th>
                <th className="py-3 px-4 text-center">GitHub (30%)</th>
                <th className="py-3 px-4 text-center">Industry (20%)</th>
                <th className="py-3 px-4 text-center">Profile (25%)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      {role === 'advisor' ? 'No Advisees in this Selection' : 'No students found'}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {role === 'advisor'
                        ? 'You only see status and ranks for students assigned to you. Contact the administrator to allocate advisees.'
                        : searchQuery
                        ? `No students matched "${searchQuery}" in ${activeBatchStats.targetBatch || 'the cohort'}.`
                        : 'No students found in this academic batch.'}
                    </p>
                  </td>
                </tr>

              ) : (
                filteredLeaderboard.map((student) => {
                  const displayRank = selectedBatch !== 'ALL' ? student.batchRank : student.rank;

                  return (
                    <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Rank Medal / Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          {displayRank === 1 ? (
                            <span className="text-xl" title="1st Place">🥇 1</span>
                          ) : displayRank === 2 ? (
                            <span className="text-xl" title="2nd Place">🥈 2</span>
                          ) : displayRank === 3 ? (
                            <span className="text-xl" title="3rd Place">🥉 3</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-600">#{displayRank}</span>
                          )}

                          {selectedBatch !== 'ALL' && (
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5" title="Overall Faculty Cohort Rank">
                              Cohort #{student.cohortRank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Student Name, Email & Year Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                            {student.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">{student.studentName}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {student.batchName}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              {student.registrationNumber || student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-sm text-slate-900">
                            {student.overallScore.toFixed(1)}%
                          </span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.overallScore >= 80
                                  ? 'bg-emerald-500'
                                  : student.overallScore >= 60
                                  ? 'bg-indigo-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${student.overallScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Academic */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {student.academicScore != null ? `${student.academicScore.toFixed(1)}%` : '—'}
                      </td>

                      {/* GitHub */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {student.githubScore != null ? `${student.githubScore.toFixed(1)}%` : '—'}
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {student.industryScore != null ? `${student.industryScore.toFixed(1)}%` : '—'}
                      </td>

                      {/* Profile */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {student.profileScore != null ? `${student.profileScore.toFixed(1)}%` : '—'}
                      </td>

                      {/* Readiness Tier */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            student.readinessTier === 'Industry Ready'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : student.readinessTier === 'Nearly Ready'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {student.readinessTier}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Advisor Grade & Predict Action */}
                          {role === 'advisor' && onGradeStudent && (
                            <button
                              type="button"
                              onClick={() => {
                                const matched = allStudents.find((a) => a.id === student.studentId) || {
                                  id: student.studentId,
                                  name: student.studentName,
                                  email: student.email,
                                  registrationNumber: student.registrationNumber || '',
                                  currentYear: student.currentYear || '3rd Year',
                                  currentGpa: student.currentGpa || 0
                                };
                                onGradeStudent(matched);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Grade</span>
                            </button>
                          )}

                          {/* Compare Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenCompare(student)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 transition-colors"
                          >
                            Compare
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Head-to-Head Comparison Modal for Admin / Advisor */}
      {compareStudentA && compareStudentB && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-600" />
                  Head-to-Head Student Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparative 4-pillar analysis between two cohort students.
                </p>
              </div>
              <button
                onClick={() => {
                  setCompareStudentA(null);
                  setCompareStudentB(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Selectors */}
            <div className="grid grid-cols-2 gap-4 my-6">
              {/* Student A Selector */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Student A ({compareStudentA.batchName || 'Cohort'})
                </span>
                <select
                  value={compareStudentA.studentId}
                  onChange={(e) => {
                    const found = rankedCohort.find((s) => s.studentId === Number(e.target.value));
                    if (found) setCompareStudentA(found);
                  }}
                  className="w-full text-xs font-bold bg-white text-slate-900 border border-indigo-200 rounded-lg p-2 focus:outline-none"
                >
                  {rankedCohort.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.overallScore.toFixed(1)}%)
                    </option>
                  ))}
                </select>
                <div className="text-center mt-3">
                  <span className="text-2xl font-black text-indigo-950 block">{compareStudentA.overallScore.toFixed(1)}%</span>
                  <span className="text-xs text-indigo-700 font-semibold">Rank #{compareStudentA.rank} in Cohort</span>
                </div>
              </div>

              {/* Student B Selector */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Student B ({compareStudentB.batchName || 'Cohort'})
                </span>
                <select
                  value={compareStudentB.studentId}
                  onChange={(e) => {
                    const found = rankedCohort.find((s) => s.studentId === Number(e.target.value));
                    if (found) setCompareStudentB(found);
                  }}
                  className="w-full text-xs font-bold bg-white text-slate-900 border border-amber-200 rounded-lg p-2 focus:outline-none"
                >
                  {rankedCohort.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.overallScore.toFixed(1)}%)
                    </option>
                  ))}
                </select>
                <div className="text-center mt-3">
                  <span className="text-2xl font-black text-amber-950 block">{compareStudentB.overallScore.toFixed(1)}%</span>
                  <span className="text-xs text-amber-700 font-semibold">Rank #{compareStudentB.rank} in Cohort</span>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={comparisonRadarData} outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name={compareStudentA.studentName}
                    dataKey={compareStudentA.studentName}
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name={compareStudentB.studentName}
                    dataKey={compareStudentB.studentName}
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
              {[
                { name: 'Academic Marks (25%)', a: compareStudentA.academicScore ?? 0, b: compareStudentB.academicScore ?? 0 },
                { name: 'GitHub Quality (30%)', a: compareStudentA.githubScore ?? 0, b: compareStudentB.githubScore ?? 0 },
                { name: 'Industry Demand (20%)', a: compareStudentA.industryScore ?? 0, b: compareStudentB.industryScore ?? 0 },
                { name: 'Profile & Resume (25%)', a: compareStudentA.profileScore ?? 0, b: compareStudentB.profileScore ?? 0 },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-indigo-700">{item.a.toFixed(1)}%</span>
                    <span className="text-slate-400 font-bold">vs</span>
                    <span className="font-bold text-amber-600">{item.b.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
