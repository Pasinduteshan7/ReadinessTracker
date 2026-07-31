package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.dto.BenchmarkAccountDTO;
import com.example.readinesstrackerbackend.dto.BenchmarkBaselineDTO;
import com.example.readinesstrackerbackend.entity.BenchmarkAccount;
import com.example.readinesstrackerbackend.entity.BenchmarkAnalysisResult;
import com.example.readinesstrackerbackend.repository.BenchmarkAccountRepository;
import com.example.readinesstrackerbackend.repository.BenchmarkAnalysisResultRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BenchmarkService {

    private final BenchmarkAccountRepository benchmarkAccountRepository;
    private final BenchmarkAnalysisResultRepository benchmarkAnalysisResultRepository;
    private final PythonBridgeService pythonBridgeService;
    private final GitHubApiClient gitHubApiClient;
    private final ObjectMapper objectMapper;

    /**
     * Add a new benchmark account (admin action)
     */
    public BenchmarkAccount addBenchmarkAccount(BenchmarkAccountDTO dto) {
        log.info("Adding benchmark account: {} ({})", dto.getFullName(), dto.getGithubUsername());

        if (benchmarkAccountRepository.existsByGithubUsername(dto.getGithubUsername())) {
            throw new IllegalArgumentException("Benchmark account with username '" + dto.getGithubUsername() + "' already exists");
        }

        BenchmarkAccount account = new BenchmarkAccount();
        account.setFullName(dto.getFullName());
        account.setGithubUsername(dto.getGithubUsername());
        account.setGraduationYear(dto.getGraduationYear());
        account.setOutcomeLabel(dto.getOutcomeLabel());
        account.setCompanyRole(dto.getCompanyRole());
        account.setConsentConfirmed(dto.getConsentConfirmed() != null ? dto.getConsentConfirmed() : false);
        account.setPersonalGithubToken(dto.getPersonalGithubToken());
        account.setAnalysisStatus("PENDING");

        BenchmarkAccount saved = benchmarkAccountRepository.save(account);
        log.info("✅ Benchmark account added with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Get all benchmark accounts
     */
    public List<BenchmarkAccount> getAllBenchmarkAccounts() {
        return benchmarkAccountRepository.findAll();
    }

    /**
     * Delete a benchmark account and its analysis results
     */
    @Transactional
    public void deleteBenchmarkAccount(Long id) {
        log.info("Deleting benchmark account: {}", id);
        BenchmarkAccount account = benchmarkAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Benchmark account not found with ID: " + id));

        benchmarkAnalysisResultRepository.deleteByBenchmarkAccountId(id);
        benchmarkAccountRepository.delete(account);
        log.info("✅ Benchmark account {} deleted", id);
    }

    /**
     * Trigger analysis for a single benchmark account.
     * Reuses the same PythonBridgeService and GitHubApiClient that student analysis uses.
     */
    @Async
    public void analyzeBenchmarkAccount(Long accountId, String tokenOverride) {
        log.info("🚀 Starting benchmark analysis for account ID: {}", accountId);

        Optional<BenchmarkAccount> accountOpt = benchmarkAccountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            log.error("Benchmark account not found: {}", accountId);
            return;
        }

        BenchmarkAccount account = accountOpt.get();
        account.setAnalysisStatus("ANALYZING");
        account.setErrorMessage(null);
        benchmarkAccountRepository.save(account);

        try {
            String githubUsername = account.getGithubUsername();
            log.info("📊 Fetching repositories for benchmark user: {}", githubUsername);

            // Step 1: Fetch all repos using the token override if provided
            List<Map<String, Object>> allRepositories = gitHubApiClient.getUserRepositories(githubUsername, tokenOverride);

            if (allRepositories.isEmpty()) {
                log.warn("No public repositories found for benchmark user: {}", githubUsername);
                account.setAnalysisStatus("FAILED");
                account.setErrorMessage("No public repositories found");
                benchmarkAccountRepository.save(account);
                return;
            }

            log.info("✅ Found {} repositories for {}", allRepositories.size(), githubUsername);

            // Step 2: Call the Python AI Engine via PythonBridgeService
            String personalToken = account.getPersonalGithubToken();
            String activeToken = (personalToken != null && !personalToken.trim().isEmpty()) 
                                    ? personalToken 
                                    : ((tokenOverride != null && !tokenOverride.trim().isEmpty()) 
                                        ? tokenOverride 
                                        : gitHubApiClient.getGitHubToken());
                                        
            log.info("🧠 Sending to AI Engine for deep analysis...");
            Map<String, Object> analysisResult = pythonBridgeService.dualDeepAnalysis(
                    allRepositories, githubUsername, activeToken
            );

            // Step 3: Extract scores from the Python response
            Double codeQuality = ((Number) analysisResult.getOrDefault("code_quality_score", 50.0)).doubleValue();
            Double architecture = ((Number) analysisResult.getOrDefault("architecture_score", 50.0)).doubleValue();
            Double documentation = ((Number) analysisResult.getOrDefault("documentation_score", 50.0)).doubleValue();
            Double testing = ((Number) analysisResult.getOrDefault("testing_score", 50.0)).doubleValue();
            Double bestPractices = ((Number) analysisResult.getOrDefault("best_practices_score", 50.0)).doubleValue();
            Double overallScore = ((Number) analysisResult.getOrDefault("overall_score", 50.0)).doubleValue();

            // Step 4: Save the analysis result
            BenchmarkAnalysisResult result = new BenchmarkAnalysisResult();
            result.setBenchmarkAccount(account);
            result.setCodeQuality(codeQuality);
            result.setArchitecture(architecture);
            result.setDocumentation(documentation);
            result.setTesting(testing);
            result.setBestPractices(bestPractices);
            result.setOverallScore(overallScore);
            result.setAnalyzedAt(LocalDateTime.now());

            try {
                result.setDeepAnalysisJson(objectMapper.writeValueAsString(analysisResult));
            } catch (Exception jsonEx) {
                log.warn("Could not serialize deep analysis JSON: {}", jsonEx.getMessage());
            }

            benchmarkAnalysisResultRepository.save(result);

            // Step 5: Update account status
            account.setAnalysisStatus("COMPLETED");
            account.setLastAnalyzedAt(LocalDateTime.now());
            account.setErrorMessage(null);
            benchmarkAccountRepository.save(account);

            log.info("✅ Benchmark analysis completed for {}", githubUsername);
            log.info("   Overall Score: {}", String.format("%.2f", overallScore));
            log.info("   Code Quality: {}", String.format("%.2f", codeQuality));
            log.info("   Architecture: {}", String.format("%.2f", architecture));
            log.info("   Documentation: {}", String.format("%.2f", documentation));
            log.info("   Testing: {}", String.format("%.2f", testing));

        } catch (Exception e) {
            log.error("❌ Benchmark analysis failed for account {}: {}", accountId, e.getMessage(), e);
            account.setAnalysisStatus("FAILED");
            String errMsg = e.getClass().getSimpleName() + ": " + e.getMessage();
            if (errMsg.length() > 250) {
                errMsg = errMsg.substring(0, 250) + "...";
            }
            account.setErrorMessage(errMsg);
            benchmarkAccountRepository.save(account);
        }
    }

    /**
     * Trigger analysis for all benchmark accounts that are PENDING or need re-analysis
     */
    public void analyzeAllBenchmarks(String tokenOverride) {
        List<BenchmarkAccount> allAccounts = benchmarkAccountRepository.findAll();
        log.info("🚀 Starting batch benchmark analysis for {} accounts", allAccounts.size());

        for (BenchmarkAccount account : allAccounts) {
            if (!"ANALYZING".equals(account.getAnalysisStatus())) {
                analyzeBenchmarkAccount(account.getId(), tokenOverride);
            } else {
                log.info("⏭️  Skipping {} — already analyzing", account.getGithubUsername());
            }
        }
    }

    /**
     * Get the aggregated baseline from all completed benchmark analyses.
     * Returns averages, standard deviation, and sample size.
     */
    public BenchmarkBaselineDTO getBaseline() {
        try {
            Object[] raw = benchmarkAnalysisResultRepository.getBaselineAverages();

            if (raw == null || raw.length == 0 || raw[0] == null) {
                return new BenchmarkBaselineDTO(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0L);
            }

            Object[] row;
            if (raw[0] instanceof Object[]) {
                row = (Object[]) raw[0];
            } else {
                row = raw;
            }

            BenchmarkBaselineDTO baseline = new BenchmarkBaselineDTO();
            baseline.setAvgCodeQuality(toDouble(row[0]));
            baseline.setAvgArchitecture(toDouble(row[1]));
            baseline.setAvgDocumentation(toDouble(row[2]));
            baseline.setAvgTesting(toDouble(row[3]));
            baseline.setAvgBestPractices(toDouble(row[4]));
            baseline.setAvgOverallScore(toDouble(row[5]));
            baseline.setSampleSize(toLong(row[6]));

            // Compute standard deviation
            List<Double> scores = benchmarkAnalysisResultRepository.getCompletedOverallScores();
            double stdDev = calculateStdDev(scores, baseline.getAvgOverallScore());
            baseline.setScoreSpread(stdDev);

            log.info("📊 Benchmark baseline: overall={}, sampleSize={}", 
                    String.format("%.2f", baseline.getAvgOverallScore()), baseline.getSampleSize());

            return baseline;

        } catch (Exception e) {
            log.error("Error computing benchmark baseline: {}", e.getMessage(), e);
            return new BenchmarkBaselineDTO(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0L);
        }
    }

    private double calculateStdDev(List<Double> scores, double mean) {
        if (scores == null || scores.size() < 2) return 0.0;
        double sum = 0.0;
        for (double score : scores) {
            sum += Math.pow(score - mean, 2);
        }
        return Math.sqrt(sum / (scores.size() - 1)); // Sample standard deviation
    }

    /**
     * Get the latest analysis result for a specific benchmark account
     */
    public Optional<BenchmarkAnalysisResult> getLatestResult(Long accountId) {
        return benchmarkAnalysisResultRepository.findFirstByBenchmarkAccountIdOrderByAnalyzedAtDesc(accountId);
    }

    // ---- Helper methods for safe type conversion from native query results ----

    private Double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof BigDecimal) return ((BigDecimal) value).doubleValue();
        if (value instanceof Number) return ((Number) value).doubleValue();
        return 0.0;
    }

    private Long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof BigDecimal) return ((BigDecimal) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        return 0L;
    }
}
