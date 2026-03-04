import { useState, useEffect } from 'react';
import { TrendingUp, LogOut, Users, Award } from 'lucide-react';
import { studentApi, advisorApi, adminApi } from '../lib/backend-api';
interface Admin {
  id: number;
  name: string;
  email: string;
}
interface Stats {
  totalStudents: number;
  totalAdvisors: number;
  totalAdmins: number;
  averageGPA: number;
}
export function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalAdvisors: 0,
    totalAdmins: 0,
    averageGPA: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      }

      const [studentsList, advisorsList, adminsList] = await Promise.all([
        studentApi.getAllStudents(),
        advisorApi.getAllAdvisors(),
        adminApi.getAllAdmins()
      ]);
      const avgGPA = studentsList.length > 0
        ? studentsList.reduce((acc, s) => acc + s.currentGpa, 0) / studentsList.length
        : 0;
      setStats({
        totalStudents: studentsList.length,
        totalAdvisors: advisorsList.length,
        totalAdmins: adminsList.length,
        averageGPA: avgGPA
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSignOut = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">ReadinessTracker</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-red-600 transition-colors"
            >
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
          <p className="text-slate-600">System-wide statistics and overview</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalStudents}</p>
            <p className="text-slate-600 text-sm">Total Students</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalAdvisors}</p>
            <p className="text-slate-600 text-sm">Total Advisors</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalAdmins}</p>
            <p className="text-slate-600 text-sm">Total Admins</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.averageGPA.toFixed(2)}</p>
            <p className="text-slate-600 text-sm">Average Student GPA</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">System Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Total Active Users</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalStudents + stats.totalAdvisors + stats.totalAdmins}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Student to Advisor Ratio</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalAdvisors > 0 ? (stats.totalStudents / stats.totalAdvisors).toFixed(1) : 0}:1
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Highest Performing Students</p>
                <p className="text-2xl font-bold text-slate-900">4.0+ GPA</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
