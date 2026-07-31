-- Migration: Create Batch Configuration Table
-- Version: V007
-- Description: Admin-controlled batch configuration for automatic analysis triggering

CREATE TABLE IF NOT EXISTS batch_configurations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Admin configuration
    batch_year INT NOT NULL UNIQUE COMMENT 'Batch year: 1, 2, 3, 4',
    target_student_count INT NOT NULL COMMENT 'Admin-set target (e.g., 200, 196, 190)',
    current_student_count INT NOT NULL DEFAULT 0 COMMENT 'Current registered count',
    
    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, READY, ANALYZING, COMPLETE',
    
    -- Auto-start configuration
    auto_start_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Auto-trigger when batch is full',
    delay_before_start_hours INT DEFAULT 0 COMMENT 'Delay after reaching target before starting (hours)',
    
    -- Analysis tracking
    analysis_started_at DATETIME NULL COMMENT 'When analysis started',
    analysis_completed_at DATETIME NULL COMMENT 'When analysis completed',
    analysis_result LONGTEXT COMMENT 'JSON summary of analysis results',
    
    -- Metadata
    description VARCHAR(500) COMMENT 'Admin notes about this batch',
    config_notes TEXT COMMENT 'Configuration notes',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_batch_year (batch_year),
    INDEX idx_status (status),
    INDEX idx_auto_start (auto_start_enabled, status),
    INDEX idx_analysis_tracking (analysis_started_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Admin-configured batch settings for automatic analysis triggering';

-- Insert default configurations for 4 batches
INSERT IGNORE INTO batch_configurations 
(batch_year, target_student_count, current_student_count, status, auto_start_enabled, delay_before_start_hours, description)
VALUES 
(1, 200, 0, 'PENDING', TRUE, 0, 'Year 1 Batch - Target: 200 students'),
(2, 196, 0, 'PENDING', TRUE, 0, 'Year 2 Batch - Target: 196 students'),
(3, 190, 0, 'PENDING', TRUE, 0, 'Year 3 Batch - Target: 190 students'),
(4, 214, 0, 'PENDING', TRUE, 0, 'Year 4 Batch - Target: 214 students');
