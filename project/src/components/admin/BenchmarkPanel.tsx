import { useState, useEffect } from 'react';
import { Plus, Trash2, Play, RefreshCw, Users, TrendingUp, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import { benchmarkApi } from '../../lib/backend-api';

interface BenchmarkAccount {
  id: number;
  fullName: string;
  githubUsername: string;
  graduationYear: number;
  outcomeLabel: string;
  companyRole: string;
  consentConfirmed: boolean;
  analysisStatus: string;
  errorMessage: string | null;
  lastAnalyzedAt: string | null;
  createdAt: string;
  codeQuality?: number;
  architecture?: number;
  documentation?: number;
  testing?: number;
  bestPractices?: number;
  overallScore?: number;
}

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

const OUTCOME_LABELS = [
  { value: 'HIRED_TOP_COMPANY', label: 'Hired - Top Company' },
  { value: 'HIRED_GOOD_COMPANY', label: 'Hired - Good Company' },
  { value: 'HIRED_AVERAGE', label: 'Hired - Average' },
  { value: 'FREELANCE_SELF_EMPLOYED', label: 'Freelance / Self-Employed' },
];

export function BenchmarkPanel() {
  const [accounts, setAccounts] = useState<BenchmarkAccount[]>([]);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState<Set<number>>(new Set());
  const [analyzingAll, setAnalyzingAll] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    githubUsername: '',
    graduationYear: new Date().getFullYear(),
    outcomeLabel: 'HIRED_GOOD_COMPANY',
    companyRole: '',
    consentConfirmed: false,
    personalGithubToken: '',
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, baselineData] = await Promise.all([
        benchmarkApi.getAllBenchmarks(),
        benchmarkApi.getBaseline(),
      ]);
      setAccounts(accountsData);
      setBaseline(baselineData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load benchmark data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim() || !formData.githubUsername.trim()) {
      setFormError('Full name and GitHub username are required');
      return;
    }
    if (!formData.consentConfirmed) {
      setFormError('Please confirm consent before adding');
      return;
    }

    try {
      setFormSubmitting(true);
      await benchmarkApi.addBenchmark({
        fullName: formData.fullName,
        githubUsername: formData.githubUsername,
        graduationYear: formData.graduationYear,
        outcomeLabel: formData.outcomeLabel,
        companyRole: formData.companyRole,
        consentConfirmed: formData.consentConfirmed,
        personalGithubToken: formData.personalGithubToken
      });
      
      setFormData(prev => ({
        ...prev,
        fullName: '',
        githubUsername: '',
        graduationYear: new Date().getFullYear(),
        outcomeLabel: 'HIRED_GOOD_COMPANY',
        companyRole: '',
        consentConfirmed: false,
        personalGithubToken: '',
      }));
      setShowAddForm(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add benchmark account');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the benchmark account for "${name}"?`)) return;
    try {
      await benchmarkApi.deleteBenchmark(id);
      await loadData();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleAnalyze = async (id: number) => {
    try {
      setAnalyzingIds(prev => new Set(prev).add(id));
      const currentToken = localStorage.getItem('benchmark_github_token') || localStorage.getItem('githubToken') || '';
      await benchmarkApi.analyzeBenchmark(id, currentToken);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const updatedAccounts = await benchmarkApi.getAllBenchmarks();
          setAccounts(updatedAccounts);
          const account = updatedAccounts.find((a: BenchmarkAccount) => a.id === id);
          if (account && account.analysisStatus !== 'ANALYZING') {
            clearInterval(pollInterval);
            setAnalyzingIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            const updatedBaseline = await benchmarkApi.getBaseline();
            setBaseline(updatedBaseline);
          }
        } catch {
          // Continue polling
        }
      }, 5000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setAnalyzingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300000);
    } catch (err: any) {
      alert('Failed to start analysis: ' + err.message);
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAnalyzeAll = async () => {
    try {
      setAnalyzingAll(true);
      const currentToken = localStorage.getItem('benchmark_github_token') || localStorage.getItem('githubToken') || '';
      await benchmarkApi.analyzeAllBenchmarks(currentToken);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const updatedAccounts = await benchmarkApi.getAllBenchmarks();
          setAccounts(updatedAccounts);
          const allDone = updatedAccounts.every(
            (a: BenchmarkAccount) => a.analysisStatus !== 'ANALYZING'
          );
          if (allDone) {
            clearInterval(pollInterval);
            setAnalyzingAll(false);
            const updatedBaseline = await benchmarkApi.getBaseline();
            setBaseline(updatedBaseline);
          }
        } catch {
          // Continue polling
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setAnalyzingAll(false);
      }, 600000);
    } catch (err: any) {
      alert('Failed to start batch analysis: ' + err.message);
      setAnalyzingAll(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Loader className="w-3 h-3 animate-spin" /> Analyzing
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            Pending
          </span>
        );
    }
  };

  const getOutcomeLabel = (value: string) => {
    return OUTCOME_LABELS.find(o => o.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-red-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading benchmarks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Baseline Summary */}
      {baseline && baseline.sampleSize > 0 && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-lg font-bold">Benchmark Baseline ({baseline.sampleSize} accounts)</h3>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div>
              <p className="text-emerald-100 text-xs mb-1">Code Quality</p>
              <p className="text-2xl font-bold">{baseline.avgCodeQuality.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs mb-1">Architecture</p>
              <p className="text-2xl font-bold">{baseline.avgArchitecture.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs mb-1">Documentation</p>
              <p className="text-2xl font-bold">{baseline.avgDocumentation.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs mb-1">Testing</p>
              <p className="text-2xl font-bold">{baseline.avgTesting.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs mb-1">Best Practices</p>
              <p className="text-2xl font-bold">{baseline.avgBestPractices.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs mb-1">Overall Avg</p>
              <p className="text-2xl font-bold">{baseline.avgOverallScore.toFixed(1)}</p>
            </div>
          </div>
          <p className="text-emerald-200 text-xs mt-3">Score spread (σ): ±{baseline.scoreSpread.toFixed(1)}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Benchmark Accounts</h3>
        <div className="flex gap-3">
          <button
            onClick={handleAnalyzeAll}
            disabled={analyzingAll || accounts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${analyzingAll ? 'animate-spin' : ''}`} />
            {analyzingAll ? 'Analyzing All...' : 'Re-analyze All'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Benchmark Account
          </button>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add Benchmark Account</h3>
              <button onClick={() => { setShowAddForm(false); setFormError(''); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">GitHub Username *</label>
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                  placeholder="e.g. johndoe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Outcome</label>
                  <select
                    value={formData.outcomeLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, outcomeLabel: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    {OUTCOME_LABELS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">Company / Role (optional)</label>
                <input
                  type="text"
                  value={formData.companyRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyRole: e.target.value }))}
                  placeholder="e.g. Software Engineer at Google"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-900 mb-1">Personal GitHub Token (Optional)</label>
                <p className="text-xs text-slate-500 mb-2">If provided, the AI engine will use this specific token to authenticate just for this account. This can bypass API rate limits and access their private repos if authorized.</p>
                <input
                  type="password"
                  value={formData.personalGithubToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalGithubToken: e.target.value }))}
                  placeholder="ghp_..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consentConfirmed}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentConfirmed: e.target.checked }))}
                  className="mt-1 rounded border-slate-300"
                />
                <label htmlFor="consent" className="text-sm text-slate-700">
                  I confirm that this person has given consent for their public GitHub profile to be used as a benchmark reference.
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {formSubmitting ? 'Adding...' : 'Add Account'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setFormError(''); }}
                  className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      {accounts.length === 0 ? (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No benchmark accounts added yet</p>
          <p className="text-sm text-slate-500 mt-1">Add successful graduates' GitHub accounts to create a comparison baseline</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">GitHub</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Year</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Outcome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Overall</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">CQ</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Arch</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Doc</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Test</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map(account => (
                  <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm text-slate-900">{account.fullName}</p>
                      {account.companyRole && <p className="text-xs text-slate-500">{account.companyRole}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://github.com/${account.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {account.githubUsername}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{account.graduationYear}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{getOutcomeLabel(account.outcomeLabel)}</td>
                    <td className="px-4 py-3">{getStatusBadge(account.analysisStatus)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-slate-900">
                        {account.overallScore != null ? account.overallScore.toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-blue-600 font-medium">
                      {account.codeQuality != null ? account.codeQuality.toFixed(0) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">
                      {account.architecture != null ? account.architecture.toFixed(0) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-600 font-medium">
                      {account.documentation != null ? account.documentation.toFixed(0) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-purple-600 font-medium">
                      {account.testing != null ? account.testing.toFixed(0) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAnalyze(account.id)}
                          disabled={analyzingIds.has(account.id) || account.analysisStatus === 'ANALYZING'}
                          title="Analyze"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 disabled:text-gray-300 transition-colors"
                        >
                          {analyzingIds.has(account.id) || account.analysisStatus === 'ANALYZING' ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(account.id, account.fullName)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
