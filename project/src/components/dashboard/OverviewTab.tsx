import { Trophy, BookOpen, Target, Github, Brain, Briefcase, Sparkles, CheckCircle2, ArrowRight, TrendingUp, ShieldCheck, Code, Award } from 'lucide-react';
import { type AnalysisResult } from '../AnalysisResults';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
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
  onNavigateTab?: (tab: 'overview' | 'profile' | 'students' | 'github' | 'social' | 'modules' | 'industry') => void;
}

export function OverviewTab({
  currentUser,
  allStudents,
  analysisResult,
  moduleMarks,
  industryDemand,
  onNavigateTab
}: OverviewTabProps) {
  // 1. Resolve GitHub Analysis Data from prop or database record
  let githubScore: number | null = null;
  let githubStatus: string = 'Not analyzed yet';
  let totalRepos = 0;
  let analyzedRepos = 0;
  let codeQuality = 0;
  let architecture = 0;
  let testing = 0;
  let documentation = 0;

  if (analysisResult) {
    githubScore = analysisResult.overallScore;
    githubStatus = 'Completed';
    totalRepos = analysisResult.totalRepositories || 0;
    analyzedRepos = analysisResult.analyzedRepositories || 0;
    codeQuality = analysisResult.codeQualityScore || 0;
    architecture = analysisResult.architectureScore || 0;
    testing = analysisResult.testingScore || 0;
    documentation = analysisResult.documentationScore || 0;
  } else if (currentUser?.latestAiOverallScore != null) {
    githubScore = currentUser.latestAiOverallScore;
    githubStatus = currentUser.latestAiStatus || 'Completed';
    codeQuality = currentUser.latestAiCodeQualityScore || 0;
    architecture = currentUser.latestAiArchitectureScore || 0;
    testing = currentUser.latestAiTestingScore || 0;
    documentation = currentUser.latestAiDocumentationScore || 0;

    if (currentUser.aiAnalysisResultJson) {
      try {
        const parsed = JSON.parse(currentUser.aiAnalysisResultJson);
        totalRepos = parsed.total_repositories || 0;
        analyzedRepos = parsed.analyzed_repositories || 0;
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 2. Resolve Academic Module Marks & AI Specialization Data
  const hasMarks = moduleMarks && moduleMarks.primarySpecialization;
  const specializationLabel = moduleMarks?.primarySpecializationLabel || moduleMarks?.primarySpecialization || 'Pending Marks';
  const primaryConfidence = moduleMarks?.primaryConfidence ? Number(moduleMarks.primaryConfidence).toFixed(1) : null;
  
  // Calculate curriculum average if marks exist
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
  const avgCurriculumMark = markCount > 0 ? (markTotal / markCount).toFixed(1) : null;

  // 3. Resolve Industry Demand Match Data
  const industryMatchScore = industryDemand?.industryMatchScore != null ? Number(industryDemand.industryMatchScore) : null;
  const matchedSkillsList: string[] = Array.isArray(industryDemand?.matchedSkills) ? industryDemand.matchedSkills : [];
  const missingSkillsList: string[] = Array.isArray(industryDemand?.missingSkills) ? industryDemand.missingSkills : [];

  return (
    <div className="space-y-8">
      {/* TOP STAT CARDS */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Cohort Size</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{allStudents.length} Students</p>
            <p className="text-xs text-slate-400 mt-1">Enrolled engineering students</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Cumulative GPA</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {currentUser?.currentGpa != null ? Number(currentUser.currentGpa).toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Academic performance index</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Academic Level</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{currentUser?.currentYear || '1st Year'}</p>
            <p className="text-xs text-slate-400 mt-1">{currentUser?.registrationNumber || 'Student ID: #' + (currentUser?.id ?? '')}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Target className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* THREE PILLARS HERO SECTION */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Employability Readiness Pillars
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Live intelligence aggregated from GitHub repository analysis, academic marks ML model, and live industry demand.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 1. GITHUB ANALYSIS CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Github className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  githubScore != null
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {githubScore != null ? 'Analyzed ✓' : 'Not Analyzed'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg">Developer Readiness</h3>
              <p className="text-xs text-slate-500 mt-0.5">Codebase quality & repository analysis</p>

              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">Overall Readiness Score</span>
                  <span className="text-2xl font-black text-slate-900">
                    {githubScore != null ? `${githubScore.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, githubScore || 0))}%` }}
                  />
                </div>
                {analyzedRepos > 0 && (
                  <p className="text-[11px] text-slate-500 mt-2">
                    Analyzed <strong>{analyzedRepos}</strong> of <strong>{totalRepos}</strong> GitHub repositories
                  </p>
                )}
              </div>

              {githubScore != null && (
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Code Quality</span>
                    <span className="font-bold text-slate-800">{codeQuality.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Architecture</span>
                    <span className="font-bold text-slate-800">{architecture.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Testing</span>
                    <span className="font-bold text-slate-800">{testing.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Documentation</span>
                    <span className="font-bold text-slate-800">{documentation.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('github')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>View GitHub Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. ACADEMIC MODULE MARKS & AI PREDICTOR CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  hasMarks
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {hasMarks ? 'AI Recommended ✓' : 'Pending Marks'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg">AI Specialization</h3>
              <p className="text-xs text-slate-500 mt-0.5">Machine Learning curriculum evaluation</p>

              <div className="my-5 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">
                  Top Recommended Track
                </span>
                <p className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                  {specializationLabel}
                </p>
                {primaryConfidence && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Model Confidence:</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                      {primaryConfidence}%
                    </span>
                  </div>
                )}
              </div>

              {avgCurriculumMark && (
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Curriculum Avg</span>
                    <span className="font-bold text-slate-800">{avgCurriculumMark}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Graded Modules</span>
                    <span className="font-bold text-slate-800">{markCount} / 21</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('modules')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span>View Academic Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. INDUSTRY DEMAND ALIGNMENT CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  industryMatchScore != null
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {industryMatchScore != null ? 'Live Match ✓' : 'Profile Incomplete'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg">Industry Demand</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live software market skill alignment</p>

              <div className="my-5 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">Skill Alignment Match</span>
                  <span className="text-2xl font-black text-blue-700">
                    {industryMatchScore != null ? `${industryMatchScore.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, industryMatchScore || 0))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  <strong>{matchedSkillsList.length}</strong> matched skills across scraped job postings
                </p>
              </div>

              {matchedSkillsList.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Top Matched Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkillsList.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s}
                      </span>
                    ))}
                    {matchedSkillsList.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400">
                        +{matchedSkillsList.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('industry')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span>View Industry Demand</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
