package com.example.readinesstrackerbackend.controller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.readinesstrackerbackend.dto.AnalysisRequestDTO;
import com.example.readinesstrackerbackend.dto.AnalysisResultsDTO;
import com.example.readinesstrackerbackend.entity.AnalysisJob;
import com.example.readinesstrackerbackend.dto.BenchmarkBaselineDTO;
import com.example.readinesstrackerbackend.service.BenchmarkService;
import com.example.readinesstrackerbackend.service.GitHubAnalysisService;
import com.example.readinesstrackerbackend.service.GitHubApiClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
@Slf4j
public class GitHubAnalysisController {
    private final GitHubAnalysisService githubAnalysisService;
    private final BenchmarkService benchmarkService;
    @PostMapping("/analyze")
    public ResponseEntity<?> startAnalysis(@RequestBody AnalysisRequestDTO request) {
        try {
            log.info("Starting analysis for: {}", request.getGithubUsername());
            AnalysisJob job = githubAnalysisService.startAnalysis(request);
            return ResponseEntity.ok(new JobStartResponse(
                    job.getId().toString(),
                    job.getStatus().toString(),
                    job.getProgress()
            ));
        } catch (Exception e) {
            log.error("Error starting analysis", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    @GetMapping("/analysis/{jobId}/progress")
    public ResponseEntity<?> getProgress(@PathVariable Long jobId) {
        try {
            AnalysisJob job = githubAnalysisService.getJobById(jobId);
            return ResponseEntity.ok(new JobProgressResponse(
                    job.getId().toString(),
                    job.getStatus().toString(),
                    job.getProgress(),
                    job.getCurrentStep(),
                    job.getErrorMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting progress", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    @GetMapping("/results")
    public ResponseEntity<?> getResults(
            @RequestParam String username,
            @RequestParam Long userId) {
        try {
            log.info("Fetching analysis results for username: {} userId: {}", username, userId);
            AnalysisJob job = githubAnalysisService.getResultsByUsernameAndUserId(username, userId);
            if (job == null || job.getResultsJson() == null || job.getResultsJson().isEmpty()) {
                log.warn("No results found for username: {} userId: {}", username, userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Analysis results not found yet"));
            }

            ObjectMapper mapper = new ObjectMapper();
            AnalysisResultsDTO results = mapper.readValue(job.getResultsJson(), AnalysisResultsDTO.class);
            log.info("Returning analysis results for {}", username);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("❌ Error fetching results for username: {} - Error: {}", username, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "Unknown")));
        }
    }
    @PostMapping("/save-results")
    public ResponseEntity<?> saveAnalysisResults(@RequestBody AnalysisResultsDTO analysisResults) {
        try {
            log.info("Saving analysis results for username: {}", analysisResults.getUsername());

            AnalysisJob job = githubAnalysisService.getResultsByUsernameAndUserId(
                analysisResults.getUsername(), 
                null
            );
            if (job == null) {
                log.error("No analysis job found for username: {}", analysisResults.getUsername());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Analysis job not found"));
            }

            job.setOverallScore(analysisResults.getOverallScore());
            job.setCodeQualityScore(analysisResults.getCodeQualityScore());
            job.setArchitectureScore(analysisResults.getArchitectureScore());
            job.setDocumentationScore(analysisResults.getDocumentationScore());
            job.setTestingScore(analysisResults.getTestingScore());
            job.setTotalRepos(analysisResults.getTotalRepositories());
            job.setAnalyzedRepos(analysisResults.getAnalyzedRepositories());

            StringBuilder json = new StringBuilder("{");
            json.append("\"username\":\"").append(analysisResults.getUsername()).append("\",");
            json.append("\"overallScore\":").append(analysisResults.getOverallScore()).append(",");
            json.append("\"codeQualityScore\":").append(analysisResults.getCodeQualityScore()).append(",");
            json.append("\"architectureScore\":").append(analysisResults.getArchitectureScore()).append(",");
            json.append("\"documentationScore\":").append(analysisResults.getDocumentationScore()).append(",");
            json.append("\"testingScore\":").append(analysisResults.getTestingScore()).append(",");
            json.append("\"totalRepositories\":").append(analysisResults.getTotalRepositories()).append(",");
            json.append("\"analyzedRepositories\":").append(analysisResults.getAnalyzedRepositories()).append(",");
            json.append("\"tier1Count\":").append(analysisResults.getTier1Count()).append(",");
            json.append("\"tier2Count\":").append(analysisResults.getTier2Count()).append(",");
            json.append("\"tier3Count\":").append(analysisResults.getTier3Count());
            json.append("}");
            job.setResultsJson(json.toString());
            githubAnalysisService.updateAnalysisJob(job);
            log.info("Analysis results saved for username: {}", analysisResults.getUsername());
            return ResponseEntity.ok(new SuccessResponse("Results saved successfully"));
        } catch (Exception e) {
            log.error("Error saving analysis results", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateGitHubToken(@RequestParam String token) {
        try {
            log.info("🔍 Validating GitHub token (token length: {})", token != null ? token.length() : 0);
            
            if (token == null || token.trim().isEmpty()) {
                log.warn("⚠️  Token validation failed: Empty token");
                return ResponseEntity.ok(new TokenValidationResponse(
                        false,
                        "Token is empty"
                ));
            }

            GitHubApiClient.TokenValidationResult result = githubAnalysisService.validateGitHubToken(token);
            
            log.info("Token validation result: valid={}, message={}", result.isValid(), result.getMessage());
            return ResponseEntity.ok(new TokenValidationResponse(
                    result.isValid(),
                    result.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error validating GitHub token", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TokenValidationResponse(
                            false,
                            "Error validating token: " + e.getMessage()
                    ));
        }
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class TokenValidationResponse {
        private boolean valid;
        private String message;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class JobStartResponse {
        private String jobId;
        private String status;
        private Integer progress;
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class JobProgressResponse {
        private String jobId;
        private String status;
        private Integer progress;
        private String currentStep;
        private String errorMessage;
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class ErrorResponse {
        private String message;
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class ResultsResponse {
        private String data;
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class SuccessResponse {
        private String message;
    }

    /**
     * Student-facing endpoint to get benchmark baseline for comparison
     */
    @GetMapping("/benchmark-baseline")
    public ResponseEntity<?> getBenchmarkBaseline() {
        try {
            BenchmarkBaselineDTO baseline = benchmarkService.getBaseline();
            return ResponseEntity.ok(baseline);
        } catch (Exception e) {
            log.error("Error fetching benchmark baseline for student", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to get baseline: " + e.getMessage()));
        }
    }
}
