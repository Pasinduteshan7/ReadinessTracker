package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.BenchmarkAccountDTO;
import com.example.readinesstrackerbackend.dto.BenchmarkBaselineDTO;
import com.example.readinesstrackerbackend.entity.BenchmarkAccount;
import com.example.readinesstrackerbackend.entity.BenchmarkAnalysisResult;
import com.example.readinesstrackerbackend.service.BenchmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/benchmarks")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
@Slf4j
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    /**
     * Add a new benchmark account
     */
    @PostMapping
    public ResponseEntity<?> addBenchmarkAccount(@RequestBody BenchmarkAccountDTO dto) {
        try {
            log.info("Adding benchmark account: {} ({})", dto.getFullName(), dto.getGithubUsername());
            BenchmarkAccount account = benchmarkService.addBenchmarkAccount(dto);
            return ResponseEntity.ok(account);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to add benchmark: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error adding benchmark account", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to add benchmark: " + e.getMessage()));
        }
    }

    /**
     * List all benchmark accounts with their latest scores
     */
    @GetMapping
    public ResponseEntity<?> getAllBenchmarkAccounts() {
        try {
            List<BenchmarkAccount> accounts = benchmarkService.getAllBenchmarkAccounts();

            // Enrich each account with its latest analysis scores
            List<Map<String, Object>> enrichedAccounts = accounts.stream().map(account -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", account.getId());
                map.put("fullName", account.getFullName());
                map.put("githubUsername", account.getGithubUsername());
                map.put("graduationYear", account.getGraduationYear());
                map.put("outcomeLabel", account.getOutcomeLabel());
                map.put("companyRole", account.getCompanyRole());
                map.put("consentConfirmed", account.getConsentConfirmed());
                map.put("analysisStatus", account.getAnalysisStatus());
                map.put("errorMessage", account.getErrorMessage());
                map.put("lastAnalyzedAt", account.getLastAnalyzedAt());
                map.put("createdAt", account.getCreatedAt());

                // Attach latest scores if available
                Optional<BenchmarkAnalysisResult> latestResult = benchmarkService.getLatestResult(account.getId());
                if (latestResult.isPresent()) {
                    BenchmarkAnalysisResult result = latestResult.get();
                    map.put("codeQuality", result.getCodeQuality());
                    map.put("architecture", result.getArchitecture());
                    map.put("documentation", result.getDocumentation());
                    map.put("testing", result.getTesting());
                    map.put("bestPractices", result.getBestPractices());
                    map.put("overallScore", result.getOverallScore());
                }

                return map;
            }).toList();

            return ResponseEntity.ok(enrichedAccounts);
        } catch (Exception e) {
            log.error("Error fetching benchmark accounts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch benchmarks: " + e.getMessage()));
        }
    }

    /**
     * Delete a benchmark account
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBenchmarkAccount(@PathVariable Long id) {
        try {
            benchmarkService.deleteBenchmarkAccount(id);
            return ResponseEntity.ok(Map.of("message", "Benchmark account deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting benchmark account", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete: " + e.getMessage()));
        }
    }

    /**
     * Trigger analysis for a single benchmark account
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeBenchmarkAccount(@PathVariable Long id, @RequestParam(required = false) String githubToken) {
        try {
            log.info("Triggering benchmark analysis for account ID: {}", id);
            benchmarkService.analyzeBenchmarkAccount(id, githubToken);
            return ResponseEntity.ok(Map.of(
                    "message", "Analysis started for benchmark account " + id,
                    "status", "ANALYZING"
            ));
        } catch (Exception e) {
            log.error("Error starting benchmark analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to start analysis: " + e.getMessage()));
        }
    }

    /**
     * Trigger analysis for all benchmark accounts
     */
    @PostMapping("/analyze-all")
    public ResponseEntity<?> analyzeAllBenchmarks(@RequestParam(required = false) String githubToken) {
        try {
            log.info("Triggering analysis for all benchmark accounts");
            benchmarkService.analyzeAllBenchmarks(githubToken);
            return ResponseEntity.ok(Map.of(
                    "message", "Analysis started for all benchmark accounts",
                    "status", "ANALYZING"
            ));
        } catch (Exception e) {
            log.error("Error starting batch benchmark analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to start batch analysis: " + e.getMessage()));
        }
    }

    /**
     * Get the aggregated baseline scores from all completed benchmark analyses
     */
    @GetMapping("/baseline")
    public ResponseEntity<?> getBaseline() {
        try {
            BenchmarkBaselineDTO baseline = benchmarkService.getBaseline();
            return ResponseEntity.ok(baseline);
        } catch (Exception e) {
            log.error("Error fetching benchmark baseline", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to compute baseline: " + e.getMessage()));
        }
    }
}
