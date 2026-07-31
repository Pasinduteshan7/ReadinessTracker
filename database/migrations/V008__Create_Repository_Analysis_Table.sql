-- V008__Create_Repository_Analysis_Table.sql
-- Flyway migration for repository analysis functionality

CREATE TABLE IF NOT EXISTS repository_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id VARCHAR(255) UNIQUE NOT NULL,
    github_url VARCHAR(500) NOT NULL UNIQUE,
    repository_name VARCHAR(255) NOT NULL,
    repository_owner VARCHAR(255) NOT NULL,
    project_scope ENUM('DEVOPS', 'ML_AI', 'SOFTWARE_ENGINEERING', 'CYBERSECURITY', 'COMMUNICATION') NOT NULL,
    final_readiness_score DECIMAL(5, 2) DEFAULT 0.0,
    status ENUM('PENDING', 'ANALYZING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    progress INT DEFAULT 0,
    current_step VARCHAR(500),
    error_message VARCHAR(1000),
    model_scores_json LONGTEXT,
    applied_weights_json LONGTEXT,
    analysis_details_json LONGTEXT,
    recommendations_json LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_analysis_id (analysis_id),
    INDEX idx_github_url (github_url),
    INDEX idx_repository_owner (repository_owner),
    INDEX idx_project_scope (project_scope),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
