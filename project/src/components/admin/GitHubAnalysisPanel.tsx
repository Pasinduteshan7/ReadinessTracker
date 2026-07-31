import { useState, useEffect } from 'react';
import { Github, Save, CheckCircle, Settings, Layers, BarChart } from 'lucide-react';
import { BatchConfigurationPanel } from './BatchConfigurationPanel';
import { BenchmarkPanel } from './BenchmarkPanel';

export function GitHubAnalysisPanel() {
  const [githubToken, setGithubToken] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'batches' | 'benchmarks'>('settings');

  useEffect(() => {
    const savedToken = localStorage.getItem('benchmark_github_token') || localStorage.getItem('githubToken') || '';
    setGithubToken(savedToken);
  }, []);

  const handleSave = () => {
    if (githubToken.trim()) {
      localStorage.setItem('benchmark_github_token', githubToken.trim());
      localStorage.setItem('githubToken', githubToken.trim());
    } else {
      localStorage.removeItem('benchmark_github_token');
      localStorage.removeItem('githubToken');
    }
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
              <Github className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">GitHub Analysis Module</h2>
              <p className="text-sm text-slate-500">Manage AI engine settings, batch jobs, and baseline benchmarks</p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white px-6">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
              activeSubTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveSubTab('batches')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
              activeSubTab === 'batches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Batch Management
          </button>
          <button
            onClick={() => setActiveSubTab('benchmarks')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
              activeSubTab === 'benchmarks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart className="w-4 h-4" />
            Benchmarks
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Authentication Settings</h3>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-1">Why is this token needed?</h4>
              <p className="text-sm text-blue-800">
                The AI Engine requires a Classic Personal Access Token to perform deep GraphQL queries on user profiles. 
                This allows the system to accurately fetch pinned repositories and bypass the strict unauthenticated rate limit of 60 requests/hour.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  System GitHub Token (Classic)
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  This token is saved in your browser and will be injected into all GitHub Analysis API calls (both for students and benchmarks).
                </p>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
                
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Saved successfully
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'batches' && (
        <BatchConfigurationPanel />
      )}

      {activeSubTab === 'benchmarks' && (
        <BenchmarkPanel />
      )}
    </div>
  );
}
