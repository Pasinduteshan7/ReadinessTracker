-- Create GitHub Profiles and Repository Analysis Tables

CREATE TABLE IF NOT EXISTS github_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    github_username VARCHAR(255) NOT NULL UNIQUE,
    github_id VARCHAR(255),
    bio TEXT,
    public_repos INT,
    public_gists INT,
    followers INT,
    following INT,
    profile_url VARCHAR(500),
    avatar_url VARCHAR(500),
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS repository_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500),
    description TEXT,
    language VARCHAR(100),
    stars INT,
    forks INT,
    watchers INT,
    commit_count INT,
    contributor_count INT,
    code_quality_score DECIMAL(5,2),
    documentation_quality DECIMAL(5,2),
    test_coverage DECIMAL(5,2),
    skills_identified TEXT,
    analyzed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_repo (user_id, repo_name)
);

CREATE INDEX idx_github_user_id ON github_profiles(user_id);
CREATE INDEX idx_repo_user_id ON repository_analysis(user_id);
