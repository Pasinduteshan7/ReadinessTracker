import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  BarChart3,
  Award,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase
} from 'lucide-react';
interface LandingPageProps {
  onNavigate: (page: 'login' | 'signup') => void;
}
export function LandingPage({ onNavigate }: LandingPageProps) {
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    setStatsVisible(true);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ReadinessTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-lg shadow-blue-600/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Real-Time Employability Tracking
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Track Your Path to
              <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Career Success
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Comprehensive employability readiness platform for Computer Engineering students. Monitor your skills, projects, and industry alignment in real-time.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-600/50 flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 hover:bg-white font-semibold transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Your Readiness Score</p>
                  <p className="text-4xl font-bold text-slate-900">85<span className="text-2xl text-slate-400">/100</span></p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Technical Skills</span>
                    <span className="font-semibold text-slate-900">90%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Projects</span>
                    <span className="font-semibold text-slate-900">85%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Industry Alignment</span>
                    <span className="font-semibold text-slate-900">78%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl opacity-60"></div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {statsVisible && [
            { value: '500+', label: 'Active Students', icon: Users },
            { value: '87%', label: 'Avg. Readiness Score', icon: TrendingUp },
            { value: '92%', label: 'Placement Rate', icon: Briefcase }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 text-center shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
              <p className="text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Powerful Features for Your Success
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to track, improve, and showcase your employability readiness
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: 'Real-Time Tracking',
              description: 'Monitor your employability score in real-time as you add skills, projects, and experiences',
              color: 'from-blue-500 to-blue-600'
            },
            {
              icon: BarChart3,
              title: 'Skill Gap Analysis',
              description: 'Identify missing skills based on current industry demands and job requirements',
              color: 'from-green-500 to-green-600'
            },
            {
              icon: Award,
              title: 'Competitive Rankings',
              description: 'See how you stack up against your peers with year-wise and overall rankings',
              color: 'from-yellow-500 to-yellow-600'
            },
            {
              icon: TrendingUp,
              title: 'Progress Analytics',
              description: 'Visualize your growth over time with detailed charts and insights',
              color: 'from-purple-500 to-purple-600'
            },
            {
              icon: Users,
              title: 'Advisor Mentorship',
              description: 'Connect with advisors who track your progress and provide personalized guidance',
              color: 'from-pink-500 to-pink-600'
            },
            {
              icon: GraduationCap,
              title: 'Industry Alignment',
              description: 'Stay updated with trending skills and technologies demanded by top companies',
              color: 'from-orange-500 to-orange-600'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Boost Your Career Prospects?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of students who are tracking their progress and landing their dream jobs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('signup')}
              className="group px-8 py-4 bg-white text-blue-700 rounded-lg hover:bg-blue-50 font-semibold transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-100">
            {['No credit card required', 'Free forever', 'Setup in 2 minutes'].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ReadinessTracker</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering Computer Engineering students with real-time employability insights and career readiness tracking.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">Login</button></li>
                <li><button onClick={() => onNavigate('signup')} className="hover:text-white transition-colors">Sign Up</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">For Universities</h3>
              <p className="text-sm leading-relaxed mb-4">
                Computer Engineering Department
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 ReadinessTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
