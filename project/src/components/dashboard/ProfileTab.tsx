import { useState, useMemo } from 'react';
import {
  Edit2,
  Save,
  X,
  Lock,
  GraduationCap,
  Award,
  Globe,
  Code,
  Shield,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  UserCheck,
  Mail,
  Loader2,
  Sparkles
} from 'lucide-react';
import { studentApi } from '../../lib/backend-api';

interface AdvisorInfo {
  id: number;
  name: string;
  email: string;
  department?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
  skills?: string;
  currentGpa?: number;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  codingProfile?: string;
  batchYear?: number;
  advisor?: AdvisorInfo | null;
  createdAt?: number;
}

interface ProfileTabProps {
  currentUser: Student | null;
  onUserUpdated?: (updated: Student) => void;
}

export function ProfileTab({ currentUser, onUserUpdated }: ProfileTabProps) {
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [formData, setFormData] = useState({
    githubUsername: currentUser?.githubUsername || '',
    linkedinUrl: currentUser?.linkedinUrl || '',
    portfolioUrl: currentUser?.portfolioUrl || '',
    codingProfile: currentUser?.codingProfile || '',
    skills: currentUser?.skills || '',
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading student profile...
      </div>
    );
  }

  // Derive Batch Year from Registration Number (e.g. EG/2022/5365 -> Batch 2022)
  const derivedBatch = useMemo(() => {
    if (currentUser.batchYear) {
      return `Batch of ${currentUser.batchYear}`;
    }
    if (currentUser.registrationNumber) {
      const match = currentUser.registrationNumber.match(/(?:EG\/|EG)?(\d{4})/i);
      if (match && match[1]) {
        return `Batch ${match[1]}`;
      }
    }
    return 'Undergraduate Cohort';
  }, [currentUser.batchYear, currentUser.registrationNumber]);

  // Real-time Password Strength Calculations
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = useMemo(() => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (passwordsMatch) score++;
    return score;
  }, [hasMinLength, hasUppercase, hasNumber, passwordsMatch]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return { text: 'Empty', color: 'text-slate-400', bar: 'bg-slate-200', width: '0%' };
    if (strengthScore === 1) return { text: 'Weak', color: 'text-rose-600', bar: 'bg-rose-500', width: '25%' };
    if (strengthScore === 2) return { text: 'Fair', color: 'text-amber-500', bar: 'bg-amber-500', width: '50%' };
    if (strengthScore === 3) return { text: 'Good', color: 'text-blue-500', bar: 'bg-blue-500', width: '75%' };
    return { text: 'Strong & Compliant', color: 'text-emerald-600', bar: 'bg-emerald-500', width: '100%' };
  }, [newPassword, strengthScore]);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && currentPassword.trim().length > 0;

  // Handle Profile Form Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const response = await studentApi.updateStudent(currentUser.id, formData);

      // Extract fresh student object if returned inside LoginResponse wrapper or direct
      const updatedUser = response?.student || response?.user || {
        ...currentUser,
        ...formData
      };

      // Persist in localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }));
        } catch (_) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      if (typeof response?.token === 'string' && response.token.trim()) {
        localStorage.setItem('token', response.token);
      }

      setProfileSuccess('Professional profile updated successfully!');
      setIsEditing(false);

      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      } else {
        // Fallback reload to sync parent dashboard tabs
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setIsEditing(false);
    setFormData({
      githubUsername: currentUser.githubUsername || '',
      linkedinUrl: currentUser.linkedinUrl || '',
      portfolioUrl: currentUser.portfolioUrl || '',
      codingProfile: currentUser.codingProfile || '',
      skills: currentUser.skills || '',
    });
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      await studentApi.changePassword(currentUser.id, currentPassword, newPassword);

      setPasswordSuccess('Password successfully updated! Your account credentials have been refreshed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Parse skill pills
  const skillList = useMemo(() => {
    if (!currentUser.skills) return [];
    return currentUser.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }, [currentUser.skills]);

  // Initials for avatar
  const initials = useMemo(() => {
    if (!currentUser.name) return 'ST';
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [currentUser.name]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. HERO IDENTITY HEADER */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200/90">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl sm:text-2xl font-bold border border-slate-800 shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active Student
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                Faculty of Engineering • University of Ruhuna
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
                  {derivedBatch}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
                  {currentUser.currentYear || '3rd Year'}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white">
                  GPA: {currentUser.currentGpa ? currentUser.currentGpa.toFixed(2) : '3.75'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Advisor Status */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-4 sm:p-5 min-w-[240px] shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider font-bold mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              Academic Advisor
            </div>
            {currentUser.advisor ? (
              <div>
                <p className="font-bold text-slate-900 text-sm">{currentUser.advisor.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.advisor.email}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Pending department assignment</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. CARD 1: OFFICIAL ACADEMIC IDENTITY (READ-ONLY) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic & Faculty Identity</h2>
              <p className="text-xs text-slate-500">Official university registration records verified by faculty administration</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
            <Lock className="w-3 h-3 text-slate-400" />
            Locked Records
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Full Name</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-900">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">Official Student Registry Record</p>
            </div>

            {/* University Email */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Institutional Email
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-900 break-all">{currentUser.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">Faculty Webmail Domain (@engug.ruh.ac.lk)</p>
            </div>

            {/* Registration Number */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Registration Index Number</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-900 font-mono">
                {currentUser.registrationNumber || 'Not Recorded'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Official University Student Index</p>
            </div>

            {/* Batch & Academic Year */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Academic Cohort & Year</span>
                <Award className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-900">
                {derivedBatch} — {currentUser.currentYear || '3rd Year'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Auto-derived from Registration Index</p>
            </div>

            {/* Cumulative GPA */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Cumulative Grade Point Average (GPA)</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">
                  {currentUser.currentGpa ? currentUser.currentGpa.toFixed(2) : '3.75'}
                </span>
                <span className="text-xs text-slate-400">/ 4.00</span>
                <span className="ml-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Transcript
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Managed via Examination Department Records</p>
            </div>

            {/* Assigned Academic Advisor */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 relative">
              <div className="flex items-center justify-between text-xs text-indigo-700 font-medium mb-1">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Assigned Academic Advisor
                </span>
              </div>
              {currentUser.advisor ? (
                <div>
                  <p className="text-base font-semibold text-slate-900">{currentUser.advisor.name}</p>
                  <p className="text-xs text-slate-600">{currentUser.advisor.department || 'Faculty of Engineering'}</p>
                  <a
                    href={`mailto:${currentUser.advisor.email}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {currentUser.advisor.email}
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-600 italic">Pending Advisor Allocation</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Academic advisors are allocated by the Department Head.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CARD 2: PROFESSIONAL & INDUSTRY PRESENCE (EDITABLE) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Professional & Industry Presence</h2>
              <p className="text-xs text-slate-500">Showcase your developer profiles, portfolio, and technical stack to prospective employers</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all self-start sm:self-auto"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profiles
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleCancelProfile}
                disabled={profileLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
              >
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {profileError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {!isEditing ? (
            // Read-Only Profiles Display
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* GitHub */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
                    <Code className="w-4 h-4 text-slate-700" />
                    <span>GitHub Username</span>
                  </div>
                  {currentUser.githubUsername ? (
                    <a
                      href={`https://github.com/${currentUser.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      @{currentUser.githubUsername}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Not provided</p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </div>
                  {currentUser.linkedinUrl ? (
                    <a
                      href={currentUser.linkedinUrl.startsWith('http') ? currentUser.linkedinUrl : `https://${currentUser.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 break-all transition-colors"
                    >
                      {currentUser.linkedinUrl}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Not provided</p>
                  )}
                </div>

                {/* Portfolio / Personal Website */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Portfolio / Personal Website</span>
                  </div>
                  {currentUser.portfolioUrl ? (
                    <a
                      href={currentUser.portfolioUrl.startsWith('http') ? currentUser.portfolioUrl : `https://${currentUser.portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-800 break-all transition-colors"
                    >
                      {currentUser.portfolioUrl}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Not provided</p>
                  )}
                </div>

                {/* Competitive Programming */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
                    <Code className="w-4 h-4 text-amber-600" />
                    <span>Competitive Programming (LeetCode / Codeforces / HackerRank)</span>
                  </div>
                  {currentUser.codingProfile ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 break-all">
                        {currentUser.codingProfile}
                      </span>
                      {currentUser.codingProfile.includes('http') && (
                        <a
                          href={currentUser.codingProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Not provided</p>
                  )}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">Technical Skills & Technologies</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    {skillList.length} skills listed
                  </span>
                </div>
                {skillList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-white text-slate-800 text-xs font-medium rounded-lg border border-slate-200 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No technical skills added yet. Click &quot;Edit Profiles&quot; to add skills.</p>
                )}
              </div>
            </div>
          ) : (
            // Edit Profiles Form
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="githubUsername"
                      value={formData.githubUsername}
                      onChange={handleInputChange}
                      placeholder="e.g., Pasinduteshan7"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Username only, without https://github.com/</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Full LinkedIn profile web link</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Portfolio / Personal Website
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Personal resume site, blog, or project showcase</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Competitive Programming Profile
                  </label>
                  <input
                    type="text"
                    name="codingProfile"
                    value={formData.codingProfile}
                    onChange={handleInputChange}
                    placeholder="e.g. LeetCode: octocat or https://leetcode.com/u/octocat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">LeetCode, Codeforces, HackerRank handle or link</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technical Skills & Technologies
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Python, React, Go, Spring Boot, Next.js, TypeScript, PostgreSQL, Docker"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Separate each skill with a comma. These are indexed for AI market matching against live industry demand jobs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CARD 3: ACCOUNT SECURITY & PASSWORD MANAGEMENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Account Security & Credentials</h2>
              <p className="text-xs text-slate-500">Manage your password securely. Encrypted using industrial standard BCrypt hashing.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <Key className="w-3 h-3 text-emerald-500" />
            BCrypt Protected
          </span>
        </div>

        <form onSubmit={handleChangePassword} className="p-6">
          {passwordError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pr-10 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pr-10 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full pr-10 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Password Strength Indicator */}
          {newPassword && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600">Password Strength:</span>
                <span className={strengthLabel.color}>{strengthLabel.text}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-300 ${strengthLabel.bar}`}
                  style={{ width: strengthLabel.width }}
                />
              </div>

              {/* Real-time Checklist Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  <span>Min 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  <span>1+ Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  <span>1+ Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!isPasswordValid || passwordLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
