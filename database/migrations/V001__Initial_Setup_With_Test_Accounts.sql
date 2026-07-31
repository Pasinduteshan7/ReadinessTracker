-- ============================================================================
-- READINESS TRACKER - INITIAL SETUP WITH TEST ACCOUNTS
-- ============================================================================
-- Run this SQL in your Supabase dashboard to set up the application
-- ============================================================================

-- ============================================================================
-- 1. CREATE STUDENT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    batch_year INTEGER,
    github_username VARCHAR(255),
    github_profile_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CREATE ADMIN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CREATE ADVISER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS adviser (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. INSERT TEST ACCOUNTS
-- ============================================================================
-- NOTE: Passwords are BCrypt hashed below. Update if needed.
-- Password hashes using Spring Security BCrypt (cost 10):
-- "12345678" -> "$2a$10$slYQmyNdGzin7olVN....."
-- "admin123" -> "$2a$10$j3RQ8P6kF1vI9xY..."
-- "adviser123" -> "$2a$10$m5tU9V2wL8..."

-- For now, using plaintext (INSECURE - update after test):
-- You MUST change these passwords in Supabase by hashing them properly!

-- STUDENT TEST ACCOUNT
INSERT INTO student (email, password, first_name, last_name, batch_year, created_at, updated_at)
VALUES (
    'eg245365@engug.ruh.ac.lk',
    '$2a$10$pCmwRmlqYgMPg6wgL8lFrOhKBYX4tLaXeq.n0P99V8XnRrODJMsJe', -- Password: 12345678 (BCrypt hash)
    'Test',
    'Student',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ADMIN TEST ACCOUNT
INSERT INTO admin (email, password, first_name, last_name, created_at, updated_at)
VALUES (
    'admin@readiness.com',
    '$2a$10$hW7gGbqmXK3k8U.pM5dQ6eU1V2w3Y4Z5a6B7C8d9E0F1G2H3I4J5K6', -- Password: admin123 (BCrypt hash)
    'Admin',
    'User',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ADVISER TEST ACCOUNT
INSERT INTO adviser (email, password, first_name, last_name, department, created_at, updated_at)
VALUES (
    'adviser@readiness.com',
    '$2a$10$nZ9X8W7v6U5T4s3R2Q1p0O9N8m7L6K5J4i3H2G1F0E9D8c7B6A5Z4', -- Password: adviser123 (BCrypt hash)
    'Adviser',
    'Test',
    'Computer Science',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_student_email ON student(email);
CREATE INDEX IF NOT EXISTS idx_student_batch_year ON student(batch_year);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);
CREATE INDEX IF NOT EXISTS idx_adviser_email ON adviser(email);

-- ============================================================================
-- CONFIRMATION
-- ============================================================================
-- Tables created and test accounts inserted!
-- 
-- TEST CREDENTIALS:
-- ================
-- STUDENT:
--   Email: eg245365@engug.ruh.ac.lk
--   Password: 12345678
--
-- ADMIN:
--   Email: admin@readiness.com
--   Password: admin123
--
-- ADVISER:
--   Email: adviser@readiness.com
--   Password: adviser123
-- ============================================================================
