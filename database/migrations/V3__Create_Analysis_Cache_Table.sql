CREATE TABLE IF NOT EXISTS analysis_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    github_url VARCHAR(500),
    last_commit_hash VARCHAR(255),
    analysis_score FLOAT DEFAULT 0.0,
    authenticity_score FLOAT DEFAULT 0.0,
    substance_score FLOAT DEFAULT 0.0,
    quality_score FLOAT DEFAULT 0.0,
    maturity_score FLOAT DEFAULT 0.0,
    tier VARCHAR(50),
    total_commits INT DEFAULT 0,
    repository_size FLOAT DEFAULT 0.0,
    last_analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'analyzed',
    UNIQUE KEY unique_repo (username, repo_name),
    INDEX idx_username (username),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS analysis_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cache_id INT NOT NULL,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_score FLOAT,
    new_score FLOAT,
    change_reason VARCHAR(255),
    FOREIGN KEY (cache_id) REFERENCES analysis_cache(id) ON DELETE CASCADE,
    INDEX idx_cache_id (cache_id)
);
