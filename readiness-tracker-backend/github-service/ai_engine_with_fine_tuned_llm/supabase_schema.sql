-- Supabase SQL Schema for GitHub Analysis Results
-- Run this in Supabase SQL Editor

-- Create table for analysis results
CREATE TABLE IF NOT EXISTS github_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User tracking
    user_id TEXT,
    github_username TEXT NOT NULL,
    
    -- Engine metadata
    engine_version TEXT NOT NULL DEFAULT 'fine_tuned_llm_v1',
    model_name TEXT,
    
    -- Analysis data (JSON)
    background_analysis JSONB,
    selected_repositories TEXT[] DEFAULT ARRAY[]::TEXT[],
    selection_rationale JSONB,
    deep_analysis_results JSONB,
    
    -- Scores (0-100)
    overall_score FLOAT,
    code_quality_score FLOAT,
    architecture_score FLOAT,
    documentation_score FLOAT,
    testing_score FLOAT,
    best_practices_score FLOAT,
    
    -- Employability metrics
    employability_percentile FLOAT,
    employability_tier TEXT,
    professional_readiness FLOAT,
    growth_potential FLOAT,
    recommended_level TEXT,
    
    -- Metadata
    analysis_duration_seconds FLOAT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_scores CHECK (
        overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)
    ),
    CONSTRAINT valid_tier CHECK (
        employability_tier IS NULL OR 
        employability_tier IN ('Excellent', 'Good', 'Fair', 'Beginner')
    ),
    CONSTRAINT valid_level CHECK (
        recommended_level IS NULL OR 
        recommended_level IN ('Senior', 'Mid', 'Junior')
    )
);

-- Create indexes for fast queries
CREATE INDEX idx_analysis_user_id ON github_analysis_results(user_id);
CREATE INDEX idx_analysis_username ON github_analysis_results(github_username);
CREATE INDEX idx_analysis_engine ON github_analysis_results(engine_version);
CREATE INDEX idx_analysis_created ON github_analysis_results(created_at DESC);
CREATE INDEX idx_analysis_tier ON github_analysis_results(employability_tier);
CREATE INDEX idx_analysis_status ON github_analysis_results(status);

-- Create unique index on user + engine + timestamp for deduplication
CREATE UNIQUE INDEX idx_analysis_unique 
ON github_analysis_results(user_id, engine_version, DATE(created_at))
WHERE status = 'completed';

-- Enable RLS (Row Level Security) if needed
ALTER TABLE github_analysis_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own results
CREATE POLICY "Users can view their own analysis" 
ON github_analysis_results FOR SELECT
USING (user_id = current_user_id());

-- Policy: Only service can insert (adjust as needed)
CREATE POLICY "Service can insert analysis" 
ON github_analysis_results FOR INSERT
WITH CHECK (true);

-- Table for comparison tracking (optional)
CREATE TABLE IF NOT EXISTS analysis_comparison (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    github_username TEXT NOT NULL,
    legacy_score FLOAT,
    fine_tuned_score FLOAT,
    score_difference FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comparison_username ON analysis_comparison(github_username);
CREATE INDEX idx_comparison_created ON analysis_comparison(created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_github_analysis_results_timestamp
BEFORE UPDATE ON github_analysis_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Grant access to authenticated users
GRANT SELECT, INSERT ON github_analysis_results TO authenticated;
GRANT SELECT, INSERT ON analysis_comparison TO authenticated;

-- Optional: Create view for latest results per user
CREATE OR REPLACE VIEW latest_analysis AS
SELECT DISTINCT ON (github_username)
    id,
    user_id,
    github_username,
    engine_version,
    overall_score,
    employability_tier,
    professional_readiness,
    growth_potential,
    recommended_level,
    analysis_duration_seconds,
    created_at
FROM github_analysis_results
WHERE status = 'completed'
ORDER BY github_username, created_at DESC;

-- Grant view access
GRANT SELECT ON latest_analysis TO authenticated;
