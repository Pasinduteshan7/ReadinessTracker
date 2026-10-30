-- V011: Add portfolio_url and coding_profile columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500);
ALTER TABLE students ADD COLUMN IF NOT EXISTS coding_profile VARCHAR(255);
