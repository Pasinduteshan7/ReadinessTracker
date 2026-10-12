-- ============================================================================
-- V009: Create Student Industry Readiness Table
-- Stores the calculated alignment between student verified skills (from GitHub)
-- and live industry demand collected from Remotive & The Muse APIs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_industry_readiness (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    industry_match_score DOUBLE PRECISION NOT NULL,
    matched_skills TEXT,
    missing_skills TEXT,
    total_industry_skills INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_industry_readiness_student_id 
    ON student_industry_readiness(student_id);

CREATE INDEX IF NOT EXISTS idx_student_industry_readiness_score 
    ON student_industry_readiness(industry_match_score);
