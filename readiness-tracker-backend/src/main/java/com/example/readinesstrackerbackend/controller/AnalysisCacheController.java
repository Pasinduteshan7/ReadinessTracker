package com.example.readinesstrackerbackend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.readinesstrackerbackend.service.AnalysisCacheService;

@RestController
@RequestMapping("/api/cache")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalysisCacheController {

    @Autowired
    private AnalysisCacheService analysisCacheService;

    @GetMapping("/get")
    public ResponseEntity<?> getCachedAnalysis(
            @RequestParam String username,
            @RequestParam String repoName) {
        
        Map<String, Object> cached = analysisCacheService.getCachedAnalysis(username, repoName);
        
        if (cached == null || cached.isEmpty()) {
            return ResponseEntity.ok(null);
        }
        
        return ResponseEntity.ok(cached);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveAnalysisCache(@RequestBody Map<String, Object> payload) {
        try {
            String username = (String) payload.get("username");
            String repoName = (String) payload.get("repo_name");
            String githubUrl = (String) payload.get("github_url");
            String commitHash = (String) payload.get("last_commit_hash");
            float analysisScore = ((Number) payload.get("analysis_score")).floatValue();
            float authenticity = ((Number) payload.get("authenticity_score")).floatValue();
            float substance = ((Number) payload.get("substance_score")).floatValue();
            float quality = ((Number) payload.get("quality_score")).floatValue();
            float maturity = ((Number) payload.get("maturity_score")).floatValue();
            String tier = (String) payload.get("tier");
            int commits = ((Number) payload.get("total_commits")).intValue();
            float size = ((Number) payload.get("repository_size")).floatValue();
            
            analysisCacheService.saveAnalysisCache(username, repoName, githubUrl, commitHash,
                    analysisScore, authenticity, substance, quality, maturity, tier, commits, size);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Analysis cached successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/should-refresh")
    public ResponseEntity<?> shouldRefreshCache(
            @RequestParam String username,
            @RequestParam String repoName,
            @RequestParam String currentCommit) {
        
        boolean shouldRefresh = analysisCacheService.shouldRefreshCache(username, repoName, currentCommit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("should_refresh", shouldRefresh);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCache(
            @RequestParam String username,
            @RequestParam String repoName) {
        
        analysisCacheService.clearCache(username, repoName);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Cache cleared");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<?> clearAllCache(@RequestParam String username) {
        analysisCacheService.clearAllCache(username);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "All cache cleared for user");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAnalysisHistory(
            @RequestParam String username,
            @RequestParam String repoName) {
        
        Map<String, Object> history = analysisCacheService.getAnalysisHistory(username, repoName);
        return ResponseEntity.ok(history);
    }
}
