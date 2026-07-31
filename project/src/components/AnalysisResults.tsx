import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Code, 
  GitBranch, 
  Star, 
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
export interface AnalysisResult {
  username: string;
  totalRepositories: number;
  analyzedRepositories: number;
  overallScore: number;
  totalStars: number;
  totalForks: number;
  averageLanguagesCount: number;
  codeQualityScore: number;
  architectureScore: number;
  documentationScore: number;
  testingScore: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  repositories: RepositoryAnalysis[];
  completedAt: string;
  // AI Employability Metrics
  employabilityTier?: string;
  professionalReadiness?: number;
  growthPotential?: number;
  recommendedLevel?: string;
}
export interface RepositoryAnalysis {
  name: string;
  url: string;
  score: number;
  tier: string;
  languages: string[];
  stars: number;
  forks: number;
  description: string;
  codeLlamaAnalysis?: string;
  qwenAnalysis?: string;
  neuralScore?: number;
  codeQualityScore?: number;
  architectureScore?: number;
  documentationScore?: number;
  testingScore?: number;
  bestPracticesScore?: number;
}
interface AnalysisResultsProps {
  result: AnalysisResult | null;
  loading?: boolean;
  error?: string;
}
export function AnalysisResults({ result, loading = false, error }: AnalysisResultsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 flex flex-col items-center justify-center min-h-64">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Analyzing your GitHub repositories...</p>
        <p className="text-sm text-slate-500 mt-2">This may take 1-2 minutes</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-8 flex flex-col items-start">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900">Analysis Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
        <Code className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No analysis results yet. Click "Analyze Repository" to get started!</p>
      </div>
    );
  }
  const getTierColor = (tier: string) => {
    if (tier.includes('TIER 1')) return 'bg-purple-50 border-purple-200';
    if (tier.includes('TIER 2')) return 'bg-blue-50 border-blue-200';
    if (tier.includes('TIER 3')) return 'bg-yellow-50 border-yellow-200';
    return 'bg-slate-50 border-slate-200';
  };
  const getTierBadgeColor = (tier: string) => {
    if (tier.includes('TIER 1')) return 'bg-purple-600 text-white';
    if (tier.includes('TIER 2')) return 'bg-blue-600 text-white';
    if (tier.includes('TIER 3')) return 'bg-yellow-600 text-white';
    return 'bg-slate-600 text-white';
  };

  // Benchmark comparison state
  interface Baseline {
    avgCodeQuality: number;
    avgArchitecture: number;
    avgDocumentation: number;
    avgTesting: number;
    avgBestPractices: number;
    avgOverallScore: number;
    scoreSpread: number;
    sampleSize: number;
  }

  const [baseline, setBaseline] = useState<Baseline | null>(null);

  useEffect(() => {
    // Fetch benchmark baseline for comparison
    const fetchBaseline = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/github/benchmark-baseline');
        if (response.ok) {
          const data = await response.json();
          if (data && data.sampleSize > 0) {
            setBaseline(data);
          }
        }
      } catch {
        // Silently fail — baseline comparison is optional
      }
    };
    fetchBaseline();
  }, []);

  const getGapColor = (gap: number) => {
    if (gap >= 0) return 'text-green-600';
    if (gap > -10) return 'text-amber-600';
    return 'text-red-600';
  };
  return (
    <div className="space-y-8">
      {}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-2">Developer Readiness Score</p>
            <p className="text-5xl font-bold">{result.overallScore.toFixed(1)}%</p>
          </div>
          <TrendingUp className="w-16 h-16 opacity-30" />
        </div>
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-blue-400">
          <div>
            <p className="text-blue-100 text-xs mb-1">Repositories Analyzed</p>
            <p className="text-2xl font-bold">{(result.analyzedRepositories || 0)} / {(result.totalRepositories || 0)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Total Stars</p>
            <p className="text-2xl font-bold">{result.totalStars || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Avg Languages</p>
            <p className="text-2xl font-bold">{(result.avgLanguagesCount || 0).toFixed(1)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Last Updated</p>
            <p className="text-sm font-medium">{result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'Just now'}</p>
          </div>
        </div>
      </div>
      {}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600">Code Quality</p>
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{(result.codeQualityScore || 0).toFixed(2)}</p>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min((result.codeQualityScore || 0) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600">Architecture</p>
            <GitBranch className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{(result.architectureScore || 0).toFixed(2)}</p>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min((result.architectureScore || 0) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600">Documentation</p>
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{(result.documentationScore || 0).toFixed(2)}</p>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${Math.min((result.documentationScore || 0) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600">Testing</p>
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{(result.testingScore || 0).toFixed(2)}</p>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${Math.min((result.testingScore || 0) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Section */}
      {baseline && (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <h3 className="text-lg font-bold">Benchmark Comparison</h3>
              </div>
              <span className="text-xs text-emerald-100 bg-emerald-700/50 px-3 py-1 rounded-full">
                Based on {baseline.sampleSize} successful graduate{baseline.sampleSize !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Metric</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Score</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Benchmark Avg</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gap</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: 'Code Quality', yours: result.codeQualityScore, bench: baseline.avgCodeQuality, color: 'blue' },
                    { label: 'Architecture', yours: result.architectureScore, bench: baseline.avgArchitecture, color: 'green' },
                    { label: 'Documentation', yours: result.documentationScore, bench: baseline.avgDocumentation, color: 'yellow' },
                    { label: 'Testing', yours: result.testingScore, bench: baseline.avgTesting, color: 'purple' },
                  ].map((metric) => {
                    const gap = (metric.yours || 0) - metric.bench;
                    const pct = metric.bench > 0 ? Math.min(((metric.yours || 0) / metric.bench) * 100, 150) : 0;
                    return (
                      <tr key={metric.label} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-sm text-slate-900">{metric.label}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-lg font-bold text-slate-900">{(metric.yours || 0).toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-lg font-medium text-slate-500">{metric.bench.toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-sm font-bold ${getGapColor(gap)}`}>
                            {gap >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-slate-200 rounded-full h-2.5 relative">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                pct >= 100 ? 'bg-green-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                            {/* Benchmark marker */}
                            <div className="absolute top-0 h-2.5 w-0.5 bg-slate-800" style={{ left: `${Math.min((100 / 150) * 100, 100)}%` }} />
                          </div>
                          <p className="text-xs text-slate-500 mt-1 text-center">{pct.toFixed(0)}% of benchmark</p>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Overall row */}
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-4 text-sm text-slate-900">Overall Score</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xl font-bold text-slate-900">{result.overallScore.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xl font-medium text-slate-500">{baseline.avgOverallScore.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const gap = result.overallScore - baseline.avgOverallScore;
                        return (
                          <span className={`inline-flex items-center gap-1 text-base font-bold ${getGapColor(gap)}`}>
                            {gap >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const pct = baseline.avgOverallScore > 0 ? Math.min((result.overallScore / baseline.avgOverallScore) * 100, 150) : 0;
                        return (
                          <>
                            <div className="w-full bg-slate-300 rounded-full h-3 relative">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  pct >= 100 ? 'bg-green-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-600 mt-1 text-center font-semibold">{pct.toFixed(0)}% of benchmark</p>
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-purple-900">TIER 1 (Deep Analysis)</p>
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{result.tier1Count || 0}</p>
          <p className="text-xs text-purple-700 mt-2">Production-ready projects</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-blue-900">TIER 2 (Standard)</p>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{result.tier2Count || 0}</p>
          <p className="text-xs text-blue-700 mt-2">Well-structured projects</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-yellow-900">TIER 3 (Quick)</p>
            <CheckCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{result.tier3Count || 0}</p>
          <p className="text-xs text-yellow-700 mt-2">Basic projects</p>
        </div>
      </div>
      
      {/* AI Employability Insights Section */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            <h3 className="text-lg font-bold">AI Employability Insights</h3>
          </div>
        </div>
        <div className="p-6 grid md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-indigo-900 mb-1">Employability Tier</p>
            <p className="text-2xl font-bold text-indigo-700">{result.employabilityTier || 'N/A'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-purple-900 mb-1">Recommended Level</p>
            <p className="text-2xl font-bold text-purple-700">{result.recommendedLevel || 'N/A'}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-emerald-900 mb-1">Professional Readiness</p>
            <p className="text-2xl font-bold text-emerald-700">{result.professionalReadiness ? `${result.professionalReadiness.toFixed(1)}%` : 'N/A'}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-blue-900 mb-1">Growth Potential</p>
            <p className="text-2xl font-bold text-blue-700">{result.growthPotential ? `${result.growthPotential.toFixed(1)}%` : 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Repository Analysis</h3>
        <div className="space-y-4">
          {result.repositories.map((repo, idx) => (
            <div key={idx} className={`rounded-lg border p-6 ${getTierColor(repo.tier)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <a 
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {repo.name} ↗
                  </a>
                  {repo.description && (
                    <p className="text-sm text-slate-600 mt-1">{repo.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-4 ${getTierBadgeColor(repo.tier)}`}>
                  {repo.tier}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Score</p>
                  <p className="text-2xl font-bold text-slate-900">{(repo.score || 0).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Stars</p>
                  <p className="text-2xl font-bold text-slate-900">{repo.stars}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Forks</p>
                  <p className="text-2xl font-bold text-slate-900">{repo.forks}</p>
                </div>
                {repo.neuralScore && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Neural Score</p>
                    <p className="text-2xl font-bold text-slate-900">{(repo.neuralScore || 0).toFixed(1)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-600 mb-1">Languages</p>
                  <p className="text-2xl font-bold text-slate-900">{repo.languages.length}</p>
                </div>
              </div>
              
              {/* Detailed AI Scores */}
              {(repo.codeQualityScore || repo.architectureScore) && (
                <div className="grid grid-cols-5 gap-2 mb-4 p-4 bg-white/50 rounded-lg border border-slate-200">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Code Quality</p>
                    <p className="text-lg font-bold text-blue-600">{(repo.codeQualityScore || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Architecture</p>
                    <p className="text-lg font-bold text-green-600">{(repo.architectureScore || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Documentation</p>
                    <p className="text-lg font-bold text-yellow-600">{(repo.documentationScore || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Testing</p>
                    <p className="text-lg font-bold text-purple-600">{(repo.testingScore || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Best Practices</p>
                    <p className="text-lg font-bold text-indigo-600">{(repo.bestPracticesScore || 0).toFixed(1)}</p>
                  </div>
                </div>
              )}
              {repo.languages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-600 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {repo.languages.map((lang, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 border border-slate-300">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {}
              {(repo.codeLlamaAnalysis || repo.qwenAnalysis) && (
                <div className="mt-4 pt-4 border-t border-slate-300 space-y-3">
                  {repo.codeLlamaAnalysis && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">CodeLlama Analysis</p>
                      <p className="text-sm text-slate-700 bg-white bg-opacity-50 p-3 rounded border border-slate-300">
                        {repo.codeLlamaAnalysis.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                  {repo.qwenAnalysis && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">Qwen Analysis</p>
                      <p className="text-sm text-slate-700 bg-white bg-opacity-50 p-3 rounded border border-slate-300">
                        {repo.qwenAnalysis.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
