export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
export interface Database {
  public: {
    Tables: {
      student_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          registration_number: string
          university_email: string
          current_year: number
          current_gpa: number | null
          github_username: string | null
          linkedin_url: string | null
          facebook_url: string | null
          profile_picture_url: string | null
          bio: string | null
          phone_number: string | null
          date_of_birth: string | null
          is_active: boolean
          profile_completeness: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          registration_number: string
          university_email: string
          current_year: number
          current_gpa?: number | null
          github_username?: string | null
          linkedin_url?: string | null
          facebook_url?: string | null
          profile_picture_url?: string | null
          bio?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          is_active?: boolean
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          registration_number?: string
          university_email?: string
          current_year?: number
          current_gpa?: number | null
          github_username?: string | null
          linkedin_url?: string | null
          facebook_url?: string | null
          profile_picture_url?: string | null
          bio?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          is_active?: boolean
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
      }
      advisor_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          employee_id: string
          university_email: string
          department: string
          specialization: string | null
          bio: string | null
          office_hours: string | null
          profile_picture_url: string | null
          is_active: boolean
          max_students: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          employee_id: string
          university_email: string
          department?: string
          specialization?: string | null
          bio?: string | null
          office_hours?: string | null
          profile_picture_url?: string | null
          is_active?: boolean
          max_students?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          employee_id?: string
          university_email?: string
          department?: string
          specialization?: string | null
          bio?: string | null
          office_hours?: string | null
          profile_picture_url?: string | null
          is_active?: boolean
          max_students?: number
          created_at?: string
          updated_at?: string
        }
      }
      admin_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          admin_email: string
          is_super_admin: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          admin_email: string
          is_super_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          admin_email?: string
          is_super_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category_id: string | null
          description: string | null
          is_trending: boolean
          demand_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          description?: string | null
          is_trending?: boolean
          demand_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          description?: string | null
          is_trending?: boolean
          demand_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      skill_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          weightage: number
          is_technical: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          weightage?: number
          is_technical?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          weightage?: number
          is_technical?: boolean
          display_order?: number
          created_at?: string
        }
      }
      student_skills: {
        Row: {
          id: string
          student_id: string
          skill_id: string
          proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          years_of_experience: number
          verified: boolean
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          skill_id: string
          proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          years_of_experience?: number
          verified?: boolean
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          skill_id?: string
          proficiency_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          years_of_experience?: number
          verified?: boolean
          added_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          is_ongoing: boolean
          github_url: string | null
          live_demo_url: string | null
          image_url: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_ongoing?: boolean
          github_url?: string | null
          live_demo_url?: string | null
          image_url?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_ongoing?: boolean
          github_url?: string | null
          live_demo_url?: string | null
          image_url?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      internships: {
        Row: {
          id: string
          student_id: string
          company_name: string
          role: string
          start_date: string
          end_date: string | null
          is_current: boolean
          location: string | null
          description: string | null
          skills_used: string[] | null
          certificate_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          company_name: string
          role: string
          start_date: string
          end_date?: string | null
          is_current?: boolean
          location?: string | null
          description?: string | null
          skills_used?: string[] | null
          certificate_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          company_name?: string
          role?: string
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          location?: string | null
          description?: string | null
          skills_used?: string[] | null
          certificate_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      extracurriculars: {
        Row: {
          id: string
          student_id: string
          activity_name: string
          category: 'Sports' | 'Cultural' | 'Technical' | 'Volunteer' | 'Leadership' | 'Other' | null
          role: string | null
          start_date: string | null
          end_date: string | null
          is_ongoing: boolean
          achievements: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          activity_name: string
          category?: 'Sports' | 'Cultural' | 'Technical' | 'Volunteer' | 'Leadership' | 'Other' | null
          role?: string | null
          start_date?: string | null
          end_date?: string | null
          is_ongoing?: boolean
          achievements?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          activity_name?: string
          category?: 'Sports' | 'Cultural' | 'Technical' | 'Volunteer' | 'Leadership' | 'Other' | null
          role?: string | null
          start_date?: string | null
          end_date?: string | null
          is_ongoing?: boolean
          achievements?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      readiness_scores: {
        Row: {
          id: string
          student_id: string
          total_score: number
          academic_score: number
          skills_score: number
          projects_score: number
          internship_score: number
          extracurricular_score: number
          skill_gap_count: number
          overall_rank: number | null
          year_rank: number | null
          percentile: number | null
          last_calculated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_score?: number
          academic_score?: number
          skills_score?: number
          projects_score?: number
          internship_score?: number
          extracurricular_score?: number
          skill_gap_count?: number
          overall_rank?: number | null
          year_rank?: number | null
          percentile?: number | null
          last_calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          total_score?: number
          academic_score?: number
          skills_score?: number
          projects_score?: number
          internship_score?: number
          extracurricular_score?: number
          skill_gap_count?: number
          overall_rank?: number | null
          year_rank?: number | null
          percentile?: number | null
          last_calculated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      score_history: {
        Row: {
          id: string
          student_id: string
          total_score: number
          academic_score: number | null
          skills_score: number | null
          projects_score: number | null
          internship_score: number | null
          extracurricular_score: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_score: number
          academic_score?: number | null
          skills_score?: number | null
          projects_score?: number | null
          internship_score?: number | null
          extracurricular_score?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          total_score?: number
          academic_score?: number | null
          skills_score?: number | null
          projects_score?: number | null
          internship_score?: number | null
          extracurricular_score?: number | null
          recorded_at?: string
        }
      }
      advisor_student_assignments: {
        Row: {
          id: string
          student_id: string
          advisor_id: string
          status: 'pending' | 'active' | 'declined' | 'ended'
          requested_at: string
          approved_at: string | null
          ended_at: string | null
          reason_for_change: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          advisor_id: string
          status?: 'pending' | 'active' | 'declined' | 'ended'
          requested_at?: string
          approved_at?: string | null
          ended_at?: string | null
          reason_for_change?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          advisor_id?: string
          status?: 'pending' | 'active' | 'declined' | 'ended'
          requested_at?: string
          approved_at?: string | null
          ended_at?: string | null
          reason_for_change?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          job_title: string
          company_name: string
          experience_level: 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior Level' | null
          location: string | null
          job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | null
          description: string | null
          salary_range: string | null
          posted_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          job_title: string
          company_name: string
          experience_level?: 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior Level' | null
          location?: string | null
          job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | null
          description?: string | null
          salary_range?: string | null
          posted_date?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          job_title?: string
          company_name?: string
          experience_level?: 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior Level' | null
          location?: string | null
          job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | null
          description?: string | null
          salary_range?: string | null
          posted_date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          student_id: string
          badge_name: string
          badge_type: 'Top Performer' | 'Skill Master' | 'Project Champion' | 'Rising Star' | 'Consistent Performer' | 'Complete Profile' | null
          description: string | null
          earned_at: string
        }
        Insert: {
          id?: string
          student_id: string
          badge_name: string
          badge_type?: 'Top Performer' | 'Skill Master' | 'Project Champion' | 'Rising Star' | 'Consistent Performer' | 'Complete Profile' | null
          description?: string | null
          earned_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          badge_name?: string
          badge_type?: 'Top Performer' | 'Skill Master' | 'Project Champion' | 'Rising Star' | 'Consistent Performer' | 'Complete Profile' | null
          description?: string | null
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
