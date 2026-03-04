import { useState, useEffect } from 'react';
import {
  TrendingUp,
  LogOut,
  User,
  Target,
  BookOpen,
  Trophy,
  Github,
  Facebook,
  BarChart3,
  Code,
  Briefcase,
  MessageSquare,
  Zap,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { studentApi } from '../lib/backend-api';
import { AnalysisResults, type AnalysisResult } from '../components/AnalysisResults';
type TabKey = 'overview' | 'profile' | 'students' | 'github' | 'social' | 'modules' | 'industry';
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
export function StudentDashboard() {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        await fetchAnalysisResults(user.id, user.githubUsername);
      }

      const students = await studentApi.getAllStudents();
      setAllStudents(students);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchAnalysisResults = async (userId: number, githubUsername: string) => {
    try {
      if (!githubUsername) return;
      const response = await fetch(`http://localhost:8080/api/github/results?username=${githubUsername}&userId=${userId}`);
      if (response.ok) {
        const results = await response.json();
        setAnalysisResult(results);
        setAnalysisError('');
      }
    } catch (err: any) {
      console.log('No results yet:', err.message);

    }
  };
  const handleSignOut = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  const handleAnalyzeGitHub = async (githubUsername: string) => {
    try {
      setAnalyzeLoading(true);
      setAnalysisError('');
      console.log('Current user object:', currentUser);
      console.log('User ID:', currentUser?.id);
      if (!currentUser?.id) {
        throw new Error('User ID not found. Current user: ' + JSON.stringify(currentUser));
      }

      const savedToken = sessionStorage.getItem('githubToken');

      const response = await fetch('http://localhost:8080/api/github/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          githubUsername: githubUsername,
          userId: currentUser.id,
          githubToken: savedToken || ''
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log('Analysis started:', result);

      setAnalyzeLoading(true);
      let attempts = 0;
      const maxAttempts = 40;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const resultsResponse = await fetch(
            `http://localhost:8080/api/github/results?username=${githubUsername}&userId=${currentUser.id}`
          );
          if (resultsResponse.ok) {
            const results = await resultsResponse.json();
            if (results) {
              setAnalysisResult(results);
              setAnalysisError('');
              clearInterval(pollInterval);
              setAnalyzeLoading(false);
              alert('✅ Analysis completed successfully!');
            }
          }
        } catch (err) {
          console.log('Still waiting for results...');
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setAnalyzeLoading(false);
          setAnalysisError('Analysis is taking longer than expected. Please refresh the page in a moment to see results.');
        }
      }, 3000);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to start analysis');
      setAnalyzeLoading(false);
      alert('Error: ' + (err.message || 'Failed to start analysis'));
    }
  };
  const handleSaveGitHubToken = () => {
    if (!githubToken.trim()) {
      alert('Please enter a valid GitHub token');
      return;
    }
    sessionStorage.setItem('githubToken', githubToken);
    setTokenSaved(true);
    setShowTokenModal(false);
    alert('✅ GitHub token saved successfully!');
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50">
      {}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">ReadinessTracker</h1>
              <p className="text-xs text-slate-500">Student Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            )}
            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {}
        <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'students', label: 'All Students', icon: Trophy },
            { id: 'github', label: 'GitHub Analysis', icon: Github },
            { id: 'social', label: 'Social Media', icon: MessageSquare },
            { id: 'modules', label: 'Modules', icon: BookOpen },
            { id: 'industry', label: 'Industry Demand', icon: Briefcase },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabKey)}
              className={`flex items-center gap-2 px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id ? 'text-blue-600 border-b-2 border-blue-600 -mb-4' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
        {}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{allStudents.length}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Your GPA</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{currentUser?.currentGpa ?? 'N/A'}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Current Year</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{currentUser?.currentYear ?? 'N/A'}</p>
                  </div>
                  <Target className="w-12 h-12 text-purple-600 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        )}
        {}
        {activeTab === 'profile' && currentUser && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <p className="text-lg font-semibold text-slate-900">{currentUser.name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <p className="text-lg font-semibold text-slate-900">{currentUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Registration Number</label>
                <p className="text-lg font-semibold text-slate-900">{currentUser.registrationNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Current Year</label>
                <p className="text-lg font-semibold text-slate-900">{currentUser.currentYear}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">GPA</label>
                <p className="text-lg font-semibold text-slate-900">{currentUser.currentGpa}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">GitHub</label>
                <p className="text-lg font-semibold text-slate-900">{currentUser.githubUsername || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}
        {}
        {activeTab === 'github' && (
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
              {}
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
                      onClick={() => handleAnalyzeGitHub(currentUser.githubUsername)}
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
            {}
            <AnalysisResults 
              result={analysisResult} 
              loading={analyzeLoading}
              error={analysisError}
            />
          </div>
        )}
        {}
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
                {}
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
                {}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <span className="font-semibold">⚠️ Important:</span> Your token is stored securely in your browser session only. It will not be sent to any external servers or stored permanently.
                  </p>
                </div>
                {}
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
                {}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-2">Benefits of Adding a Token:</p>
                  <ul className="text-sm text-green-900 space-y-1 ml-4 list-disc">
                    <li>Increase API rate limit from 60 to 5,000 requests/hour</li>
                    <li>Analyze more repositories without rate limit errors</li>
                    <li>Access more detailed repository information</li>
                    <li>Faster analysis results</li>
                  </ul>
                </div>
                {}
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
        {}
        {activeTab === 'social' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-slate-900" />
              <h2 className="text-2xl font-bold text-slate-900">Social Media Analysis</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">LinkedIn</h3>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  {currentUser?.linkedinUrl ? 'Connected' : 'Not connected'}
                </p>
                {currentUser?.linkedinUrl && (
                  <a
                    href={currentUser.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Profile →
                  </a>
                )}
              </div>
              <div className="border border-slate-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-slate-900">Facebook</h3>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  {currentUser?.facebookUrl ? 'Connected' : 'Not connected'}
                </p>
                {currentUser?.facebookUrl && (
                  <a
                    href={currentUser.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Profile →
                  </a>
                )}
              </div>
            </div>
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Professional Online Presence</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Profile completeness: <span className="font-semibold text-slate-900">Not calculated yet</span></p>
                <p>• Recommended: Add professional photo, complete bio, and endorsements</p>
              </div>
            </div>
          </div>
        )}
        {}
        {activeTab === 'modules' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-slate-900" />
              <h2 className="text-2xl font-bold text-slate-900">Module Progress</h2>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Data Structures', progress: 90, status: 'Completed' },
                { name: 'Web Development', progress: 75, status: 'In Progress' },
                { name: 'Machine Learning', progress: 60, status: 'In Progress' },
                { name: 'Database Design', progress: 85, status: 'Completed' },
                { name: 'Cloud Computing', progress: 45, status: 'In Progress' },
              ].map((module, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{module.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      module.status === 'Completed' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {module.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{module.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {}
        {activeTab === 'industry' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-8 h-8 text-slate-900" />
              <h2 className="text-2xl font-bold text-slate-900">Industry Demand Analysis</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <p className="text-sm text-slate-600 mb-2">Skill Match</p>
                <p className="text-lg font-semibold text-slate-900">Not calculated yet</p>
                <p className="text-xs text-slate-600 mt-1">Your skills match current job market demands</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <p className="text-sm text-slate-600 mb-2">Industry Readiness</p>
                <p className="text-lg font-semibold text-slate-900">Not calculated yet</p>
                <p className="text-xs text-slate-600 mt-1">Based on trending technologies</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Most Demanded Skills</h3>
              {[
                { skill: 'Python', level: 'Excellent' },
                { skill: 'JavaScript/React', level: 'Excellent' },
                { skill: 'Cloud (AWS/GCP)', level: 'Good' },
                { skill: 'Data Analysis', level: 'Good' },
                { skill: 'DevOps', level: 'Average' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">{item.skill}</p>
                    <p className="text-xs text-slate-500">Demand: {item.level}</p>
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Not calculated yet</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">All Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Registration #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Year</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{student.registrationNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{student.currentYear}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{student.currentGpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
