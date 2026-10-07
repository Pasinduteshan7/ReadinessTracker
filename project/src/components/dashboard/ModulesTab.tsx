import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Brain, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart3, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { moduleMarksApi } from '../../lib/backend-api';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  currentYear: string;
  currentGpa: number;
}

interface ModulesTabProps {
  currentUser: Student | null;
}

interface ModuleItem {
  key: string;
  label: string;
  category: string;
}

const MODULE_CATEGORIES: {
  title: string;
  icon: any;
  color: string;
  badgeBg: string;
  modules: ModuleItem[];
}[] = [
  {
    title: 'Software Engineering',
    icon: Code2,
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    modules: [
      { key: 'softwareEngineeringPrinciple', label: 'Software Engineering Principle', category: 'Software Engineering' },
      { key: 'oopConcept', label: 'OOP Concepts', category: 'Software Engineering' },
      { key: 'dsa', label: 'Data Structures & Algorithms (DSA)', category: 'Software Engineering' },
      { key: 'adsa', label: 'Advanced DSA (ADSA)', category: 'Software Engineering' },
      { key: 'softwareArchitecture', label: 'Software Architecture', category: 'Software Engineering' },
      { key: 'dataBase', label: 'Database Systems', category: 'Software Engineering' },
      { key: 'gui', label: 'GUI & Frontend Development', category: 'Software Engineering' },
      { key: 'qaTesting', label: 'QA & Software Testing', category: 'Software Engineering' },
      { key: 'devops', label: 'DevOps & CI/CD', category: 'Software Engineering' },
    ],
  },
  {
    title: 'AI & Data Science',
    icon: Brain,
    color: 'text-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
    modules: [
      { key: 'ml', label: 'Machine Learning (ML)', category: 'AI & Data Science' },
      { key: 'ai', label: 'Artificial Intelligence (AI)', category: 'AI & Data Science' },
      { key: 'imageProcessing', label: 'Digital Image Processing', category: 'AI & Data Science' },
    ],
  },
  {
    title: 'Embedded Systems & Hardware',
    icon: Cpu,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    modules: [
      { key: 'embededSystem', label: 'Embedded Systems', category: 'Embedded & Hardware' },
      { key: 'analogElectronics', label: 'Analog Electronics', category: 'Embedded & Hardware' },
      { key: 'signalAndSystem', label: 'Signal & Linear Systems', category: 'Embedded & Hardware' },
      { key: 'digitalLogicDesign', label: 'Digital Logic Design', category: 'Embedded & Hardware' },
      { key: 'digitalSystemDesignWithHdl', label: 'Digital System Design with HDL', category: 'Embedded & Hardware' },
      { key: 'controlSystem', label: 'Control Systems', category: 'Embedded & Hardware' },
    ],
  },
  {
    title: 'Cyber Security & Networks',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    modules: [
      { key: 'informationSecurity', label: 'Information & Cyber Security', category: 'Security & Networks' },
      { key: 'computerNetwork', label: 'Computer Networks', category: 'Security & Networks' },
      { key: 'operatingSystemAndNetworking', label: 'OS & Networking', category: 'Security & Networks' },
    ],
  },
];

const SPECIALIZATION_DETAILS: Record<string, { advice: string; skills: string[]; roles: string[] }> = {
  Software_Development: {
    advice: 'Your strongest aptitude is in software architecture, algorithms, and application development. Focus on mastering clean architecture, modern cloud backends, and full-stack engineering.',
    skills: ['Scalable System Design', 'Full-Stack Development', 'Microservices & APIs', 'Modern CI/CD & DevOps'],
    roles: ['Software Engineer', 'Full-Stack Developer', 'Backend Architect', 'DevOps Specialist'],
  },
  AI_ML: {
    advice: 'Your highest scores align with artificial intelligence, machine learning, and data analytics. Expand on neural network architectures, computer vision, and deploying production ML pipelines.',
    skills: ['Deep Learning & PyTorch', 'Computer Vision & NLP', 'Feature Engineering & ML Ops', 'Data Science Pipelines'],
    roles: ['AI/ML Engineer', 'Data Scientist', 'Machine Learning Researcher', 'Computer Vision Engineer'],
  },
  Cyber_Security: {
    advice: 'Your profile exhibits solid intuition in networks, operating systems, and information protection. Hone your offensive and defensive security practices, penetration testing, and secure development.',
    skills: ['Network Security & Protocols', 'Threat Modeling & SOC', 'Penetration Testing', 'Cryptography & Cloud Security'],
    roles: ['Security Analyst', 'Cybersecurity Engineer', 'Penetration Tester', 'DevSecOps Engineer'],
  },
  Embedded_Systems: {
    advice: 'Your curriculum strengths demonstrate strong command in hardware-software interfaces, digital logic, and signal processing. Focus on real-time systems, IoT, and firmware development.',
    skills: ['Microcontrollers & RTOS', 'HDL & FPGA Design', 'Firmware Engineering', 'IoT & Signal Processing'],
    roles: ['Embedded Systems Engineer', 'Firmware Engineer', 'IoT Hardware Specialist', 'Robotics Systems Developer'],
  },
};

export function ModulesTab({ currentUser }: ModulesTabProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (currentUser?.id) {
      loadMarks();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadMarks = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const res = await moduleMarksApi.getStudentMarks(currentUser.id);
      setData(res && res.studentId ? res : null);
    } catch (err) {
      console.error('Failed to load module marks:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Loading Academic Modules & AI Analysis</h3>
        <p className="text-slate-500 text-sm mt-1">Retrieving verified marks and machine learning evaluation...</p>
      </div>
    );
  }

  // Empty state when advisor hasn't added marks yet
  if (!data || !data.primarySpecialization) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 text-indigo-600 shadow-sm">
          <BookOpen className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Academic Module Marks & AI Specialization
        </h3>
        <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
          Your academic advisor has not recorded your curriculum module marks yet.
          Once your marks are entered, our <strong>fine-tuned Machine Learning model</strong> will automatically analyze your performance across 21 subject areas and recommend your optimal career specialization track.
        </p>

        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>What this AI analysis provides:</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>Primary & Secondary Specializations</strong> based on weighted continuous grades</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>Category Breakdown</strong> across Software, AI, Embedded, and Security</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>Tailored Career Guidance</strong> with target industry roles & core skills to build</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Parse prediction details if available
  let parsedRankings: any[] = [];
  if (data.predictionDetailsJson) {
    try {
      const parsed = JSON.parse(data.predictionDetailsJson);
      parsedRankings = parsed.rankings || [];
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate statistics across entered marks
  let allMarksList: number[] = [];
  MODULE_CATEGORIES.forEach((cat) => {
    cat.modules.forEach((m) => {
      if (data[m.key] !== null && data[m.key] !== undefined) {
        allMarksList.push(Number(data[m.key]));
      }
    });
  });

  const averageScore = allMarksList.length > 0
    ? (allMarksList.reduce((a, b) => a + b, 0) / allMarksList.length).toFixed(1)
    : '0';

  const completedCount = allMarksList.length;
  const specAdvice = SPECIALIZATION_DETAILS[data.primarySpecialization] || SPECIALIZATION_DETAILS['Software_Development'];

  return (
    <div className="space-y-8">
      {/* 1. HERO AI PREDICTION BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Recommendation Engine • 95%+ Accuracy</span>
            </div>

            {data.updatedAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Assessed by Academic Advisor</span>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Primary & Secondary Specialization Info */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">
                  Primary Specialization Recommendation
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {data.primarySpecializationLabel || data.primarySpecialization}
                </h1>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                {specAdvice.advice}
              </p>

              {/* Confidence Meter */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xl">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Model Recommendation Confidence</span>
                  <span className="text-emerald-400 text-sm">{data.primaryConfidence?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${data.primaryConfidence || 0}%` }}
                  />
                </div>

                {data.secondarySpecialization && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Alternative Pathway: <strong className="text-white">{data.secondarySpecializationLabel || data.secondarySpecialization}</strong>
                    </span>
                    <span className="text-slate-300 font-semibold">
                      {data.secondaryConfidence?.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialization Distribution Bars */}
            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Specialization Distribution</span>
              </h4>

              <div className="space-y-3">
                {parsedRankings.map((rank: any, idx: number) => {
                  const isTop = idx === 0;
                  return (
                    <div key={rank.specialization} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isTop ? 'text-white' : 'text-slate-300'}`}>
                          {rank.label}
                        </span>
                        <span className={`font-bold ${isTop ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {rank.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-slate-600'
                          }`}
                          style={{ width: `${rank.confidence}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CAREER PATHWAYS & RECOMMENDED SKILLS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recommended Target Roles</h3>
              <p className="text-xs text-slate-500">Industry positions matched to your specialization</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {specAdvice.roles.map((role, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Key Competencies to Strengthen</h3>
              <p className="text-xs text-slate-500">High-leverage skills for career advancement</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {specAdvice.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-700 rounded-xl"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ACADEMIC OVERVIEW SUMMARY CARDS */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Mark</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{averageScore}%</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Across curriculum
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modules Graded</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{completedCount}</span>
            <span className="text-xs text-slate-400">/ 21 total</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Standing</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-indigo-700">
              {Number(averageScore) >= 75 ? 'First Class' : Number(averageScore) >= 65 ? 'Upper Second' : 'Good Standing'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. MODULE MARKS BREAKDOWN BY DOMAIN */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Curriculum Marks Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified examination marks recorded by your academic advisor
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {MODULE_CATEGORIES.map((cat) => (
              <button
                key={cat.title}
                onClick={() => setSelectedCategory(cat.title)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCategory === cat.title
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Sections */}
        <div className="space-y-6">
          {MODULE_CATEGORIES.filter(
            (cat) => selectedCategory === 'all' || selectedCategory === cat.title
          ).map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-slate-100 ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{cat.title}</h4>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.modules.map((m) => {
                    const score = data[m.key];
                    const hasScore = score !== null && score !== undefined;
                    const numScore = hasScore ? Number(score) : 0;

                    let gradeBadge = 'bg-slate-100 text-slate-500';
                    let gradeLetter = '—';
                    if (hasScore) {
                      if (numScore >= 75) {
                        gradeBadge = 'bg-emerald-100 text-emerald-800';
                        gradeLetter = 'A';
                      } else if (numScore >= 60) {
                        gradeBadge = 'bg-blue-100 text-blue-800';
                        gradeLetter = 'B';
                      } else if (numScore >= 45) {
                        gradeBadge = 'bg-amber-100 text-amber-800';
                        gradeLetter = 'C';
                      } else {
                        gradeBadge = 'bg-rose-100 text-rose-800';
                        gradeLetter = 'S';
                      }
                    }

                    return (
                      <div
                        key={m.key}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm flex flex-col justify-between space-y-2 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1" title={m.label}>
                            {m.label}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${gradeBadge}`}>
                            {gradeLetter}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between text-xs mb-1">
                            <span className="text-slate-400 font-medium">Marks</span>
                            <span className="font-extrabold text-slate-900">
                              {hasScore ? `${numScore.toFixed(0)} / 100` : 'Not Assessed'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                numScore >= 75
                                  ? 'bg-emerald-500'
                                  : numScore >= 60
                                  ? 'bg-blue-500'
                                  : numScore >= 45
                                  ? 'bg-amber-500'
                                  : 'bg-rose-400'
                              }`}
                              style={{ width: `${hasScore ? numScore : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
