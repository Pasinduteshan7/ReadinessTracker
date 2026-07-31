package com.example.readinesstrackerbackend.service;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.readinesstrackerbackend.config.ApplicationProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@SuppressWarnings("unchecked")
@Service
@RequiredArgsConstructor
@Slf4j
public class PythonBridgeService {
    private final RestTemplate restTemplate;
    @Qualifier("analysisRestTemplate")
    private final RestTemplate analysisRestTemplate;
    private final ApplicationProperties applicationProperties;
    public Map<String, Object> performBackgroundAnalysis(List<Map<String, Object>> repositories, String username) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/api/analyze/complete";
            log.info("🔍 Performing complete fine-tuned analysis for {}", username);

            Map<String, Object> request = new java.util.HashMap<>();
            request.put("github_username", username);
            request.put("github_token", "");
            request.put("user_id", username);
            request.put("max_repos", 10);

            Map response = restTemplate.postForObject(url, request, Map.class);
            return response;
        } catch (Exception e) {
            log.error("❌ Error in complete analysis: {}", e.getMessage());
            return Map.of("selected_for_deep_analysis", List.of());
        }
    }
    public Map<String, Object> fetchGitHubRepos(String username) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/analyze/fetch-repos";
            Map<String, String> request = Map.of("github_username", username);
            log.info("Fetching repos from Python engine: {}", url);
            Map response = restTemplate.postForObject(url, request, Map.class);
            return response;
        } catch (Exception e) {
            log.error("Error fetching repos: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch repositories", e);
        }
    }
    public Map<String, Object> analyzeRepoQuality(Map<String, Object> repoData) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/analyze/quality";
            log.info("Analyzing quality from Python engine: {}", url);
            Map response = restTemplate.postForObject(url, repoData, Map.class);
            return response;
        } catch (Exception e) {
            log.error("Error analyzing quality: {}", e.getMessage());
            throw new RuntimeException("Failed to analyze quality", e);
        }
    }
    public Map<String, Object> detectAIPatterns(Map<String, Object> repoData) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/analyze/ai-detection";
            log.info("Detecting AI patterns from Python engine: {}", url);
            Map response = restTemplate.postForObject(url, repoData, Map.class);
            return response;
        } catch (Exception e) {
            log.error("Error detecting AI patterns: {}", e.getMessage());
            throw new RuntimeException("Failed to detect AI patterns", e);
        }
    }
    public Double calculateNeuralScore(Double repoQuality, Double aiPenalty, Double algorithmScore) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + 
                    "/score/neural-network?repo_quality=" + repoQuality + 
                    "&ai_penalty=" + aiPenalty + 
                    "&algorithm_score=" + algorithmScore;
            log.info("Calculating neural score from Python engine: {}", url);
            Map response = restTemplate.getForObject(url, Map.class);
            return (Double) response.get("final_score");
        } catch (Exception e) {
            log.error("Error calculating neural score: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate score", e);
        }
    }

    public Map<String, Object> selectBestRepositories(java.util.List<Map<String, Object>> allRepositories, int limit) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/api/intelligent/select-repos?limit=" + limit;
            log.info("🔵 Selecting best {} repositories from {} total using Qwen", limit, allRepositories.size());
            log.info("📤 Sending to AI Engine: POST {}", url);
            if (allRepositories == null || allRepositories.isEmpty()) {
                log.error("❌ No repositories provided to select from");
                throw new RuntimeException("No repositories provided for selection");
            }

            if (!allRepositories.isEmpty()) {
                log.debug("📋 Sample repo structure: {}", allRepositories.get(0));
            }

            Map response = restTemplate.postForObject(url, allRepositories, Map.class);
            log.info("✅ Successfully selected best repositories from AI Engine");
            return response;
        } catch (Exception e) {
            log.error("❌ Error selecting repositories from AI Engine", e);
            log.error("   Error message: {}", e.getMessage());
            log.error("   Exception type: {}", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                log.error("   Root cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to select repositories", e);
        }
    }
    public Map<String, Object> dualDeepAnalysis(java.util.List<Map<String, Object>> selectedRepositories) {
        return dualDeepAnalysis(selectedRepositories, null, null);
    }
    public Map<String, Object> dualDeepAnalysis(java.util.List<Map<String, Object>> selectedRepositories, String githubUsername, String githubToken) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/api/analyze/complete";
            log.info("🔍 Starting fine-tuned analysis for {} repositories", selectedRepositories.size());
            Map<String, Object> request = new java.util.HashMap<>();
            request.put("github_username", githubUsername);
            request.put("github_token", githubToken != null ? githubToken : "");
            request.put("user_id", githubUsername);
            request.put("max_repos", Math.min(selectedRepositories.size(), 10));
            Map response = analysisRestTemplate.postForObject(url, request, Map.class);
            log.info("✅ Fine-tuned analysis completed successfully");
            return response;
        } catch (Exception e) {
            log.error("❌ Error in fine-tuned analysis: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("   Root cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to perform fine-tuned analysis", e);
        }
    }
    public Map<String, Object> calculateIntelligentNeuralScore(
            Double repoQuality7b,
            Double repoQuality3b,
            Double aiDetectionPenalty,
            Double documentation,
            Double security,
            Double edgeCases) {
        try {
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("percentage", Math.max(0.0, Math.min(100.0, ((repoQuality7b + repoQuality3b + documentation + security) / 4.0))));
            result.put("status", "completed");
            return result;
        } catch (Exception e) {
            log.error("Error calculating intelligent neural score: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate intelligent score", e);
        }
    }
    public Map<String, Object> completeIntelligentAnalysis(java.util.List<Map<String, Object>> allRepositories, int limit) {
        try {
            String url = applicationProperties.getAi().getEngine().getUrl() + "/api/intelligent/complete-analysis?limit=" + limit;
            log.info("Starting complete intelligent analysis workflow for {} repositories", allRepositories.size());
            log.info("  → Step 1: Select best {} repos (Qwen)", limit);
            log.info("  → Step 2: Deep analysis on selected (CodeLlama + Qwen parallel)");
            log.info("  → Step 3: Neural network score combining");
            Map response = restTemplate.postForObject(url, allRepositories, Map.class);
            return response;
        } catch (Exception e) {
            log.error("Error in complete intelligent analysis: {}", e.getMessage());
            throw new RuntimeException("Failed to perform complete intelligent analysis", e);
        }
    }
}
