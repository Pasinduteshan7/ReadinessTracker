-- Create Industry Data and Skill Demand Tables

CREATE TABLE IF NOT EXISTS industry_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    industry VARCHAR(255) NOT NULL UNIQUE,
    sector VARCHAR(255) NOT NULL,
    description TEXT,
    growth_rate DECIMAL(5,2),
    market_size VARCHAR(255),
    avg_salary DECIMAL(12,2),
    job_openings INT,
    demand_level VARCHAR(50),
    top_skills TEXT,
    top_companies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_demand (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    demand_percentage DECIMAL(5,2),
    growth_trend VARCHAR(50),
    avg_salary DECIMAL(12,2),
    job_count INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_industry ON industry_data(industry);
CREATE INDEX idx_sector ON industry_data(sector);
CREATE INDEX idx_demand_level ON industry_data(demand_level);
CREATE INDEX idx_skill_name ON skill_demand(skill_name);
CREATE INDEX idx_skill_category ON skill_demand(category);
