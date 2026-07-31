-- ========== CREATE INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_final_scores_user_score ON final_scores (user_id, final_score DESC);

-- ========== VERIFY ALL TABLES EXIST ==========
SELECT 'batch_configurations' as table_name, COUNT(*) as row_count FROM batch_configurations
UNION ALL
SELECT 'final_scores', COUNT(*) FROM final_scores;
