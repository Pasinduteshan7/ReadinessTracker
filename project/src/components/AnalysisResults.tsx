import { 
  TrendingUp, 
  Code, 
  GitBranch, 
  Star, 
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader
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
