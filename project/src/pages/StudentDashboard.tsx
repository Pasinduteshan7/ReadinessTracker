import { useState, useEffect } from 'react';
import { TrendingUp, LogOut, BarChart3, User, Trophy, Github, MessageSquare, BookOpen, Briefcase } from 'lucide-react';
import { studentApi } from '../lib/backend-api';
import { type AnalysisResult } from '../components/AnalysisResults';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { ProfileTab } from '../components/dashboard/ProfileTab';
import { AllStudentsTab } from '../components/dashboard/AllStudentsTab';
import { GitHubAnalysisTab } from '../components/dashboard/GitHubAnalysisTab';
import { SocialMediaTab } from '../components/dashboard/SocialMediaTab';
import { ModulesTab } from '../components/dashboard/ModulesTab';
import { IndustryDemandTab } from '../components/dashboard/IndustryDemandTab';

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

        {activeTab === 'overview' && <OverviewTab currentUser={currentUser} allStudents={allStudents} />}
        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
        {activeTab === 'students' && <AllStudentsTab allStudents={allStudents} />}
        {activeTab === 'github' && (
          <GitHubAnalysisTab
            currentUser={currentUser}
            analysisResult={analysisResult}
            analyzeLoading={analyzeLoading}
            analysisError={analysisError}
            onAnalyzeGitHub={handleAnalyzeGitHub}
          />
        )}
        {activeTab === 'social' && <SocialMediaTab currentUser={currentUser} />}
        {activeTab === 'modules' && <ModulesTab />}
        {activeTab === 'industry' && <IndustryDemandTab />}
      </div>
    </div>
  );
}
