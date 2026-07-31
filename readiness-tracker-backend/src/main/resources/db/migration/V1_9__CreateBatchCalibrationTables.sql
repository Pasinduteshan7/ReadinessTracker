-- Database Migration for Batch Calibration Benchmarks
-- Creates batch_calibration_benchmarks table for storing calibration data

-- Create batch_calibration_benchmarks table
CREATE TABLE IF NOT EXISTS batch_calibration_benchmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_year INT NOT NULL,
    
    -- Top 5 students reference
    top_student_github_ids JSON DEFAULT NULL,
    top_student_user_ids JSON DEFAULT NULL,
    
    -- Metrics from top 5 students
    avg_repo_quality_score DOUBLE DEFAULT NULL,
    max_repo_quality_score DOUBLE DEFAULT NULL,
    min_repo_quality_score DOUBLE DEFAULT NULL,
    
    avg_github_metrics_score DOUBLE DEFAULT NULL,
    max_github_metrics_score DOUBLE DEFAULT NULL,
    avg_repository_stars DOUBLE DEFAULT NULL,
    avg_repository_forks DOUBLE DEFAULT NULL,
    avg_commit_frequency DOUBLE DEFAULT NULL,
    
    avg_algorithm_score DOUBLE DEFAULT NULL,
    max_algorithm_score DOUBLE DEFAULT NULL,
    min_algorithm_score DOUBLE DEFAULT NULL,
    
    avg_ai_detection_score DOUBLE DEFAULT NULL,
    max_ai_detection_score DOUBLE DEFAULT NULL,
    
    avg_final_score DOUBLE DEFAULT NULL,
    max_final_score DOUBLE DEFAULT NULL,
    min_final_score DOUBLE DEFAULT NULL,
    
    -- Percentile thresholds for batch
    percentile_90_threshold DOUBLE NOT NULL,
    percentile_75_threshold DOUBLE NOT NULL,
    percentile_50_threshold DOUBLE NOT NULL,
    percentile_25_threshold DOUBLE NOT NULL,
    
    -- Employability mappings for batch
    employability_90_plus DOUBLE NOT NULL DEFAULT 100.0,
    employability_75_to_90 DOUBLE NOT NULL DEFAULT 90.0,
    employability_50_to_75 DOUBLE NOT NULL DEFAULT 70.0,
    employability_25_to_50 DOUBLE NOT NULL DEFAULT 50.0,
    employability_below_25 DOUBLE NOT NULL DEFAULT 30.0,
    
    -- Calibration metadata
    total_students_in_batch INT DEFAULT 200,
    top_students_analyzed INT DEFAULT 5,
    
    is_calibrated TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    
    calibration_notes VARCHAR(1000) DEFAULT NULL,
    top_students_list LONGTEXT DEFAULT NULL,
    
    calibrated_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    -- Indexes
    UNIQUE INDEX idx_batch_year_active (batch_year, is_active),
    INDEX idx_batch_year (batch_year),
    INDEX idx_is_calibrated (is_calibrated),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create view for calibration status
CREATE OR REPLACE VIEW batch_calibration_status AS
SELECT 
    batch_year,
    is_calibrated,
    is_active,
    top_students_analyzed,
    total_students_in_batch,
    CASE 
        WHEN NOT is_calibrated THEN 'PENDING'
        WHEN is_active THEN 'ACTIVE'
        ELSE 'INACTIVE'
    END as status,
    avg_final_score,
    MAX(percentile_90_threshold) as percentile_90,
    MAX(percentile_75_threshold) as percentile_75,
    MAX(percentile_50_threshold) as percentile_50,
    MAX(percentile_25_threshold) as percentile_25,
    calibrated_at
FROM batch_calibration_benchmarks
GROUP BY batch_year, is_calibrated, is_active, top_students_analyzed, total_students_in_batch, avg_final_score, calibrated_at;

-- Create index on final_scores for batch queries
CREATE INDEX IF NOT EXISTS idx_final_scores_user_score 
ON final_scores (user_id, final_score DESC);

-- Add columns to final_scores if batch_year tracking needed
ALTER TABLE final_scores 
ADD COLUMN IF NOT EXISTS batch_year INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS batch_rank INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS batch_employability_percentage DOUBLE DEFAULT NULL;

-- Create index for batch ranking queries
CREATE INDEX IF NOT EXISTS idx_final_scores_batch_ranking 
ON final_scores (batch_year, final_score DESC);
