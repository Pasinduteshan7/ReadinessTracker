-- Database Migration for Benchmark System
-- Creates benchmark_metrics and benchmark_percentiles tables

-- Create benchmark_metrics table
CREATE TABLE IF NOT EXISTS benchmark_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_category VARCHAR(100) NOT NULL,
    repository_stars INT DEFAULT NULL,
    repository_forks INT DEFAULT NULL,
    pull_request_count INT DEFAULT NULL,
    code_review_count INT DEFAULT NULL,
    open_issues_count INT DEFAULT NULL,
    commit_count INT DEFAULT NULL,
    code_quality_score DOUBLE DEFAULT NULL,
    documentation_score DOUBLE DEFAULT NULL,
    test_coverage_score DOUBLE DEFAULT NULL,
    maintainability_score DOUBLE DEFAULT NULL,
    security_score DOUBLE DEFAULT NULL,
    commits_per_month DOUBLE DEFAULT NULL,
    pull_requests_per_month DOUBLE DEFAULT NULL,
    days_active INT DEFAULT NULL,
    language_count INT DEFAULT NULL,
    total_repositories INT DEFAULT NULL,
    total_stars INT DEFAULT NULL,
    total_forks INT DEFAULT NULL,
    followers_count INT DEFAULT NULL,
    average_stars_per_repo DOUBLE DEFAULT NULL,
    percentile_90_value DOUBLE DEFAULT NULL,
    percentile_75_value DOUBLE DEFAULT NULL,
    percentile_50_value DOUBLE DEFAULT NULL,
    percentile_25_value DOUBLE DEFAULT NULL,
    description VARCHAR(500) DEFAULT NULL,
    data_source VARCHAR(100) DEFAULT NULL,
    total_samples_analyzed INT NOT NULL,
    data_collection_date DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_metric_category (metric_category),
    INDEX idx_data_source (data_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create benchmark_percentiles table
CREATE TABLE IF NOT EXISTS benchmark_percentiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    score_category VARCHAR(100) UNIQUE NOT NULL,
    percentile_90_threshold DOUBLE NOT NULL,
    percentile_75_threshold DOUBLE NOT NULL,
    percentile_50_threshold DOUBLE NOT NULL,
    percentile_25_threshold DOUBLE NOT NULL,
    employability_90_plus DOUBLE NOT NULL,
    employability_75_to_90 DOUBLE NOT NULL,
    employability_50_to_75 DOUBLE NOT NULL,
    employability_25_to_50 DOUBLE NOT NULL,
    employability_below_25 DOUBLE NOT NULL,
    sample_size INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    description VARCHAR(500) DEFAULT NULL,
    calibration_notes VARCHAR(500) DEFAULT NULL,
    calibrated_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_score_category (score_category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alter final_scores table to add employability fields if not exists
ALTER TABLE final_scores 
ADD COLUMN IF NOT EXISTS employability_percentage DOUBLE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS employability_category VARCHAR(50) DEFAULT NULL;

-- Add indexes to final_scores for employability queries
CREATE INDEX IF NOT EXISTS idx_final_scores_employability 
ON final_scores (employability_percentage);

-- Create view for benchmark statistics
CREATE OR REPLACE VIEW benchmark_statistics AS
SELECT 
    'REPO_QUALITY' as score_category,
    COUNT(*) as total_metrics,
    AVG(percentile_90_value) as avg_90th_percentile,
    AVG(percentile_50_value) as avg_median,
    MAX(total_samples_analyzed) as max_sample_size
FROM benchmark_metrics
WHERE metric_category IN ('CODE_QUALITY', 'DOCUMENTATION', 'SECURITY')
UNION ALL
SELECT 
    'GITHUB_METRICS' as score_category,
    COUNT(*) as total_metrics,
    AVG(percentile_90_value) as avg_90th_percentile,
    AVG(percentile_50_value) as avg_median,
    MAX(total_samples_analyzed) as max_sample_size
FROM benchmark_metrics
WHERE metric_category IN ('REPOSITORY_STARS', 'COMMIT_FREQUENCY', 'LANGUAGE_DIVERSITY')
UNION ALL
SELECT 
    'ALGORITHM_SCORE' as score_category,
    COUNT(*) as total_metrics,
    AVG(percentile_90_value) as avg_90th_percentile,
    AVG(percentile_50_value) as avg_median,
    1000 as max_sample_size
FROM benchmark_metrics
WHERE metric_category = 'ALGORITHM_SCORE'
UNION ALL
SELECT 
    'OVERALL' as score_category,
    COUNT(*) as total_metrics,
    AVG(percentile_90_value) as avg_90th_percentile,
    AVG(percentile_50_value) as avg_median,
    MAX(total_samples_analyzed) as max_sample_size
FROM benchmark_metrics
WHERE metric_category = 'OVERALL';
