import { useState, useMemo } from 'react';
import {
  Trophy,
  BookOpen,
  Target,
  Github,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Search,
  X,
  Zap,
  FileText,
  RefreshCw,
  GraduationCap,
  Users,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { type AnalysisResult } from '../AnalysisResults';
import { type CohortReadinessData, type UnifiedReadinessStudent } from '../../lib/backend-api';

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
  latestAiOverallScore?: number;
  latestAiCodeQualityScore?: number;
  latestAiArchitectureScore?: number;
  latestAiDocumentationScore?: number;
  latestAiTestingScore?: number;
  latestAiStatus?: string;
  aiAnalysisResultJson?: string;
  skills?: string;
}

interface OverviewTabProps {
  currentUser: Student | null;
  allStudents: Student[];
  analysisResult?: AnalysisResult | null;
  moduleMarks?: any;
  industryDemand?: any;
  profileAnalysis?: any;
  cohortReadiness?: CohortReadinessData | null;
  onNavigateTab?: (tab: 'overview' | 'profile' | 'students' | 'github' | 'social' | 'modules' | 'industry') => void;
  onRefreshCohort?: () => void;
}

// Helper function to extract student batch/year category
export const getStudentBatch = (
  student: { 
    id?: number;
    studentId?: number;
    registrationNumber?: string; 
    email?: string; 
    batchYear?: number; 
    currentYear?: string;
  },
  allStudentsList?: Array<{ id: number; currentYear?: string; batchYear?: number; email?: string; registrationNumber?: string }>
): string => {
  // 1. Resolve currentYear and batchYear from student or fallback to allStudents lookup
  let rawYear = student.currentYear;
  let bYear = student.batchYear;

  if (allStudentsList && (!rawYear || !bYear)) {
    const sId = student.studentId ?? student.id;
    const found = allStudentsList.find((a) => 
      (sId != null && a.id === sId) ||
      (student.email && a.email && a.email.toLowerCase().trim() === student.email.toLowerCase().trim()) ||
      (student.registrationNumber && a.registrationNumber && a.registrationNumber.trim() === student.registrationNumber.trim())
    );
    if (found) {
      if (!rawYear && found.currentYear) rawYear = found.currentYear;
      if (!bYear && found.batchYear) bYear = found.batchYear;
    }
  }

  // 2. If currentYear is present, normalize it to standard academic batch years (1st Year, 2nd Year, 3rd Year, 4th Year)
  if (rawYear && String(rawYear).trim()) {
    const trimmed = String(rawYear).trim().toLowerCase();
    if (trimmed === '1' || trimmed.startsWith('1st') || trimmed.includes('first') || trimmed === 'year 1') {
      return '1st Year';
    }
    if (trimmed === '2' || trimmed.startsWith('2nd') || trimmed.includes('second') || trimmed === 'year 2') {
      return '2nd Year';
    }
    if (trimmed === '3' || trimmed.startsWith('3rd') || trimmed.includes('third') || trimmed === 'year 3') {
      return '3rd Year';
    }
    if (trimmed === '4' || trimmed.startsWith('4th') || trimmed.includes('fourth') || trimmed.includes('final') || trimmed === 'year 4') {
      return '4th Year';
    }
    if (trimmed.includes('year')) {
      return String(rawYear).trim();
    }
    return `${String(rawYear).trim()} Year`;
  }

  // 3. Check explicit batchYear from DB (e.g. 2024, 2022)
  if (bYear) return `Batch ${bYear}`;

  // 4. Fallback to registration number extraction (only if no year is known)
  if (student.registrationNumber) {
    const match = student.registrationNumber.match(/\b(20\d{2})\b/);
    if (match) return `Batch ${match[1]}`;
  }

  // 5. Fallback to email extraction
  if (student.email) {
    const emailMatch = student.email.match(/eg(\d{2})/i);
    if (emailMatch) return `Batch 20${emailMatch[1]}`;
  }

  return 'General Cohort';
};

// Weights defined for the 4 pillars
const WEIGHT_ACADEMIC = 0.25;
const WEIGHT_GITHUB = 0.30;
const WEIGHT_INDUSTRY = 0.20;
const WEIGHT_PROFILE = 0.25;

export function OverviewTab({
  currentUser,
  allStudents,
  analysisResult,
  moduleMarks,
  industryDemand,
  profileAnalysis,
  cohortReadiness,
  onNavigateTab,
  onRefreshCohort
}: OverviewTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL'); // 'ALL' | 'MY_BATCH' | specific batch string like 'Batch 2022'
  const [selectedPeerForCompare, setSelectedPeerForCompare] = useState<UnifiedReadinessStudent | null>(null);
  const [activeChartView, setActiveChartView] = useState<'radar' | 'bar'>('radar');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Resolve Current Student's GitHub Score
  const githubScore = useMemo<number | null>(() => {
    if (analysisResult?.overallScore != null) return analysisResult.overallScore;
    if (currentUser?.latestAiOverallScore != null) return currentUser.latestAiOverallScore;
    return null;
  }, [analysisResult, currentUser]);

  const codeQuality = analysisResult?.codeQualityScore ?? currentUser?.latestAiCodeQualityScore ?? 0;
  const architecture = analysisResult?.architectureScore ?? currentUser?.latestAiArchitectureScore ?? 0;
  const testing = analysisResult?.testingScore ?? currentUser?.latestAiTestingScore ?? 0;
  const documentation = analysisResult?.documentationScore ?? currentUser?.latestAiDocumentationScore ?? 0;

  // 2. Resolve Academic Module Marks & Curriculum Score
  const { avgCurriculumMark, specializationLabel, primaryConfidence } = useMemo(() => {
    let markCount = 0;
    let markTotal = 0;
    if (moduleMarks) {
      const keys = [
        'softwareEngineeringPrinciple', 'oopConcept', 'dsa', 'adsa', 'softwareArchitecture',
        'dataBase', 'gui', 'qaTesting', 'devops', 'ml', 'ai', 'imageProcessing',
        'embededSystem', 'analogElectronics', 'signalAndSystem', 'digitalLogicDesign',
        'digitalSystemDesignWithHdl', 'controlSystem', 'informationSecurity', 'computerNetwork',
        'operatingSystemAndNetworking'
      ];
      keys.forEach((k) => {
        if (moduleMarks[k] != null) {
          markCount++;
          markTotal += Number(moduleMarks[k]);
        }
      });
    }

    let avg: number | null = null;
    if (markCount > 0) {
      avg = Math.round((markTotal / markCount) * 10) / 10;
    } else if (currentUser?.currentGpa != null && currentUser.currentGpa > 0) {
      avg = Math.round(((currentUser.currentGpa / 4.0) * 100) * 10) / 10;
    }

    const spec = moduleMarks?.primarySpecializationLabel || moduleMarks?.primarySpecialization || null;
    const conf = moduleMarks?.primaryConfidence ? Number(moduleMarks.primaryConfidence).toFixed(1) : null;

    return { avgCurriculumMark: avg, specializationLabel: spec, primaryConfidence: conf };
  }, [moduleMarks, currentUser]);

  // 3. Resolve Industry Demand Match Score
  const industryMatchScore = useMemo<number | null>(() => {
    if (industryDemand?.industryMatchScore != null) {
      return Math.round(Number(industryDemand.industryMatchScore) * 10) / 10;
    }
    return null;
  }, [industryDemand]);

  // 4. Resolve Social Media / Resume Score
  const profileScore = useMemo<number | null>(() => {
    if (profileAnalysis?.overallScore != null) {
      return Math.round(Number(profileAnalysis.overallScore) * 10) / 10;
    }
    if (profileAnalysis?.total_score != null) {
      return Math.round(Number(profileAnalysis.total_score) * 10) / 10;
    }
    return null;
  }, [profileAnalysis]);

  // 5. Aggregate Cohort Rankings (Using Server response or robust Client-side computation)
  const { rankedCohort, currentStudentReadiness, cohortAverages } = useMemo(() => {
    if (cohortReadiness && cohortReadiness.rankedStudents?.length > 0) {
      // Ensure all students in cohort have currentYear and batchYear hydrated from allStudents if missing
      const enrichedStudents = cohortReadiness.rankedStudents.map((st) => {
        let yr = st.currentYear;
        let by = st.batchYear;
        if (!yr || !by) {
          const match = allStudents.find(
            (a) => a.id === st.studentId || (st.email && a.email && a.email.toLowerCase().trim() === st.email.toLowerCase().trim())
          );
          if (match) {
            if (!yr) yr = match.currentYear;
            if (!by) by = match.batchYear;
          }
        }
        return {
          ...st,
          currentYear: yr,
          batchYear: by,
        };
      });

      const foundCurrent = enrichedStudents.find(
        (s) => s.studentId === currentUser?.id || (currentUser?.email && s.email === currentUser.email)
      );

      return {
        rankedCohort: enrichedStudents,
        currentStudentReadiness: foundCurrent || cohortReadiness.studentReadiness || null,
        cohortAverages: {
          overall: cohortReadiness.averageOverallScore,
          academic: cohortReadiness.averageAcademicScore,
          github: cohortReadiness.averageGithubScore,
          industry: cohortReadiness.averageIndustryScore,
          profile: cohortReadiness.averageProfileScore,
        }
      };
    }

    // Client-side fallback computation
    const studentsList = allStudents.length > 0 ? allStudents : (currentUser ? [currentUser] : []);
    const list: UnifiedReadinessStudent[] = studentsList.map((st) => {
      const isCurrent = currentUser && (st.id === currentUser.id || st.email === currentUser.email);

      const acad = isCurrent ? avgCurriculumMark : (st.currentGpa ? Math.min(100, (st.currentGpa / 4.0) * 100) : null);
      const gh = isCurrent ? githubScore : (st.latestAiOverallScore ?? null);
      const ind = isCurrent ? industryMatchScore : null;
      const prof = isCurrent ? profileScore : null;

      let sum = 0;
      let totalW = 0;
      let evaluated = 0;

      if (acad != null) { sum += acad * WEIGHT_ACADEMIC; totalW += WEIGHT_ACADEMIC; evaluated++; }
      if (gh != null) { sum += gh * WEIGHT_GITHUB; totalW += WEIGHT_GITHUB; evaluated++; }
      if (ind != null) { sum += ind * WEIGHT_INDUSTRY; totalW += WEIGHT_INDUSTRY; evaluated++; }
      if (prof != null) { sum += prof * WEIGHT_PROFILE; totalW += WEIGHT_PROFILE; evaluated++; }

      const finalScore = totalW > 0 ? Math.round((sum / totalW) * 10) / 10 : 0;
      let tier: 'Industry Ready' | 'Nearly Ready' | 'Developing' | 'Foundational' = 'Foundational';
      if (finalScore >= 80) tier = 'Industry Ready';
      else if (finalScore >= 60) tier = 'Nearly Ready';
      else if (finalScore >= 40) tier = 'Developing';

      return {
        studentId: st.id,
        studentName: st.name,
        email: st.email,
        registrationNumber: st.registrationNumber || `STU-${st.id}`,
        avatarUrl: (st as any).avatarUrl,
        currentYear: st.currentYear,
        batchYear: st.batchYear,
        currentGpa: st.currentGpa,
        overallScore: finalScore,
        rank: 1,
        percentile: 100,
        readinessTier: tier,
        evaluatedPillarsCount: evaluated,
        academicScore: acad != null ? Math.round(acad * 10) / 10 : null,
        githubScore: gh != null ? Math.round(gh * 10) / 10 : null,
        industryScore: ind != null ? Math.round(ind * 10) / 10 : null,
        profileScore: prof != null ? Math.round(prof * 10) / 10 : null,
        topSpecialization: isCurrent ? specializationLabel || undefined : undefined,
        topCareerPath: isCurrent ? profileAnalysis?.topCareerPath || profileAnalysis?.top_category : undefined,
      };
    });

    list.sort((a, b) => b.overallScore - a.overallScore);
    const total = list.length;
    list.forEach((st, idx) => {
      st.rank = idx + 1;
      st.percentile = total > 1 ? Math.round(((total - (idx + 1)) / (total - 1)) * 1000) / 10 : 100;
    });

    const sumOverall = list.reduce((acc, s) => acc + s.overallScore, 0);
    const avgOverall = total > 0 ? Math.round((sumOverall / total) * 10) / 10 : 0;

    const currentCalculated = list.find(s => s.studentId === currentUser?.id) || list[0] || null;

    return {
      rankedCohort: list,
      currentStudentReadiness: currentCalculated,
      cohortAverages: {
        overall: avgOverall,
        academic: avgCurriculumMark || 75.0,
        github: githubScore || 68.0,
        industry: industryMatchScore || 62.0,
        profile: profileScore || 65.0,
      }
    };
  }, [
    cohortReadiness,
    allStudents,
    currentUser,
    avgCurriculumMark,
    githubScore,
    industryMatchScore,
    profileScore,
    specializationLabel,
    profileAnalysis
  ]);

  // Current Student Overall Stats
  const studentOverall = currentStudentReadiness?.overallScore ?? 0;
  const studentRank = currentStudentReadiness?.rank ?? 1;
  const totalInCohort = rankedCohort.length || 1;
  const studentPercentile = currentStudentReadiness?.percentile ?? 100;
  const readinessTier = currentStudentReadiness?.readinessTier ?? 'Developing';

  // 5b. Resolve Current User's Batch
  const currentUserBatch = useMemo(() => {
    if (!currentUser) return null;
    return getStudentBatch(currentUser, allStudents);
  }, [currentUser, allStudents]);

  // 5c. Discover all available batches with student counts
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

  // 5d. Filter & Dynamically Re-rank Leaderboard per Batch & Search
  const { filteredLeaderboard, activeBatchStats } = useMemo(() => {
    // 1. Determine active batch target
    let targetBatch: string | null = null;
    if (selectedBatch === 'MY_BATCH') {
      targetBatch = currentUserBatch;
    } else if (selectedBatch !== 'ALL') {
      targetBatch = selectedBatch;
    }

    // 2. Isolate batch pool (or full cohort if ALL)
    const pool = targetBatch
      ? rankedCohort.filter((s) => getStudentBatch(s, allStudents) === targetBatch)
      : rankedCohort;

    const inBatchTotal = pool.length;
    const inBatchSum = pool.reduce((acc, s) => acc + s.overallScore, 0);
    const inBatchAvg = inBatchTotal > 0 ? Math.round((inBatchSum / inBatchTotal) * 10) / 10 : 0;

    // 3. Re-rank within this specific batch pool
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

    // Find current student in this batch
    const currentInBatch = reRankedPool.find(
      (s) => s.studentId === currentUser?.id || (currentUser?.email && s.email === currentUser.email)
    );

    // 4. Apply search query
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
        currentUserRank: currentInBatch?.batchRank ?? null,
        currentUserPercentile: currentInBatch?.batchPercentile ?? null,
      }
    };
  }, [rankedCohort, allStudents, selectedBatch, currentUserBatch, searchQuery, currentUser]);

  // Radar Chart Data: Student vs. Cohort Average
  const radarChartData = useMemo(() => {
    return [
      {
        pillar: 'Academic Marks (25%)',
        Student: currentStudentReadiness?.academicScore ?? 0,
        CohortAverage: cohortAverages.academic ?? 65,
        fullMark: 100,
      },
      {
        pillar: 'GitHub Quality (30%)',
        Student: currentStudentReadiness?.githubScore ?? 0,
        CohortAverage: cohortAverages.github ?? 60,
        fullMark: 100,
      },
      {
        pillar: 'Industry Match (20%)',
        Student: currentStudentReadiness?.industryScore ?? 0,
        CohortAverage: cohortAverages.industry ?? 55,
        fullMark: 100,
      },
      {
        pillar: 'Profile & Resume (25%)',
        Student: currentStudentReadiness?.profileScore ?? 0,
        CohortAverage: cohortAverages.profile ?? 60,
        fullMark: 100,
      },
    ];
  }, [currentStudentReadiness, cohortAverages]);

  // Bar Chart Data: Side-by-side comparison
  const barChartData = useMemo(() => {
    return [
      {
        name: 'Academic Marks',
        'Your Score': currentStudentReadiness?.academicScore ?? 0,
        'Cohort Average': cohortAverages.academic ?? 65,
        'Target Benchmark': 80,
      },
      {
        name: 'GitHub Quality',
        'Your Score': currentStudentReadiness?.githubScore ?? 0,
        'Cohort Average': cohortAverages.github ?? 60,
        'Target Benchmark': 80,
      },
      {
        name: 'Industry Demand',
        'Your Score': currentStudentReadiness?.industryScore ?? 0,
        'Cohort Average': cohortAverages.industry ?? 55,
        'Target Benchmark': 80,
      },
      {
        name: 'Profile & Resume',
        'Your Score': currentStudentReadiness?.profileScore ?? 0,
        'Cohort Average': cohortAverages.profile ?? 60,
        'Target Benchmark': 80,
      },
    ];
  }, [currentStudentReadiness, cohortAverages]);

  // Peer Comparison 2-Way Radar Data (when comparing with specific student)
  const peerComparisonData = useMemo(() => {
    if (!selectedPeerForCompare) return [];
    return [
      {
        pillar: 'Academic Marks',
        You: currentStudentReadiness?.academicScore ?? 0,
        Peer: selectedPeerForCompare.academicScore ?? 0,
        fullMark: 100,
      },
      {
        pillar: 'GitHub Quality',
        You: currentStudentReadiness?.githubScore ?? 0,
        Peer: selectedPeerForCompare.githubScore ?? 0,
        fullMark: 100,
      },
      {
        pillar: 'Industry Demand',
        You: currentStudentReadiness?.industryScore ?? 0,
        Peer: selectedPeerForCompare.industryScore ?? 0,
        fullMark: 100,
      },
      {
        pillar: 'Profile & Resume',
        You: currentStudentReadiness?.profileScore ?? 0,
        Peer: selectedPeerForCompare.profileScore ?? 0,
        fullMark: 100,
      },
    ];
  }, [selectedPeerForCompare, currentStudentReadiness]);

  const handleRefresh = async () => {
    if (onRefreshCohort) {
      setIsRefreshing(true);
      await onRefreshCohort();
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO EMPLOYABILITY READINESS & COHORT RANKING CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Hero Details */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Overall Employability Readiness & Ranking Index</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Cohort Standing: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">Rank #{studentRank}</span> of {totalInCohort} Students
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Synthesized from <strong>Academic Marks (25%)</strong>, <strong>GitHub Code Quality (30%)</strong>, <strong>Industry Demand Match (20%)</strong>, and <strong>Social Media & Resume Analysis (25%)</strong>.
            </p>

            {/* Quick 4-Pillar Score Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Academic: <strong>{currentStudentReadiness?.academicScore != null ? `${currentStudentReadiness.academicScore}%` : 'N/A'}</strong></span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5 shadow-sm">
                <Github className="w-3.5 h-3.5 text-sky-400" />
                <span>GitHub: <strong>{currentStudentReadiness?.githubScore != null ? `${currentStudentReadiness.githubScore}%` : 'N/A'}</strong></span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5 shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Industry: <strong>{currentStudentReadiness?.industryScore != null ? `${currentStudentReadiness.industryScore}%` : 'N/A'}</strong></span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5 shadow-sm">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Profile/Resume: <strong>{currentStudentReadiness?.profileScore != null ? `${currentStudentReadiness.profileScore}%` : 'N/A'}</strong></span>
              </span>
            </div>
          </div>

          {/* Right Hero Badge / Giant Score */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
            {/* Score Radial Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#heroScoreGrad)"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * Math.min(100, Math.max(0, studentOverall))) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="heroScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black tracking-tight text-white">{studentOverall.toFixed(1)}</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">/ 100 PTS</span>
              </div>
            </div>

            {/* Standing Details */}
            <div className="space-y-2 text-center sm:text-left">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Readiness Tier</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 shadow-sm ${
                  studentOverall >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : studentOverall >= 60
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {readinessTier}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Cohort Standing</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  Top <span className="text-indigo-400">{Math.max(1, 100 - studentPercentile)}%</span> ({studentPercentile}th Percentile)
                </p>
              </div>

              {onRefreshCohort && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-colors pt-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Analysis</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE KEY METRIC HIGHLIGHTS CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card 1: Cohort Rank & Gap to Top */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Cohort Standing</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              Rank #{studentRank} <span className="text-xs font-medium text-slate-400">/ {totalInCohort}</span>
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              {studentRank === 1 ? '🥇 Cohort Leader' : `${(rankedCohort[0]?.overallScore - studentOverall).toFixed(1)} pts behind #1`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Top Career Match from AI Profile & Modules */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Top AI Career Alignment</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 line-clamp-1">
              {profileAnalysis?.topCareerPath || specializationLabel || 'Software Engineer'}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{profileAnalysis?.topCareerMatch ? `${profileAnalysis.topCareerMatch}% Profile Fit` : (primaryConfidence ? `${primaryConfidence}% ML Confidence` : 'Curriculum Matched')}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Evaluated Dimensions & Strengths */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Primary Strength</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1">
              {currentStudentReadiness?.primaryStrength || 'Social Media & Profile'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentStudentReadiness?.evaluatedPillarsCount ?? 4} of 4 evaluation pillars active
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CHARTS: 4-PILLAR RADAR & MULTI-DIMENSION COMPARISON */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              4-Pillar Readiness Benchmark Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare your performance across Academic, GitHub, Industry Demand, and Profile analysis against the cohort average.
            </p>
          </div>

          {/* Chart View Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setActiveChartView('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartView === 'radar'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radar Comparison
            </button>
            <button
              onClick={() => setActiveChartView('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartView === 'bar'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bar Benchmark
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 pt-6 items-center">
          {/* Chart Display Area */}
          <div className="lg:col-span-8 h-80 w-full">
            {activeChartView === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData} outerRadius="75%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="Your Score"
                    dataKey="Student"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Cohort Average"
                    dataKey="CohortAverage"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.25}
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="Your Score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Cohort Average" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Target Benchmark" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart Insights Panel */}
          <div className="lg:col-span-4 space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Strategic Growth Analysis
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xl">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-indigo-600">
                  Strongest Lead
                </span>
                <p className="text-slate-600 mt-1">
                  Your <strong>{currentStudentReadiness?.primaryStrength || 'Profile & Resume'}</strong> score leads the cohort average by{' '}
                  <strong className="text-emerald-600">
                    +{Math.max(0, (currentStudentReadiness?.profileScore ?? 0) - (cohortAverages.profile ?? 0)).toFixed(1)}%
                  </strong>.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xl">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-amber-600">
                  Priority Growth Focus
                </span>
                <p className="text-slate-600 mt-1">
                  Targeting <strong>{currentStudentReadiness?.primaryGrowthArea || 'GitHub Testing & CI/CD'}</strong> has the highest potential to boost your cohort rank to the next tier.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-slate-400">
                Formula: Academic (25%) + GitHub (30%) + Industry (20%) + Profile (25%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COHORT LEADERBOARD & PEER COMPARISON TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Cohort Leaderboard & Peer Rankings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare your overall marks and evaluation metrics directly with each and every student in the cohort.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Batch Filter & Selection Bar */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Batch:
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

            {/* My Batch Button (Highlighted) */}
            {currentUserBatch && (
              <button
                onClick={() => setSelectedBatch('MY_BATCH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedBatch === 'MY_BATCH'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                My Batch ({currentUserBatch})
              </button>
            )}
          </div>

          {/* Contextual Batch Info Banner */}
          <div className="text-xs text-slate-600 flex items-center gap-2">
            {selectedBatch !== 'ALL' && activeBatchStats.targetBatch ? (
              <div className="flex items-center gap-2 bg-indigo-50/90 border border-indigo-200/70 px-3 py-1 rounded-lg">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  {activeBatchStats.targetBatch}
                </span>
                <span className="text-indigo-300">•</span>
                <span className="text-slate-600">{activeBatchStats.total} Peers</span>
                <span className="text-indigo-300">•</span>
                <span className="text-slate-600">Avg: <strong className="text-indigo-950 font-bold">{activeBatchStats.average}%</strong></span>
                {activeBatchStats.currentUserRank && (
                  <>
                    <span className="text-indigo-300">•</span>
                    <span className="text-indigo-700 font-extrabold">
                      Your Standing: #{activeBatchStats.currentUserRank}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-slate-400 font-medium text-[11px]">
                Showing entire cohort ({rankedCohort.length} students across all academic batches)
              </span>
            )}
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
                    <span>Cohort Rank</span>
                  )}
                </th>
                <th className="py-3 px-4">Student & Batch</th>
                <th className="py-3 px-4 text-center">Overall Score</th>
                <th className="py-3 px-4 text-center">Academic (25%)</th>
                <th className="py-3 px-4 text-center">GitHub (30%)</th>
                <th className="py-3 px-4 text-center">Industry (20%)</th>
                <th className="py-3 px-4 text-center">Profile (25%)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No students found</p>
                    <p className="mt-1 text-slate-400">
                      {searchQuery ? `No students matched "${searchQuery}" in ${activeBatchStats.targetBatch || 'the cohort'}.` : 'No students found in this batch category.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((student) => {
                  const isCurrent = currentUser && (student.studentId === currentUser.id || student.email === currentUser.email);
                  const displayRank = selectedBatch !== 'ALL' ? student.batchRank : student.rank;

                  return (
                    <tr
                      key={student.studentId}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50/60 font-medium hover:bg-indigo-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          {displayRank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs shadow-sm">
                              🥇 1
                            </span>
                          ) : displayRank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-sm">
                              🥈 2
                            </span>
                          ) : displayRank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-700 font-black text-xs shadow-sm">
                              🥉 3
                            </span>
                          ) : (
                            <span className="font-bold text-slate-600">#{displayRank}</span>
                          )}

                          {selectedBatch !== 'ALL' && (
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5" title="Overall Faculty Cohort Rank">
                              Cohort #{student.cohortRank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {student.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">{student.studentName}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                                  YOU
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {student.batchName}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">{student.registrationNumber || student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-sm text-slate-900">{student.overallScore.toFixed(1)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.overallScore >= 80 ? 'bg-emerald-500' : student.overallScore >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
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

                      {/* Status Pill */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          student.readinessTier === 'Industry Ready'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.readinessTier === 'Nearly Ready'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {student.readinessTier}
                        </span>
                      </td>

                      {/* Compare Action */}
                      <td className="py-3.5 px-4 text-center">
                        {isCurrent ? (
                          <span className="text-[11px] text-slate-400 italic">Current User</span>
                        ) : (
                          <button
                            onClick={() => setSelectedPeerForCompare(student)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200/60"
                          >
                            Compare
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FOUR PILLAR DEEP-DIVE CARDS */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Individual Pillar Deep Dives
          </h2>
          <p className="text-xs text-slate-500">
            Explore detailed evidence, source metrics, and automated feedback for each evaluation domain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Academic Modules */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Academic Modules (25%)</h3>
              <p className="text-xs text-slate-400 mt-0.5">21 Curriculum Courses & ML Model</p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Average Grade</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {avgCurriculumMark != null ? `${avgCurriculumMark}%` : 'Pending'}
                </span>
                {specializationLabel && (
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1 truncate">
                    Track: {specializationLabel}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('modules')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <span>View Academic Marks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: GitHub Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Github className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Developer Quality (30%)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Dual-Model AI Repository Audit</p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Code Quality Score</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {githubScore != null ? `${githubScore.toFixed(1)}%` : 'Not Analyzed'}
                </span>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Testing: {testing > 0 ? `${testing.toFixed(0)}%` : '—'} | Architecture: {architecture > 0 ? `${architecture.toFixed(0)}%` : '—'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('github')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <span>View GitHub Code Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: Industry Demand */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Industry Demand (20%)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live Tech Job Market Alignment</p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Skill Match</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {industryMatchScore != null ? `${industryMatchScore}%` : 'Not Matched'}
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {industryDemand?.matchedSkills?.length ?? 0} In-demand Skills Matched
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('industry')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <span>View Industry Alignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 4: Social Media & Resume */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Social Media & Resume (25%)</h3>
              <p className="text-xs text-slate-400 mt-0.5">LinkedIn Profile & PDF Evaluation</p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Profile Score</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {profileScore != null ? `${profileScore}%` : 'No Profile Uploaded'}
                </span>
                <p className="text-[11px] text-amber-600 font-semibold mt-1 truncate">
                  Role: {profileAnalysis?.topCareerPath || 'Pending Resume Upload'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('social')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <span>View Social Media Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. HEAD-TO-HEAD COMPARISON MODAL */}
      {selectedPeerForCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-600" />
                  Head-to-Head Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparing <strong>{currentUser?.name || 'You'}</strong> vs <strong>{selectedPeerForCompare.studentName}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedPeerForCompare(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Comparison Summary Cards */}
            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">You</span>
                <span className="text-3xl font-black text-slate-900 block mt-1">{studentOverall.toFixed(1)}%</span>
                <span className="text-xs text-indigo-700 font-semibold">Rank #{studentRank}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  {selectedPeerForCompare.studentName}
                </span>
                <span className="text-3xl font-black text-slate-900 block mt-1">
                  {selectedPeerForCompare.overallScore.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-600 font-semibold">Rank #{selectedPeerForCompare.rank}</span>
              </div>
            </div>

            {/* Delta Lead Badge */}
            <div className="text-center mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                studentOverall >= selectedPeerForCompare.overallScore
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {studentOverall >= selectedPeerForCompare.overallScore
                  ? `You lead by +${(studentOverall - selectedPeerForCompare.overallScore).toFixed(1)}% points`
                  : `Behind by -${(selectedPeerForCompare.overallScore - studentOverall).toFixed(1)}% points`}
              </span>
            </div>

            {/* 2-Way Superimposed Radar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={peerComparisonData} outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="You"
                    dataKey="You"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name={selectedPeerForCompare.studentName}
                    dataKey="Peer"
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
                { name: 'Academic Marks (25%)', you: currentStudentReadiness?.academicScore ?? 0, peer: selectedPeerForCompare.academicScore ?? 0 },
                { name: 'GitHub Quality (30%)', you: currentStudentReadiness?.githubScore ?? 0, peer: selectedPeerForCompare.githubScore ?? 0 },
                { name: 'Industry Demand (20%)', you: currentStudentReadiness?.industryScore ?? 0, peer: selectedPeerForCompare.industryScore ?? 0 },
                { name: 'Profile & Resume (25%)', you: currentStudentReadiness?.profileScore ?? 0, peer: selectedPeerForCompare.profileScore ?? 0 },
              ].map((item) => {
                const diff = item.you - item.peer;
                return (
                  <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{item.you.toFixed(1)}% vs {item.peer.toFixed(1)}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedPeerForCompare(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
