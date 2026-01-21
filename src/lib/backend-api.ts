const API_BASE = 'http://localhost:8080/api';

// Student APIs
export const studentApi = {
  register: async (studentData: any) => {
    const response = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
};

// Advisor APIs
export const advisorApi = {
  register: async (advisorData: any) => {
    const response = await fetch(`${API_BASE}/advisors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advisorData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/advisors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// Admin APIs
export const adminApi = {
  register: async (adminData: any) => {
    const response = await fetch(`${API_BASE}/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
