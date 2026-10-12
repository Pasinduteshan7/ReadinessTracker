import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdvisorDashboard } from './pages/AdvisorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'student-dashboard' | 'advisor-dashboard' | 'admin-dashboard';

const employabilityUrl = 'http://localhost:5174';

function EmployabilityLink() {
  return (
    <a
      href={employabilityUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium text-sm"
    >
      🎯 Employability Tracker
    </a>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    if (user) {
      setCurrentPage('dashboard');
    } else if (!loading) {
      setCurrentPage('landing');
    }
  }, [user, loading]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleAuthSuccess = () => {
    // Auth successful
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'student') {
      return (
        <>
          <StudentDashboard />
          <EmployabilityLink />
        </>
      );
    }
    if (user.role === 'advisor') {
      return (
        <>
          <AdvisorDashboard />
          <EmployabilityLink />
        </>
      );
    }
    if (user.role === 'admin') {
      return (
        <>
          <AdminDashboard />
          <EmployabilityLink />
        </>
      );
    }
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} onSuccess={handleAuthSuccess} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onNavigate={handleNavigate} />;
  }

  return <LandingPage onNavigate={handleNavigate} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;