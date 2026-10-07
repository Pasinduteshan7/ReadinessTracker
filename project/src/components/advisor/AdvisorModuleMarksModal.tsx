import { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Sparkles, 
  Cpu, 
  Code2, 
  ShieldCheck, 
  Brain, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Wand2 
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

interface AdvisorModuleMarksModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'Software Engineering', label: 'Software Engineering', icon: Code2 },
  { id: 'AI & Data Science', label: 'AI & Data Science', icon: Brain },
  { id: 'Embedded & Hardware', label: 'Embedded & Hardware', icon: Cpu },
  { id: 'Security & Networks', label: 'Security & Networks', icon: ShieldCheck },
];

const MODULE_LIST = [
  // Software Engineering
  { key: 'softwareEngineeringPrinciple', label: 'Software Engineering Principle', category: 'Software Engineering' },
  { key: 'oopConcept', label: 'OOP Concepts', category: 'Software Engineering' },
  { key: 'dsa', label: 'Data Structures & Algorithms (DSA)', category: 'Software Engineering' },
  { key: 'adsa', label: 'Advanced DSA (ADSA)', category: 'Software Engineering' },
  { key: 'softwareArchitecture', label: 'Software Architecture', category: 'Software Engineering' },
  { key: 'dataBase', label: 'Database Systems', category: 'Software Engineering' },
  { key: 'gui', label: 'GUI & Frontend Development', category: 'Software Engineering' },
  { key: 'qaTesting', label: 'QA & Software Testing', category: 'Software Engineering' },
  { key: 'devops', label: 'DevOps & CI/CD', category: 'Software Engineering' },

  // AI & Data Science
  { key: 'ml', label: 'Machine Learning (ML)', category: 'AI & Data Science' },
  { key: 'ai', label: 'Artificial Intelligence (AI)', category: 'AI & Data Science' },
  { key: 'imageProcessing', label: 'Digital Image Processing', category: 'AI & Data Science' },

  // Embedded & Hardware
  { key: 'embededSystem', label: 'Embedded Systems', category: 'Embedded & Hardware' },
  { key: 'analogElectronics', label: 'Analog Electronics', category: 'Embedded & Hardware' },
  { key: 'signalAndSystem', label: 'Signal & Linear Systems', category: 'Embedded & Hardware' },
  { key: 'digitalLogicDesign', label: 'Digital Logic Design', category: 'Embedded & Hardware' },
  { key: 'digitalSystemDesignWithHdl', label: 'Digital System Design with HDL', category: 'Embedded & Hardware' },
  { key: 'controlSystem', label: 'Control Systems', category: 'Embedded & Hardware' },

  // Security & Networks
  { key: 'informationSecurity', label: 'Information & Cyber Security', category: 'Security & Networks' },
  { key: 'computerNetwork', label: 'Computer Networks', category: 'Security & Networks' },
  { key: 'operatingSystemAndNetworking', label: 'OS & Networking', category: 'Security & Networks' },
];

export function AdvisorModuleMarksModal({
  student,
  isOpen,
  onClose,
  onSaved,
}: AdvisorModuleMarksModalProps) {
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen && student) {
      loadStudentMarks();
    }
  }, [isOpen, student]);

  const loadStudentMarks = async () => {
    try {
      setFetching(true);
      setError('');
      setSuccessResult(null);
      const data = await moduleMarksApi.getStudentMarks(student.id);
      if (data && data.studentId) {
        const initialMarks: Record<string, string> = {};
        MODULE_LIST.forEach((m) => {
          if (data[m.key] !== null && data[m.key] !== undefined) {
            initialMarks[m.key] = String(data[m.key]);
          }
        });
        setMarks(initialMarks);
        if (data.primarySpecialization) {
          setSuccessResult(data);
        }
      } else {
        setMarks({});
      }
    } catch (err: any) {
      console.error('Failed to load student marks:', err);
      setMarks({});
    } finally {
      setFetching(false);
    }
  };

  const handleMarkChange = (key: string, value: string) => {
    if (value === '' || (/^\d*\.?\d*$/.test(value) && Number(value) <= 100)) {
      setMarks((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleApplyPreset = (preset: 'se' | 'ai' | 'hardware' | 'security') => {
    const newMarks: Record<string, string> = {};
    MODULE_LIST.forEach((m) => {
      let score = 65;
      if (preset === 'se' && m.category === 'Software Engineering') {
        score = 88;
      } else if (preset === 'ai' && m.category === 'AI & Data Science') {
        score = 92;
      } else if (preset === 'hardware' && m.category === 'Embedded & Hardware') {
        score = 89;
      } else if (preset === 'security' && m.category === 'Security & Networks') {
        score = 90;
      }
      newMarks[m.key] = String(score);
    });
    setMarks(newMarks);
  };

  const handleSaveAndPredict = async () => {
    try {
      setLoading(true);
      setError('');

      const numericPayload: Record<string, number | null> = {};
      MODULE_LIST.forEach((m) => {
        const val = marks[m.key];
        numericPayload[m.key] = val !== undefined && val !== '' ? parseFloat(val) : null;
      });

      const response = await moduleMarksApi.saveStudentMarks(student.id, numericPayload);
      setSuccessResult(response);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save marks and generate prediction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredModules =
    activeCategory === 'all'
      ? MODULE_LIST
      : MODULE_LIST.filter((m) => m.category === activeCategory);

  const filledCount = Object.values(marks).filter((v) => v !== '').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Academic Module Marks & AI Predictor</h2>
              <p className="text-xs text-slate-300">
                Student: <span className="font-semibold text-white">{student.name}</span> ({student.registrationNumber}) • GPA: {student.currentGpa.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              <Wand2 className="w-4 h-4 text-indigo-600" />
              <span>Quick Test Presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('se')}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors"
              >
                High Software Dev
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('ai')}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 rounded-lg transition-colors"
              >
                High AI / ML
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('hardware')}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 rounded-lg transition-colors"
              >
                High Embedded
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('security')}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 rounded-lg transition-colors"
              >
                High Cyber Security
              </button>
              <button
                type="button"
                onClick={() => setMarks({})}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Live Prediction Result Card if available */}
          {successResult && successResult.primarySpecialization && (
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    ML Recommended Specialization Result
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Model Accuracy 95%+
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-indigo-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Primary Specialization</p>
                  <p className="text-base font-bold text-indigo-950 mt-0.5">
                    {successResult.primarySpecializationLabel || successResult.primarySpecialization}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${successResult.primaryConfidence || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-indigo-700">
                      {successResult.primaryConfidence?.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {successResult.secondarySpecialization && (
                  <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-indigo-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Secondary Specialization</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {successResult.secondarySpecializationLabel || successResult.secondarySpecialization}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-slate-500 h-2 rounded-full"
                          style={{ width: `${successResult.secondaryConfidence || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {successResult.secondaryConfidence?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex gap-2 overflow-x-auto">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filledCount}/21 marks entered
            </span>
          </div>

          {/* Module Inputs Grid */}
          {fetching ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading student module records...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredModules.map((m) => {
                const val = marks[m.key] || '';
                const numVal = parseFloat(val);
                return (
                  <div
                    key={m.key}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white transition-all flex items-center justify-between gap-3 shadow-sm hover:shadow"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate" title={m.label}>
                        {m.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {m.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          placeholder="—"
                          value={val}
                          onChange={(e) => handleMarkChange(m.key, e.target.value)}
                          className="w-16 px-2.5 py-1.5 text-center text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                      <span className="text-xs text-slate-400">/100</span>
                      {val !== '' && !isNaN(numVal) && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            numVal >= 75
                              ? 'bg-green-100 text-green-700'
                              : numVal >= 55
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {numVal >= 75 ? 'A' : numVal >= 60 ? 'B' : numVal >= 45 ? 'C' : 'S'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-slate-500">
            Unfilled modules will automatically use training averages in ML model.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndPredict}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running ML Model...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Marks & Predict</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
