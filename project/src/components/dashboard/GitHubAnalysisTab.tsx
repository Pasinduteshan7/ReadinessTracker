import { useState } from 'react';
import { Github, Zap, X, AlertCircle, CheckCircle, Code } from 'lucide-react';
import { AnalysisResults, type AnalysisResult } from '../AnalysisResults';
import { AlgorithmChallengePage } from '../../pages/AlgorithmChallengePage';

type GitHubSubTab = 'analysis' | 'challenges';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  currentYear: string;
  currentGpa: number;
  githubUsername?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  createdAt: number;
}

interface GitHubAnalysisTabProps {
  currentUser: Student | null;
  analysisResult: AnalysisResult | null;
  analyzeLoading: boolean;
  analysisError: string;
  onAnalyzeGitHub: (username: string) => Promise<void>;
}

export function GitHubAnalysisTab({
  currentUser,
  analysisResult,
  analyzeLoading,
  analysisError,
  onAnalyzeGitHub
}: GitHubAnalysisTabProps) {
  const [githubSubTab, setGithubSubTab] = useState<GitHubSubTab>('analysis');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');

  const handleSaveGitHubToken = () => {
    if (!githubToken.trim()) {
      alert('Please enter a valid GitHub token');
      return;
    }
    sessionStorage.setItem('githubToken', githubToken);
    setShowTokenModal(false);
    alert('✅ GitHub token saved successfully!');
  };

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => setGithubSubTab('analysis')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            githubSubTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-600 -mb-4' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Github className="w-4 h-4" />
          Repository Analysis
        </button>
        <button
          onClick={() => setGithubSubTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            githubSubTab === 'challenges' ? 'text-blue-600 border-b-2 border-blue-600 -mb-4' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4" />
          Algorithm Challenges
        </button>
      </div>

      {githubSubTab === 'analysis' ? (
        <div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Github className="w-8 h-8 text-slate-900" />
                <h2 className="text-2xl font-bold text-slate-900">GitHub Analysis</h2>
              </div>
              {sessionStorage.getItem('githubToken') && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Token Configured</span>
                </div>
              )}
            </div>
            {!sessionStorage.getItem('githubToken') && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">GitHub Token Not Configured</p>
                  <p className="text-sm text-amber-700 mb-3">
                    GitHub API has rate limits (60 requests/hour without token). To avoid hitting these limits, please add your GitHub personal access token.
                  </p>
                  <button
                    onClick={() => setShowTokenModal(true)}
                    className="text-sm font-medium text-amber-700 hover:text-amber-800 underline"
                  >
                    Add GitHub Token →
                  </button>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">GitHub Username</p>
                <p className="text-xl font-semibold text-slate-900 mb-4">{currentUser?.githubUsername || 'Not connected'}</p>
                {currentUser?.githubUsername && (
                  <a
                    href={`https://github.com/${currentUser.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Profile →
                  </a>
                )}
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Developer Readiness</p>
                <p className="text-xl font-semibold text-slate-900 mb-4">
                  {analysisResult ? `${analysisResult.overallScore.toFixed(1)}%` : 'Not analyzed yet'}
                </p>
                <p className="text-xs text-slate-600">Based on repository analysis</p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              {currentUser?.githubUsername ? (
                <>
                  <button
                    onClick={() => currentUser.githubUsername && onAnalyzeGitHub(currentUser.githubUsername)}
                    disabled={analyzeLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    {analyzeLoading ? 'Analyzing...' : 'Analyze Repository'}
                  </button>
                  {!sessionStorage.getItem('githubToken') && (
                    <button
                      onClick={() => setShowTokenModal(true)}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Github className="w-5 h-5" />
                      Configure Token
                    </button>
                  )}
                </>
              ) : (
                <p className="text-slate-600">Please connect your GitHub account to analyze repositories</p>
              )}
            </div>
          </div>
          <AnalysisResults 
            result={analysisResult} 
            loading={analyzeLoading}
            error={analysisError}
          />
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Algorithm Challenges</h2>
            <p className="text-slate-600 mb-6">Solve coding challenges at different difficulty levels. Each challenge is unique to you to prevent plagiarism.</p>
            
            <div className="mb-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 mb-2 block">Select Difficulty Level</span>
                <div className="flex gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedDifficulty(level)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        selectedDifficulty === level 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>

          {currentUser && (
            <AlgorithmChallengePage 
              userId={currentUser.id.toString()}
              difficulty={selectedDifficulty}
            />
          )}
        </div>
      )}

      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">Add GitHub Personal Access Token</h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">1</span>
                  Steps to Create a GitHub Token
                </h4>
                <ol className="space-y-3 text-sm text-blue-900 ml-8 list-decimal">
                  <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:text-blue-700 underline">GitHub Settings → Developer settings → Personal access tokens</a></li>
                  <li>Click <span className="font-semibold">"Generate new token"</span></li>
                  <li>Give your token a name (e.g., "Readiness Tracker")</li>
                  <li>Set expiration (90 days or custom)</li>
                  <li>Select scope: Check <span className="font-semibold">"repo"</span> (includes public_repo, private_repo)</li>
                  <li>Click <span className="font-semibold">"Generate token"</span></li>
                  <li>Copy the token immediately (you won't see it again!)</li>
                </ol>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">⚠️ Important:</span> Your token is stored securely in your browser session only. It will not be sent to any external servers or stored permanently.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-slate-600 mt-2">
                  Token format: Starts with "ghp_" and is about 36-40 characters long
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900 mb-2">Benefits of Adding a Token:</p>
                <ul className="text-sm text-green-900 space-y-1 ml-4 list-disc">
                  <li>Increase API rate limit from 60 to 5,000 requests/hour</li>
                  <li>Analyze more repositories without rate limit errors</li>
                  <li>Access more detailed repository information</li>
                  <li>Faster analysis results</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveGitHubToken}
                  disabled={!githubToken.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                >
                  Save Token
                </button>
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    setGithubToken('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
