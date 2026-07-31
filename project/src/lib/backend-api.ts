const API_BASE = 'http://localhost:8080/api';

export const studentApi = {
  register: async (studentData: any) => {
    const response = await fetch(`${API_BASE}/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error('Registration failed');
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
