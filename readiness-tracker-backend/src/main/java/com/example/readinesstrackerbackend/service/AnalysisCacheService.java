package com.example.readinesstrackerbackend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.readinesstrackerbackend.repository.StudentRepository;

@Service
public class AnalysisCacheService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StudentRepository studentRepository;

    public Map<String, Object> getCachedAnalysis(String username, String repoName) {
        String sql = "SELECT * FROM analysis_cache WHERE username = ? AND repo_name = ?";
        try {
            return jdbcTemplate.queryForMap(sql, username, repoName);
        } catch (Exception e) {
            return null;
        }
    }

    public void saveAnalysisCache(String username, String repoName, String githubUrl,
                                  String lastCommitHash, Float analysisScore,
                                  Float authenticity, Float substance, Float quality,
                                  Float maturity, String tier, Integer commits, Float size) {
        String checkSql = "SELECT id FROM analysis_cache WHERE username = ? AND repo_name = ?";
        
        try {
            Map<String, Object> existing = jdbcTemplate.queryForMap(checkSql, username, repoName);
            
            if (existing != null) {
                Float oldScore = (Float) existing.get("analysis_score");
                updateAnalysisCache(username, repoName, lastCommitHash, analysisScore,
                        authenticity, substance, quality, maturity, tier, commits, size);
                logAnalysisHistory((Integer) existing.get("id"), oldScore, analysisScore, "Updated");
            }
        } catch (Exception e) {
            insertAnalysisCache(username, repoName, githubUrl, lastCommitHash, analysisScore,
                    authenticity, substance, quality, maturity, tier, commits, size);
        }
    }

    private void insertAnalysisCache(String username, String repoName, String githubUrl,
                                     String lastCommitHash, Float analysisScore,
                                     Float authenticity, Float substance, Float quality,
                                     Float maturity, String tier, Integer commits, Float size) {
        String sql = "INSERT INTO analysis_cache (username, repo_name, github_url, last_commit_hash, " +
                "analysis_score, authenticity_score, substance_score, quality_score, maturity_score, " +
                "tier, total_commits, repository_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        jdbcTemplate.update(sql, username, repoName, githubUrl, lastCommitHash, analysisScore,
                authenticity, substance, quality, maturity, tier, commits, size, "analyzed");
    }

    private void updateAnalysisCache(String username, String repoName, String lastCommitHash,
                                     Float analysisScore, Float authenticity, Float substance,
                                     Float quality, Float maturity, String tier,
                                     Integer commits, Float size) {
        String sql = "UPDATE analysis_cache SET last_commit_hash = ?, analysis_score = ?, " +
                "authenticity_score = ?, substance_score = ?, quality_score = ?, maturity_score = ?, " +
                "tier = ?, total_commits = ?, repository_size = ?, last_analyzed_at = ?, status = ? " +
                "WHERE username = ? AND repo_name = ?";
        
        jdbcTemplate.update(sql, lastCommitHash, analysisScore, authenticity, substance, quality,
                maturity, tier, commits, size, LocalDateTime.now(), "analyzed", username, repoName);
    }

    private void logAnalysisHistory(Integer cacheId, Float oldScore, Float newScore, String reason) {
        String sql = "INSERT INTO analysis_history (cache_id, old_score, new_score, change_reason) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, cacheId, oldScore, newScore, reason);
    }

    public boolean shouldRefreshCache(String username, String repoName, String currentCommit) {
        String sql = "SELECT last_commit_hash, last_analyzed_at FROM analysis_cache " +
                "WHERE username = ? AND repo_name = ?";
        
        try {
            Map<String, Object> cached = jdbcTemplate.queryForMap(sql, username, repoName);
            String cachedCommit = (String) cached.get("last_commit_hash");
            LocalDateTime lastAnalyzed = (LocalDateTime) cached.get("last_analyzed_at");
            
            if (!currentCommit.equals(cachedCommit)) {
                return true;
            }
            
            long daysPassed = java.time.temporal.ChronoUnit.DAYS.between(lastAnalyzed.toLocalDate(), 
                    LocalDateTime.now().toLocalDate());
            return daysPassed > 30;
        } catch (Exception e) {
            return true;
        }
    }

    public Map<String, Object> getAnalysisHistory(String username, String repoName) {
        String sql = "SELECT ah.* FROM analysis_history ah " +
                "JOIN analysis_cache ac ON ah.cache_id = ac.id " +
                "WHERE ac.username = ? AND ac.repo_name = ? ORDER BY ah.analysis_date DESC";
        
        try {
            return jdbcTemplate.queryForMap(sql, username, repoName);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    public void clearCache(String username, String repoName) {
        String sql = "DELETE FROM analysis_cache WHERE username = ? AND repo_name = ?";
        jdbcTemplate.update(sql, username, repoName);
    }

    public void clearAllCache(String username) {
        String sql = "DELETE FROM analysis_cache WHERE username = ?";
        jdbcTemplate.update(sql, username);
    }
}
