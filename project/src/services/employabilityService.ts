// Employability Readiness Tracker Service
// Communicates with FastAPI backend on port 8001 (or configured VITE_EMPLOYABILITY_API_URL)

const API_BASE = import.meta.env.VITE_EMPLOYABILITY_API_URL || 'http://localhost:8001';

export interface StudentSummary {
  id: number;
  name?: string;
  email?: string;
  total_score: number;
  level: string;
  top_category?: string;
  created_at: string;
}

export interface StudentDetail {
  id: number;
  name?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  profile: {
    name?: string;
    contact?: {
      email?: string;
      phone?: string;
      linkedin?: string;
      github?: string;
    };
    skills?: string[];
    education?: Array<{ degree?: string; institution?: string; year?: string }>;
    experience?: Array<{ role?: string; company?: string; duration?: string; description?: string }>;
    projects?: Array<{ title?: string; tech?: string[]; description?: string }>;
    certifications?: string[];
  };
  readiness: {
    total: number;
    level: string;
    breakdown: {
      skills: number;
      projects: number;
      certifications: number;
      experience: number;
      education: number;
      extras: number;
    };
    max_scores: {
      skills: number;
      projects: number;
      certifications: number;
      experience: number;
      education: number;
      extras: number;
    };
  };
  job_fit: Record<string, number>;
  recommendations: {
    readiness_for_role?: number;
    strengths?: string[];
    skill_gaps?: string[];
    recommended_certifications?: Array<{ name: string; provider: string; reason: string }>;
    recommended_projects?: Array<{ title: string; tech: string[]; reason: string }>;
    learning_path?: Array<{ step: number; action: string; duration: string }>;
    estimated_time_to_ready_months?: number;
    _source?: string;
    error?: string;
  };
  created_at: string;
}

export interface RankingResult {
  student_id: number;
  name?: string;
  score: number;
  rank: number;
  total_students: number;
  percentile: number;
}

export interface CohortStats {
  total_students: number;
  avg_score: number;
  median_score: number;
  top_score: number;
  bottom_score: number;
  score_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
}

export const employabilityService = {
  /**
   * Check if the Employability backend (FastAPI :8001) is reachable
   */
  async checkHealth(): Promise<{ isOnline: boolean; message?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${API_BASE}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { isOnline: true };
      }
      return { isOnline: false, message: `Server returned status ${res.status}` };
    } catch (e: any) {
      return { isOnline: false, message: e?.message || 'Connection failed' };
    }
  },

  /**
   * List all analyzed students
   */
  async listStudents(): Promise<StudentSummary[]> {
    const res = await fetch(`${API_BASE}/api/students`);
    if (!res.ok) throw new Error(`Failed to fetch students: ${res.statusText}`);
    return res.json();
  },

  /**
   * Get single student detailed analysis
   */
  async getStudent(id: number): Promise<StudentDetail> {
    const res = await fetch(`${API_BASE}/api/students/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch student ${id}: ${res.statusText}`);
    return res.json();
  },

  /**
   * Get student percentile ranking
   */
  async getStudentRanking(id: number): Promise<RankingResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}/ranking`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        student_id: data.student_id ?? id,
        name: data.name,
        score: data.total_score ?? data.score ?? 0,
        rank: data.rank ?? 1,
        total_students: data.cohort_size ?? data.total_students ?? 1,
        percentile: data.overall_percentile ?? data.percentile ?? 50,
      };
    } catch {
      return null;
    }
  },

  /**
   * Look up existing analysis matching a student's email or name
   */
  async findStudentByEmailOrName(email?: string, name?: string): Promise<StudentDetail | null> {
    try {
      const students = await this.listStudents();
      const normEmail = email?.trim().toLowerCase();
      const normName = name?.trim().toLowerCase();

      let matched = students.find(
        (s) => normEmail && s.email && s.email.trim().toLowerCase() === normEmail
      );
      if (!matched && normName) {
        matched = students.find(
          (s) => s.name && s.name.trim().toLowerCase() === normName
        );
      }

      if (matched) {
        return await this.getStudent(matched.id);
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Upload and analyze a PDF resume or LinkedIn profile PDF
   */
  async analyzePdf(file: File): Promise<StudentDetail> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = 'Failed to analyze PDF.';
      try {
        const err = await res.json();
        errorMsg = err.detail || err.message || errorMsg;
      } catch {
        errorMsg = `Server error (${res.status}): ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    // Fetch full student detail record created/updated by analyze
    if (data.student_id) {
      return await this.getStudent(data.student_id);
    }

    return {
      id: data.student_id || 0,
      profile: data.profile || {},
      readiness: data.readiness || { total: 0, level: 'Unknown', breakdown: {}, max_scores: {} },
      job_fit: data.job_fit || {},
      recommendations: data.recommendations || {},
      created_at: new Date().toISOString(),
    } as StudentDetail;
  },

  /**
   * Get overall cohort statistics
   */
  async getCohortStats(): Promise<CohortStats> {
    const res = await fetch(`${API_BASE}/api/cohort-stats`);
    if (!res.ok) throw new Error('Failed to fetch cohort stats');
    return res.json();
  },

  /**
   * Save analyzed profile directly into Supabase via Spring Boot (:8080)
   */
  async saveAnalysisToSupabase(studentId: number, detail: StudentDetail, filename?: string): Promise<any> {
    try {
      const topCategory = detail.job_fit ? Object.keys(detail.job_fit)[0] : undefined;
      const topCategoryScore = topCategory && detail.job_fit ? detail.job_fit[topCategory] : undefined;
      const breakdown = detail.readiness?.breakdown || {};

      const payload = {
        student_id: studentId,
        overall_score: detail.readiness?.total ?? 0,
        readiness_level: detail.readiness?.level ?? 'Unknown',
        top_career_path: topCategory,
        top_career_match: topCategoryScore,
        skills_tech_score: (breakdown as any).skills ?? 0,
        projects_depth_score: (breakdown as any).projects ?? 0,
        certifications_score: (breakdown as any).certifications ?? 0,
        experience_score: (breakdown as any).experience ?? 0,
        education_score: (breakdown as any).education ?? 0,
        presentation_score: (breakdown as any).extras ?? 0,
        capability_breakdown: detail.readiness || {},
        career_compatibility: detail.job_fit || {},
        ai_coach_recommendations: detail.recommendations || {},
        extracted_skills: detail.profile?.skills || [],
        extracted_profile: detail.profile || {},
        pdf_filename: filename || 'resume.pdf'
      };

      const res = await fetch('http://localhost:8080/api/profile-analysis/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to persist profile analysis to Supabase:', e);
    }
    return null;
  },

  /**
   * Retrieve saved profile analysis from Supabase for a student
   */
  async getSavedAnalysisFromSupabase(studentId: number): Promise<StudentDetail | null> {
    try {
      const res = await fetch(`http://localhost:8080/api/profile-analysis/student/${studentId}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data) return null;
      
      const parseSafe = (raw: any, fallback: any) => {
        if (!raw) return fallback;
        if (typeof raw === 'object') return raw;
        try { return JSON.parse(raw); } catch { return fallback; }
      };

      const rawBreakdown = parseSafe(data.capabilityBreakdown, {});
      const breakdown = {
        skills: Number(rawBreakdown.skills ?? data.skillsTechScore ?? 0),
        projects: Number(rawBreakdown.projects ?? data.projectsDepthScore ?? 0),
        certifications: Number(rawBreakdown.certifications ?? data.certificationsScore ?? 0),
        experience: Number(rawBreakdown.experience ?? data.experienceScore ?? 0),
        education: Number(rawBreakdown.education ?? data.educationScore ?? 0),
        extras: Number(rawBreakdown.extras ?? data.presentationScore ?? 0)
      };

      const parsedProfile = parseSafe(data.extractedProfile, {}) || {};
      const extractedSkillsList = parseSafe(data.extractedSkills, []);
      if (!parsedProfile.skills || parsedProfile.skills.length === 0) {
        parsedProfile.skills = Array.isArray(extractedSkillsList) ? extractedSkillsList : [];
      }

      return {
        id: data.studentId,
        name: undefined,
        readiness: {
          total: Number(data.overallScore ?? 0),
          level: data.readinessLevel || 'Developing',
          breakdown: breakdown,
          max_scores: {
            skills: 30, projects: 20, certifications: 15, experience: 15, education: 10, extras: 10
          }
        },
        job_fit: parseSafe(data.careerCompatibility, {}),
        recommendations: parseSafe(data.aiCoachRecommendations, {}),
        profile: parsedProfile,
        created_at: data.createdAt || data.updatedAt || new Date().toISOString()
      };
    } catch (e) {
      console.warn('No Supabase saved profile analysis found:', e);
      return null;
    }
  }
};
