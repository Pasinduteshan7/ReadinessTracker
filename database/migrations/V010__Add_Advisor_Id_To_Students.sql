-- Migration V010: Add advisor_id to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS advisor_id BIGINT REFERENCES advisors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_students_advisor_id ON students(advisor_id);
