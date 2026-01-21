// Dev-only mock data seeder for the in-memory backend mock.
// This file is safe to import in dev. It no-ops in production.

import { __mockSeed__ } from './backendMock';

// Use the three test user IDs created earlier (from the seeder run).
const STUDENT_ID = 'aa1c7fb5-3374-4ddf-abf8-b9668499c273';
const ADVISOR_ID = 'f20c712a-aa11-48a6-b4a7-469f2bcee129';
const ADMIN_ID = 'c9feac90-faef-4d25-a6c1-9f4e772997d0';

if (import.meta.env.DEV) {
  // Seed profiles
  __mockSeed__('student_profiles', [
    {
      id: STUDENT_ID,
      full_name: 'Test Student',
      email: 'student@example.com',
      phone_number: '555-0101',
      course: 'Computer Science',
      year: 3,
      advisor_id: ADVISOR_ID,
    },
  ]);

  __mockSeed__('advisor_profiles', [
    {
      id: ADVISOR_ID,
      full_name: 'Test Advisor',
      email: 'advisor@example.com',
      phone_number: '555-0202',
    },
  ]);

  __mockSeed__('admin_profiles', [
    {
      id: ADMIN_ID,
      full_name: 'Test Admin',
      email: 'admin@example.com',
    },
  ]);

  // Seed some readiness_scores for the student
  __mockSeed__('readiness_scores', [
    {
      id: `score-${STUDENT_ID}-1`,
      student_id: STUDENT_ID,
      category: 'github_analysis',
      score: 72,
      details: { repos: 5, followers: 12 },
    },
    {
      id: `score-${STUDENT_ID}-2`,
      student_id: STUDENT_ID,
      category: 'social_media_analysis',
      score: 65,
      details: { linkedin: { connections: 80 } },
    },
    {
      id: `score-${STUDENT_ID}-3`,
      student_id: STUDENT_ID,
      category: 'academic_module_analysis',
      score: 88,
      details: { gpa: 3.6 },
    },
  ]);

  // Assign advisor -> student
  __mockSeed__('advisor_student_assignments', [
    { id: `assign-${ADVISOR_ID}-${STUDENT_ID}`, advisor_id: ADVISOR_ID, student_id: STUDENT_ID },
  ]);
}

export {};
