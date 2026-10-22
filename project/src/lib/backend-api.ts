const API_BASE = 'http://localhost:8080/api';

export const studentApi = {
  register: async (studentData: any) => {
    const response = await fetch(`${API_BASE}/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      let errorMsg = 'Registration failed';
      try {
        const errJson = await response.json();
        if (errJson?.message) errorMsg = errJson.message;
        else if (errJson?.error) errorMsg = errJson.error;
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return response.json();
  },
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  getAllStudents: async () => {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },
  getStudentById: async (id: number) => {
    const response = await fetch(`${API_BASE}/students/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },
  updateStudent: async (id: number, updates: any) => {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },
  saveGithubToken: async (studentId: number, token: string) => {
    const response = await fetch(`${API_BASE}/students/${studentId}/github-token`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save GitHub token');
    }
    return response.json();
  },
  deleteGithubToken: async (studentId: number) => {
    const response = await fetch(`${API_BASE}/students/${studentId}/github-token`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to remove GitHub token');
    }
    return response.json();
  },
  getGithubTokenStatus: async (studentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/students/${studentId}/github-token/status`, {
        credentials: 'include',
      });
      if (!response.ok) return { hasGithubToken: false, preview: '' };
      return response.json();
    } catch {
      return { hasGithubToken: false, preview: '' };
    }
  },
};

export const advisorApi = {
  register: async (advisorData: any) => {
    const response = await fetch(`${API_BASE}/advisors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(advisorData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/advisors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  getAllAdvisors: async () => {
    const response = await fetch(`${API_BASE}/advisors`);
    if (!response.ok) throw new Error('Failed to fetch advisors');
    return response.json();
  },
  getAdvisorById: async (id: number) => {
    const response = await fetch(`${API_BASE}/advisors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch advisor');
    return response.json();
  },
};

export const adminApi = {
  register: async (adminData: any) => {
    const response = await fetch(`${API_BASE}/admins/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(adminData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  getAllAdmins: async () => {
    const response = await fetch(`${API_BASE}/admins`);
    if (!response.ok) throw new Error('Failed to fetch admins');
    return response.json();
  },
  getAdminById: async (id: number) => {
    const response = await fetch(`${API_BASE}/admins/${id}`);
    if (!response.ok) throw new Error('Failed to fetch admin');
    return response.json();
  },
};

export const benchmarkApi = {
  addBenchmark: async (data: {
    fullName: string;
    githubUsername: string;
    graduationYear: number;
    outcomeLabel: string;
    companyRole?: string;
    consentConfirmed: boolean;
  }) => {
    const response = await fetch(`${API_BASE}/admin/benchmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to add benchmark');
    }
    return response.json();
  },
  getAllBenchmarks: async () => {
    const response = await fetch(`${API_BASE}/admin/benchmarks`);
    if (!response.ok) throw new Error('Failed to fetch benchmarks');
    return response.json();
  },
  deleteBenchmark: async (id: number) => {
    const response = await fetch(`${API_BASE}/admin/benchmarks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete benchmark');
    return response.json();
  },
  analyzeBenchmark: async (id: number, githubToken?: string) => {
    const url = new URL(`${API_BASE}/admin/benchmarks/${id}/analyze`);
    if (githubToken) {
      url.searchParams.append('githubToken', githubToken);
    }
    const response = await fetch(url.toString(), {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to start analysis');
    return response.json();
  },
  analyzeAllBenchmarks: async (githubToken?: string) => {
    const url = new URL(`${API_BASE}/admin/benchmarks/analyze-all`);
    if (githubToken) {
      url.searchParams.append('githubToken', githubToken);
    }
    const response = await fetch(url.toString(), {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to start batch analysis');
    return response.json();
  },
  getBaseline: async () => {
    const response = await fetch(`${API_BASE}/admin/benchmarks/baseline`);
    if (!response.ok) throw new Error('Failed to fetch baseline');
    return response.json();
  },
  getStudentBaseline: async () => {
    const response = await fetch(`${API_BASE}/github/benchmark-baseline`);
    if (!response.ok) throw new Error('Failed to fetch baseline');
    return response.json();
  },
};

export const moduleMarksApi = {
  getStudentMarks: async (studentId: number) => {
    const response = await fetch(`${API_BASE}/module-marks/student/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch module marks');
    return response.json();
  },
  saveStudentMarks: async (studentId: number, marks: Record<string, any>) => {
    const response = await fetch(`${API_BASE}/module-marks/student/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marks),
    });
    if (!response.ok) throw new Error('Failed to save module marks');
    return response.json();
  },
  getAllMarks: async () => {
    const response = await fetch(`${API_BASE}/module-marks/all`);
    if (!response.ok) throw new Error('Failed to fetch all marks');
    return response.json();
  },
  getCurriculum: async () => {
    const response = await fetch(`${API_BASE}/module-marks/curriculum`);
    if (!response.ok) throw new Error('Failed to fetch curriculum modules');
    return response.json();
  },
};

export const industryDemandApi = {
  getMatch: async (studentId: number, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/industry-demand/${studentId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch industry demand');
    return response.json();
  },
};

export interface UnifiedReadinessStudent {
  studentId: number;
  studentName: string;
  email: string;
  registrationNumber?: string;
  currentYear?: string;
  batchYear?: number;
  avatarUrl?: string;
  currentGpa?: number;
  overallScore: number;
  rank: number;
  percentile: number;
  readinessTier: 'Industry Ready' | 'Nearly Ready' | 'Developing' | 'Foundational';
  evaluatedPillarsCount: number;
  academicScore?: number | null;
  githubScore?: number | null;
  industryScore?: number | null;
  profileScore?: number | null;
  topSpecialization?: string;
  specializationConfidence?: number;
  topCareerPath?: string;
  topCareerMatch?: number;
  primaryStrength?: string;
  primaryGrowthArea?: string;
}

export interface CohortReadinessData {
  rankedStudents: UnifiedReadinessStudent[];
  studentReadiness?: UnifiedReadinessStudent | null;
  totalCohortSize: number;
  averageOverallScore: number;
  averageAcademicScore: number;
  averageGithubScore: number;
  averageIndustryScore: number;
  averageProfileScore: number;
  topScore: number;
}

export const overallReadinessApi = {
  getCohortReadiness: async (studentId?: number): Promise<CohortReadinessData> => {
    const url = studentId
      ? `${API_BASE}/overall-readiness/student/${studentId}`
      : `${API_BASE}/overall-readiness/cohort`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch overall readiness cohort data');
    return response.json();
  },
  compareStudents: async (studentId1: number, studentId2: number) => {
    const response = await fetch(`${API_BASE}/overall-readiness/compare/${studentId1}/${studentId2}`);
    if (!response.ok) throw new Error('Failed to compare students');
    return response.json();
  },
};

