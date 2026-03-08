-- Algorithm Challenge System Tables

-- Store all algorithm problems
CREATE TABLE IF NOT EXISTS algorithm_challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL COMMENT 'easy, medium, hard',
    problem_code VARCHAR(10) UNIQUE NOT NULL COMMENT 'E001, M001, H001, etc',
    variant CHAR(1) COMMENT 'A, B, C, D for problem variants',
    description LONGTEXT NOT NULL,
    example_input TEXT,
    example_output TEXT,
    constraints TEXT,
    test_cases JSON NOT NULL COMMENT 'Array of test cases: {input, expected_output, visible: true/false}',
    max_score INT NOT NULL COMMENT '60 for easy, 80 for medium, 100 for hard',
    time_limit_minutes INT DEFAULT 30,
    topics JSON COMMENT 'Array of topic tags',
    expected_time_complexity VARCHAR(100),
    expected_space_complexity VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    solution_preview TEXT COMMENT 'Hide in production',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_difficulty (difficulty),
    INDEX idx_active (is_active),
    INDEX idx_problem_code (problem_code)
);

-- Track which student got which problem
CREATE TABLE IF NOT EXISTS problem_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    challenge_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    difficulty VARCHAR(20),
    
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_challenge FOREIGN KEY (challenge_id) REFERENCES algorithm_challenges(id),
    UNIQUE KEY unique_user_assignment (user_id)
);

-- User's code submissions and scores
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    challenge_id BIGINT NOT NULL,
    
    -- Submitted code
    code LONGTEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    
    -- Test results
    test_cases_passed INT DEFAULT 0,
    test_cases_total INT DEFAULT 0,
    pass_rate DECIMAL(5,2),
    execution_time_ms BIGINT,
    execution_error TEXT,
    
    -- LLM evaluation scores
    llm_correctness_score DECIMAL(5,2) DEFAULT 0,
    llm_efficiency_score DECIMAL(5,2) DEFAULT 0,
    llm_quality_score DECIMAL(5,2) DEFAULT 0,
    llm_feedback LONGTEXT,
    
    -- Final score
    final_score DECIMAL(5,2) DEFAULT 0,
    score_breakdown JSON COMMENT '{test_cases: 0.6, quality: 0.2, efficiency: 0.2}',
    
    -- Time metadata
    time_taken_seconds INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Cheating detection
    is_flagged BOOLEAN DEFAULT FALSE,
    cheat_flags JSON COMMENT 'Array of detected cheating indicators',
    suspicious_level VARCHAR(20) COMMENT 'low, medium, high, critical',
    
    -- Code metrics
    code_lines INT,
    code_complexity INT,
    has_comments BOOLEAN,
    comment_ratio DECIMAL(5,2),
    
    CONSTRAINT fk_submission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_challenge FOREIGN KEY (challenge_id) REFERENCES algorithm_challenges(id),
    UNIQUE KEY unique_submission (user_id, challenge_id),
    
    INDEX idx_user (user_id),
    INDEX idx_flagged (is_flagged),
    INDEX idx_submitted_at (submitted_at)
);

-- Anti-cheat monitoring data
CREATE TABLE IF NOT EXISTS submission_cheating_flags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    
    -- Paste behavior
    paste_attempts INT DEFAULT 0,
    paste_blocked_count INT DEFAULT 0,
    
    -- Tab switching
    tab_switches INT DEFAULT 0,
    tab_switch_timestamps JSON,
    
    -- Typing pattern analysis
    keystroke_count INT DEFAULT 0,
    average_keystroke_interval_ms INT,
    typing_pattern_flags JSON COMMENT 'abnormally_fast, pause_burst, uniform_speed',
    
    -- Large insertions
    large_insertions INT DEFAULT 0,
    large_insertion_details JSON,
    
    -- Comparison with external code
    leetcode_patterns_found INT DEFAULT 0,
    unusual_imports JSON,
    similarity_to_known_solutions DECIMAL(5,2),
    
    -- User's GitHub code style comparison
    naming_convention_match DECIMAL(5,2),
    code_style_variance DECIMAL(5,2),
    comment_density_variance DECIMAL(5,2),
    
    -- Extension detection
    extensions_detected JSON,
    
    -- Monitoring summary
    manual_review_required BOOLEAN DEFAULT FALSE,
    review_reason VARCHAR(255),
    flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewer_notes LONGTEXT,
    final_verdict VARCHAR(50) COMMENT 'clean, suspicious, confirmed_cheating',
    
    CONSTRAINT fk_cheating_submission FOREIGN KEY (submission_id) REFERENCES challenge_submissions(id) ON DELETE CASCADE,
    INDEX idx_submission (submission_id),
    INDEX idx_manual_review (manual_review_required)
);

-- Problem statistics for difficulty calibration
CREATE TABLE IF NOT EXISTS problem_statistics (
    challenge_id BIGINT PRIMARY KEY,
    times_assigned INT DEFAULT 0,
    times_attempted INT DEFAULT 0,
    times_solved INT DEFAULT 0,
    average_score DECIMAL(5,2),
    average_time_seconds INT,
    solve_rate DECIMAL(5,2),
    
    -- Distribution metrics
    score_distribution JSON COMMENT '{0-20: count, 20-40: count, ...}',
    
    -- Calibration feedback
    is_well_calibrated BOOLEAN DEFAULT TRUE,
    calibration_issues JSON COMMENT 'Array of issues found',
    
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_stats_challenge FOREIGN KEY (challenge_id) REFERENCES algorithm_challenges(id)
);

-- Store known solutions for plagiarism detection
CREATE TABLE IF NOT EXISTS known_solutions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    challenge_id BIGINT NOT NULL,
    source VARCHAR(100) COMMENT 'leetcode, github, etc',
    source_url VARCHAR(500),
    solution_code LONGTEXT NOT NULL,
    language VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_solution_challenge FOREIGN KEY (challenge_id) REFERENCES algorithm_challenges(id),
    INDEX idx_challenge (challenge_id)
);

-- User algorithm score history
CREATE TABLE IF NOT EXISTS algorithm_score_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    overall_algorithm_score DECIMAL(5,2),
    best_submission_score DECIMAL(5,2),
    challenges_attempted INT,
    challenges_solved INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_recorded_at (recorded_at)
);

-- Create indices for performance
CREATE INDEX idx_challenge_stats ON challenge_submissions(user_id, submitted_at);
CREATE INDEX idx_tab_switches ON submission_cheating_flags(tab_switches);
CREATE INDEX idx_paste_attempts ON submission_cheating_flags(paste_attempts);
