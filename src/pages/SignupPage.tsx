import { useState, useContext } from 'react';
import { TrendingUp, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { studentApi, advisorApi, adminApi } from '../lib/backend-api';
import { AuthContext } from '../contexts/AuthContext';

interface SignupPageProps {
  onNavigate: (page: 'landing' | 'login') => void;
}

type Role = 'student' | 'advisor' | 'admin';

export function SignupPage({ onNavigate }: SignupPageProps) {
  const authContext = useContext(AuthContext);
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [studentData, setStudentData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    currentYear: 1,
    currentGpa: '',
    githubUsername: '',
    linkedinUrl: '',
    facebookUrl: ''
  });

  const [advisorData, setAdvisorData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: 'Computer Engineering',
    specialization: ''
  });

  const [adminData, setAdminData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('form');
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (studentData.password !== studentData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(studentData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await studentApi.register({
        name: studentData.fullName,
        email: studentData.email,
        password: studentData.password,
        registrationNumber: studentData.registrationNumber,
        currentYear: studentData.currentYear,
        currentGpa: studentData.currentGpa ? parseFloat(studentData.currentGpa) : 0,
        githubUsername: studentData.githubUsername || '',
        linkedinUrl: studentData.linkedinUrl || '',
        facebookUrl: studentData.facebookUrl || ''
      });

      setSuccess(true);
      // Store user in auth context and redirect to dashboard
      if (authContext?.setUser) {
        authContext.setUser(response);
      }
      // Redirect to dashboard by setting user role in auth context
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (advisorData.password !== advisorData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(advisorData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await advisorApi.register({
        name: advisorData.fullName,
        email: advisorData.email,
        password: advisorData.password,
        employeeId: advisorData.employeeId,
        department: advisorData.department,
        specialization: advisorData.specialization || ''
      });

      setSuccess(true);
      // Store user in auth context and redirect to dashboard
      if (authContext?.setUser) {
        authContext.setUser(response);
      }
      // Redirect to dashboard by setting user role in auth context
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminData.password !== adminData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(adminData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.register({
        name: adminData.fullName,
        email: adminData.email,
        password: adminData.password
      });

      setSuccess(true);
      // Store user in auth context and redirect to dashboard
      if (authContext?.setUser) {
        authContext.setUser(response);
      }
      // Redirect to dashboard by setting user role in auth context
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">ReadinessTracker</span>
            </button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Your Account</h1>
            <p className="text-slate-600 text-lg">Choose your role to get started</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => handleRoleSelect('student')}
              className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 hover:border-blue-500 p-8 text-center transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Student</h3>
              <p className="text-slate-600 text-sm">Track your employability readiness and career progress</p>
            </button>

            <button
              onClick={() => handleRoleSelect('advisor')}
              className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 hover:border-green-500 p-8 text-center transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Advisor</h3>
              <p className="text-slate-600 text-sm">Mentor students and monitor their progress</p>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 hover:border-orange-500 p-8 text-center transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin</h3>
              <p className="text-slate-600 text-sm">Manage the entire platform and analytics</p>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <button
            onClick={() => setStep('role')}
            className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ReadinessTracker</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {selectedRole === 'student' && 'Student Registration'}
            {selectedRole === 'advisor' && 'Advisor Registration'}
            {selectedRole === 'admin' && 'Admin Registration'}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {selectedRole === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={studentData.fullName}
                    onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    value={studentData.registrationNumber}
                    onChange={(e) => setStudentData({ ...studentData, registrationNumber: e.target.value })}
                    placeholder="CE/2024/001"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">University Email *</label>
                <input
                  type="text"
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={studentData.password}
                    onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={studentData.confirmPassword}
                    onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Year *</label>
                  <select
                    value={studentData.currentYear}
                    onChange={(e) => setStudentData({ ...studentData, currentYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current GPA (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={studentData.currentGpa}
                    onChange={(e) => setStudentData({ ...studentData, currentGpa: e.target.value })}
                    placeholder="3.50"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">GitHub Username</label>
                  <input
                    type="text"
                    value={studentData.githubUsername}
                    onChange={(e) => setStudentData({ ...studentData, githubUsername: e.target.value })}
                    placeholder="username"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    value={studentData.linkedinUrl}
                    onChange={(e) => setStudentData({ ...studentData, linkedinUrl: e.target.value })}
                    placeholder="linkedin.com/in/..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Facebook URL</label>
                  <input
                    type="text"
                    value={studentData.facebookUrl}
                    onChange={(e) => setStudentData({ ...studentData, facebookUrl: e.target.value })}
                    placeholder="facebook.com/..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Student Account'
                )}
              </button>
            </form>
          )}

          {selectedRole === 'advisor' && (
            <form onSubmit={handleAdvisorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={advisorData.fullName}
                  onChange={(e) => setAdvisorData({ ...advisorData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">University Email *</label>
                  <input
                    type="text"
                    value={advisorData.email}
                    onChange={(e) => setAdvisorData({ ...advisorData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID *</label>
                  <input
                    type="text"
                    value={advisorData.employeeId}
                    onChange={(e) => setAdvisorData({ ...advisorData, employeeId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={advisorData.password}
                    onChange={(e) => setAdvisorData({ ...advisorData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={advisorData.confirmPassword}
                    onChange={(e) => setAdvisorData({ ...advisorData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department *</label>
                <input
                  type="text"
                  value={advisorData.department}
                  onChange={(e) => setAdvisorData({ ...advisorData, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specialization (Optional)</label>
                <input
                  type="text"
                  value={advisorData.specialization}
                  onChange={(e) => setAdvisorData({ ...advisorData, specialization: e.target.value })}
                  placeholder="e.g., AI/ML, Web Development"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Advisor Account'
                )}
              </button>
            </form>
          )}

          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={adminData.fullName}
                  onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email *</label>
                <input
                  type="text"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 font-semibold transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
