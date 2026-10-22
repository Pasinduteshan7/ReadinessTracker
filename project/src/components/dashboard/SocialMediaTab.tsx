import React, { useState, useEffect, useRef } from 'react';
import {
  Linkedin,
  Facebook,
  Upload,
  FileText,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Clock,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
} from 'recharts';
import {
  employabilityService,
  StudentDetail,
  RankingResult,
} from '../../services/employabilityService';

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
}

interface SocialMediaTabProps {
  currentUser: Student | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  'AI/ML Engineering': '🤖',
  'Data Science': '📊',
  'Software Engineering': '💻',
  'Web Development': '🌐',
  'Mobile Development': '📱',
  'Cloud/DevOps': '☁️',
  Networking: '🌍',
  Cybersecurity: '🔒',
};

const DIMENSION_CONFIG = [
  { key: 'skills', label: 'Skills & Tech', max: 30, icon: Zap, color: 'text-indigo-600' },
  { key: 'projects', label: 'Projects Depth', max: 20, icon: BookOpen, color: 'text-blue-600' },
  { key: 'certifications', label: 'Certifications', max: 15, icon: Award, color: 'text-amber-600' },
  { key: 'experience', label: 'Experience', max: 15, icon: Briefcase, color: 'text-emerald-600' },
  { key: 'education', label: 'Education', max: 10, icon: GraduationCap, color: 'text-purple-600' },
  { key: 'extras', label: 'Presentation & Extras', max: 10, icon: Sparkles, color: 'text-rose-600' },
];

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // emerald
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function SocialMediaTab({ currentUser }: SocialMediaTabProps) {
  // Service health
  const [isServiceOnline, setIsServiceOnline] = useState<boolean | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Analysis state
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [ranking, setRanking] = useState<RankingResult | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Health check & Initial load
  const verifyServiceAndLoad = async () => {
    setCheckingHealth(true);
    const health = await employabilityService.checkHealth();
    setIsServiceOnline(health.isOnline);
    setCheckingHealth(false);

    if (currentUser) {
      setLoadingExisting(true);
      try {
        // 1. Try loading existing saved analysis directly from Supabase
        if (currentUser.id) {
          const supabaseSaved = await employabilityService.getSavedAnalysisFromSupabase(Number(currentUser.id));
          if (supabaseSaved && (supabaseSaved.readiness?.total ?? 0) > 0) {
            if (!supabaseSaved.name && currentUser.name) {
              supabaseSaved.name = currentUser.name;
            }
            setDetail(supabaseSaved);
            if (health.isOnline) {
              const r = await employabilityService.getStudentRanking(Number(currentUser.id));
              if (r) setRanking(r);
            }
            setLoadingExisting(false);
            return;
          }
        }

        // 2. Fallback to FastAPI service if not in Supabase yet
        if (health.isOnline) {
          const existing = await employabilityService.findStudentByEmailOrName(
            currentUser.email,
            currentUser.name
          );
          if (existing) {
            setDetail(existing);
            const r = await employabilityService.getStudentRanking(existing.id);
            if (r) setRanking(r);
            // Sync to Supabase in the background
            if (currentUser.id) {
              employabilityService.saveAnalysisToSupabase(Number(currentUser.id), existing);
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading existing analysis:', err);
      } finally {
        setLoadingExisting(false);
      }
    } else {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    verifyServiceAndLoad();
  }, [currentUser]);

  // Stepper effect during analysis
  useEffect(() => {
    let timer: any;
    if (analyzing) {
      setAnalysisStep(1);
      timer = setInterval(() => {
        setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 3500);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(timer);
  }, [analyzing]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files (resume or LinkedIn PDF export) are supported.');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);

    try {
      const result = await employabilityService.analyzePdf(file);
      setDetail(result);
      if (result.id) {
        const r = await employabilityService.getStudentRanking(result.id);
        if (r) setRanking(r);
      }

      // Persist analysis to Supabase via Spring Boot
      if (currentUser?.id) {
        await employabilityService.saveAnalysisToSupabase(Number(currentUser.id), result, file.name);
      }

      setShowUploadModal(false);
      setFile(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze profile.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Radar data formatting
  const radarData = detail?.readiness?.breakdown
    ? DIMENSION_CONFIG.map((dim) => {
        const val = (detail.readiness.breakdown as any)[dim.key] || 0;
        return {
          dimension: dim.label,
          score: Math.round((val / dim.max) * 100),
          raw: val,
          max: dim.max,
        };
      })
    : [];

  const topCategory = detail?.job_fit ? Object.keys(detail.job_fit)[0] : null;
  const topCategoryScore = topCategory && detail?.job_fit ? (detail.job_fit[topCategory] ?? 0) : 0;
  const percentileVal = ranking?.percentile ?? (ranking as any)?.overall_percentile ?? 50;
  const cohortSize = ranking?.total_students ?? (ranking as any)?.cohort_size ?? 1;
  const rankNumber = ranking?.rank ?? 1;

  return (
    <div className="space-y-6">
      {/* Top Banner / Social Profiles Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Linkedin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Social Media &amp; Professional Profile Analysis
                </h2>
                <p className="text-sm text-slate-500">
                  AI-powered LinkedIn profile, resume evaluation, and industry readiness scoring
                </p>
              </div>
            </div>
          </div>

          {/* Service health indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                isServiceOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isServiceOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {isServiceOnline
                  ? 'AI Engine Online (:8001)'
                  : isServiceOnline === false
                  ? 'AI Engine Offline'
                  : 'Checking Engine...'}
              </span>
            </div>

            <button
              onClick={verifyServiceAndLoad}
              disabled={checkingHealth}
              title="Refresh connection & data"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${checkingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Connected Profiles Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* LinkedIn Profile Card */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Linkedin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  LinkedIn Profile
                </div>
                <div className="text-sm text-slate-700 font-medium truncate max-w-[240px]">
                  {currentUser?.linkedinUrl || 'No LinkedIn URL added yet'}
                </div>
              </div>
            </div>
            {currentUser?.linkedinUrl ? (
              <a
                href={currentUser.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium transition shadow-sm"
              >
                <span>View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-xs text-slate-400">Not linked</span>
            )}
          </div>

          {/* Facebook / Secondary Profile Card */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Facebook Presence
                </div>
                <div className="text-sm text-slate-700 font-medium truncate max-w-[240px]">
                  {currentUser?.facebookUrl || 'Not connected'}
                </div>
              </div>
            </div>
            {currentUser?.facebookUrl ? (
              <a
                href={currentUser.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition shadow-sm"
              >
                <span>View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-xs text-slate-400">Optional</span>
            )}
          </div>
        </div>
      </div>

      {/* Guide Banner: How to export LinkedIn PDF */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/60 rounded-xl border border-indigo-100 p-4">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between text-left text-sm font-semibold text-indigo-950"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>How to export your LinkedIn profile as a PDF in 2 clicks</span>
          </div>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showGuide && (
          <div className="mt-3 pt-3 border-t border-indigo-100/80 text-xs text-indigo-900/80 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-indigo-700">1. Open Profile:</span> Go to your personal LinkedIn page on your browser.
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-indigo-700">2. Click More:</span> Find the <span className="font-semibold text-slate-900">More</span> button below your headline/photo.
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-indigo-700">3. Save to PDF:</span> Select <span className="font-semibold text-slate-900">Save to PDF</span> from the dropdown.
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-indigo-700">4. Upload Below:</span> Drag &amp; drop that PDF file to compute your readiness score!
            </div>
          </div>
        )}
      </div>

      {/* Upload Zone (When no detail or user clicks Re-analyze) */}
      {(!detail || showUploadModal) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {detail ? 'Re-Analyze Profile / Upload New PDF' : 'Upload LinkedIn Profile or Resume PDF'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Extracts skills, project depth, experience, and generates Gemini RAG recommendations.
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 bg-slate-50/50 hover:border-blue-400'
            }`}
          >
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-slate-700 mb-1">
              Drag &amp; drop your PDF resume or LinkedIn export here
            </div>
            <div className="text-xs text-slate-400 mb-4">Supported format: .PDF (up to 10MB)</div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Browse Files
            </button>

            {file && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/70 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{file.name}</span>
                <span className="text-blue-700/60">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          {file && !analyzing && (
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleAnalyze}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze Profile</span>
              </button>
              {showUploadModal && (
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setFile(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Stepper Loading State */}
          {analyzing && (
            <div className="mt-6 p-6 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-semibold text-slate-800 text-sm">
                  Analyzing Profile with AI... (Takes ~10-20 seconds)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { step: 1, label: '1. Parsing PDF Text' },
                  { step: 2, label: '2. Scoring 6 Dimensions' },
                  { step: 3, label: '3. Matching IT Roles' },
                  { step: 4, label: '4. Gemini Career Advice' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      analysisStep >= s.step
                        ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm'
                        : 'bg-white/80 text-slate-400 border-slate-200'
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Analysis error: </span>
                {error}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading state for existing record */}
      {loadingExisting && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <div className="text-sm font-medium text-slate-700">
            Checking for existing LinkedIn analysis...
          </div>
        </div>
      )}

      {/* Full Analysis Results View */}
      {detail && !showUploadModal && (
        <div className="space-y-6">
          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Overall Readiness Gauge */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Overall Readiness
                  </h4>
                  <div className="text-sm text-slate-700 font-medium mt-0.5">
                    Industry Benchmark Score
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${getScoreColor(detail.readiness.total)}15`,
                    color: getScoreColor(detail.readiness.total),
                  }}
                >
                  {detail.readiness.level}
                </span>
              </div>

              {/* Radial Bar Gauge */}
              <div className="relative w-full h-44 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={14}
                    data={[
                      {
                        name: 'score',
                        value: detail.readiness.total,
                        fill: getScoreColor(detail.readiness.total),
                      },
                    ]}
                    startAngle={210}
                    endAngle={-30}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
                  </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: getScoreColor(detail.readiness?.total ?? 0) }}
                  >
                    {(detail.readiness?.total ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ 100 points</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center border-t border-slate-100 pt-3">
                Calculated across 6 industry capability pillars
              </div>
            </div>

            {/* 2. Cohort Percentile & Standing */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cohort Ranking
                  </h4>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm text-slate-700 font-medium mt-0.5">
                  Peer group standing
                </div>
              </div>

              <div className="my-auto py-4 text-center">
                <div className="text-3xl font-extrabold text-slate-900">
                  {ranking != null ? `Top ${(100 - (percentileVal ?? 0)).toFixed(0)}%` : 'Active'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {ranking != null
                    ? `Rank #${rankNumber} of ${cohortSize} evaluated students`
                    : 'Evaluated against university cohort'}
                </div>

                {ranking != null && (
                  <div className="mt-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${Math.max(percentileVal ?? 5, 5)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Percentile: {(percentileVal ?? 0).toFixed(1)}th</span>
                      <span>100th</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 text-center border-t border-slate-100 pt-3">
                Profile: <span className="font-semibold text-slate-800">{detail.name || 'Candidate'}</span>
              </div>
            </div>

            {/* 3. Top Career Path Fit */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Top Career Path
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-sm text-slate-700 font-medium mt-0.5">
                  Best role alignment
                </div>
              </div>

              <div className="my-auto py-4 text-center">
                <div className="text-3xl mb-1">{CATEGORY_ICONS[topCategory || ''] || '🎯'}</div>
                <div className="text-xl font-bold text-slate-900">{topCategory || 'General IT'}</div>
                <div className="inline-block mt-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                  {(topCategoryScore ?? 0).toFixed(1)}% Match
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Need updates?</span>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Upload New PDF →
                </button>
              </div>
            </div>
          </div>

          {/* 6 Dimensions Radar + Detail Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Chart Card */}
            <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  6-Dimension Capability Radar
                </h3>
                <p className="text-xs text-slate-500">
                  Percentage completeness across readiness dimensions
                </p>
              </div>

              <div className="w-full h-72 my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="70%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Pillar Score"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dimension Breakdown Cards */}
            <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Capability Pillar Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Actual points awarded vs maximum achievable targets
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIMENSION_CONFIG.map((dim) => {
                  const val = (detail.readiness.breakdown as any)[dim.key] || 0;
                  const pct = Math.min((val / dim.max) * 100, 100);
                  const Icon = dim.icon;

                  return (
                    <div
                      key={dim.key}
                      className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${dim.color}`} />
                          <span className="text-xs font-semibold text-slate-800">{dim.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 tabular-nums">
                          {val.toFixed(1)} / {dim.max}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Job Fit Comparison Bars */}
          {detail.job_fit && Object.keys(detail.job_fit).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                    IT Career Category Compatibility
                  </h3>
                  <p className="text-xs text-slate-500">
                    Match percentages across standard technology career tracks
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(detail.job_fit).slice(0, 8).map(([cat, pct]) => (
                  <div key={cat} className="p-3 rounded-lg border border-slate-100 bg-slate-50/40">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{CATEGORY_ICONS[cat] || '📌'}</span>
                        <span className="font-semibold text-slate-800">{cat}</span>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {(pct ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 70
                            ? 'bg-emerald-500'
                            : pct >= 50
                            ? 'bg-blue-600'
                            : pct >= 30
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Gemini Recommendations & Action Plan */}
          {detail.recommendations && !detail.recommendations.error && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Career Coach (Gemini RAG)</span>
                    </div>
                    <h3 className="text-2xl font-bold">Target Role Roadmap: {topCategory}</h3>
                    <p className="text-xs text-white/80 mt-1">
                      Estimated time to employment readiness:{' '}
                      <span className="font-bold text-white">
                        {detail.recommendations.estimated_time_to_ready_months || 3} months
                      </span>
                    </p>
                  </div>
                  <div className="text-right bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-3xl font-extrabold tabular-nums">
                      {detail.recommendations?.readiness_for_role ?? (topCategoryScore ?? 0).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-white/80 uppercase tracking-wider">
                      Role Readiness
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Skill Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                      ✓
                    </span>
                    Profile Strengths
                  </h4>
                  <ul className="space-y-2.5">
                    {(detail.recommendations.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                    {(!detail.recommendations.strengths || detail.recommendations.strengths.length === 0) && (
                      <li className="text-xs text-slate-400">No specific strengths recorded.</li>
                    )}
                  </ul>
                </div>

                {/* Skill Gaps */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">
                      !
                    </span>
                    Identified Skill Gaps
                  </h4>
                  <ul className="space-y-2.5">
                    {(detail.recommendations.skill_gaps || []).map((g, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                    {(!detail.recommendations.skill_gaps || detail.recommendations.skill_gaps.length === 0) && (
                      <li className="text-xs text-slate-400">No critical skill gaps found!</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recommended Certifications */}
              {detail.recommendations.recommended_certifications &&
                detail.recommendations.recommended_certifications.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      Recommended Industry Certifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail.recommendations.recommended_certifications.map((cert, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-blue-200 transition"
                        >
                          <div className="font-semibold text-slate-900 text-sm">{cert.name}</div>
                          <div className="text-xs font-medium text-blue-600 mt-0.5">
                            {cert.provider}
                          </div>
                          <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {cert.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recommended Portfolio Projects */}
              {detail.recommendations.recommended_projects &&
                detail.recommendations.recommended_projects.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Recommended Portfolio Projects
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail.recommendations.recommended_projects.map((proj, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-purple-200 transition"
                        >
                          <div className="font-semibold text-slate-900 text-sm">{proj.title}</div>
                          <div className="flex flex-wrap gap-1.5 my-2">
                            {(proj.tech || []).map((t, j) => (
                              <span
                                key={j}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-slate-600 leading-relaxed">{proj.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Learning Path */}
              {detail.recommendations.learning_path &&
                detail.recommendations.learning_path.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Recommended Action Steps
                    </h4>
                    <div className="space-y-4">
                      {detail.recommendations.learning_path.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                            {step.step || i + 1}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="text-xs font-semibold text-slate-800">
                              {step.action}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Estimated duration: <span className="font-medium text-slate-700">{step.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Recognized Profile Highlights */}
          {detail.profile && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Recognized Profile Extraction Highlights
              </h3>

              {/* Extracted Skills */}
              {detail.profile.skills && detail.profile.skills.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    Extracted Skills ({detail.profile.skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.profile.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Experience */}
              {detail.profile.experience && detail.profile.experience.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-500 mb-2">Experience &amp; Internships</div>
                  <div className="space-y-2">
                    {detail.profile.experience.map((exp, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-900">{exp.role}</span>
                        {exp.company && <span className="text-slate-600"> at {exp.company}</span>}
                        {exp.duration && <span className="text-slate-400"> ({exp.duration})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
