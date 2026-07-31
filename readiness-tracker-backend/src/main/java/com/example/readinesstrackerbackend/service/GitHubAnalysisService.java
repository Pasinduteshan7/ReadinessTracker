package com.example.readinesstrackerbackend.service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.example.readinesstrackerbackend.dto.AnalysisRequestDTO;
import com.example.readinesstrackerbackend.dto.AnalysisResultsDTO;
import com.example.readinesstrackerbackend.dto.AnalysisResultsDTO.RepositoryDetail;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.readinesstrackerbackend.entity.AnalysisJob;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.model.User;
import com.example.readinesstrackerbackend.repository.AnalysisJobRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import com.example.readinesstrackerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubAnalysisService {
    private final AnalysisJobRepository analysisJobRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentService studentService;
    private final PythonBridgeService pythonBridgeService;
    private final GitHubApiClient gitHubApiClient;
    public AnalysisJob startAnalysis(AnalysisRequestDTO request) {
        log.info("Starting analysis for: {} (Student ID: {})", request.getGithubUsername(), request.getUserId());

        if (request.getGithubToken() != null && !request.getGithubToken().isEmpty()) {
            log.info("✅ GitHub token provided by user (will increase API rate limits)");
        } else {
            log.warn("⚠️  No GitHub token provided (60 requests/hour limit)");
        }

        if (request.getUserId() == null || request.getUserId() <= 0) {
            log.error("Invalid or missing userId in request");
            throw new IllegalArgumentException("Student ID is required. Please log in again.");
        }

        if (request.getGithubUsername() == null || request.getGithubUsername().isEmpty()) {
            throw new IllegalArgumentException("GitHub username is required");
        }

        Optional<Student> studentOpt = studentRepository.findById(request.getUserId());
        if (studentOpt.isEmpty()) {
            throw new IllegalArgumentException("Student not found with ID: " + request.getUserId());
        }
        Student student = studentOpt.get();
        log.info("Found student: {} with GitHub username: {}", student.getName(), student.getGithubUsername());

        Optional<User> userOpt = userRepository.findByGithubUsername(request.getGithubUsername());
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            log.info("Found existing User for GitHub analysis: {}", user.getId());
        } else {

            user = new User();
            user.setGithubUsername(request.getGithubUsername());
            user.setEmail(student.getEmail());

            user = userRepository.save(user);
            log.info("Created new User for GitHub analysis: {}", user.getId());
        }
        AnalysisJob job = new AnalysisJob();
        job.setUser(user);
        job.setStudent(student);
        job.setStatus(AnalysisJob.JobStatus.PENDING);
        job.setProgress(0);
        job.setGithubUsername(request.getGithubUsername());
        AnalysisJob savedJob = analysisJobRepository.save(job);
        log.info("Analysis job created with ID: {}", savedJob.getId());

        if (request.getGithubToken() != null && !request.getGithubToken().isEmpty()) {
            gitHubApiClient.setGitHubToken(request.getGithubToken());
        }
        performAnalysisAsync(savedJob.getId());
        return savedJob;
    }
    @Async
    public void performAnalysisAsync(Long jobId) {
        try {
            Optional<AnalysisJob> jobOpt = analysisJobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                log.error("Job not found: {}", jobId);
                return;
            }
            AnalysisJob job = jobOpt.get();
            job.setStatus(AnalysisJob.JobStatus.PROCESSING);
            job.setStartedAt(LocalDateTime.now());
            job.setProgress(0);
            analysisJobRepository.save(job);


            log.info("🚀 [Step 1/4] Fetching all repositories from GitHub...");
            job.setCurrentStep("Fetching repositories from GitHub");
            job.setProgress(10);
            analysisJobRepository.save(job);

            // Debug: Check User and githubUsername
            if (job.getUser() == null) {
                log.error("❌ CRITICAL: AnalysisJob user is null! JobId: {}", jobId);
                throw new IllegalStateException("User not associated with AnalysisJob");
            }
            
            String githubUsername = job.getUser().getGithubUsername();
            if (githubUsername == null || githubUsername.isEmpty()) {
                log.error("❌ CRITICAL: GitHub username is null or empty for user: {}", job.getUser().getId());
                throw new IllegalStateException("GitHub username not set for user");
            }
            log.info("✅ Using GitHub username: {}", githubUsername);
            java.util.List<Map<String, Object>> allRepositories = gitHubApiClient.getUserRepositories(githubUsername);
            if (allRepositories.isEmpty()) {
                log.error("No repositories found for user: {}", githubUsername);
                job.setStatus(AnalysisJob.JobStatus.FAILED);
                job.setErrorMessage("No public repositories found for this GitHub user");
                job.setProgress(0);
                analysisJobRepository.save(job);
                return;
            }
            log.info("✅ Successfully fetched {} repositories for analysis", allRepositories.size());
            job.setProgress(15);
            analysisJobRepository.updateProgressOnly(jobId, 15, "Fetching repositories complete");

            log.info("📊 [Step 2/4] Running complete analysis via Python Engine...");
            job.setCurrentStep("AI Engine analyzing repositories...");
            job.setProgress(40);
            analysisJobRepository.updateProgressOnly(jobId, 40, "AI Engine analyzing repositories...");
            
            // The Python endpoint does background analysis, selection, and deep analysis all in one go
            Map<String, Object> dualAnalysisResult = pythonBridgeService.dualDeepAnalysis(allRepositories, githubUsername, gitHubApiClient.getGitHubToken());
            
            job.setProgress(80);
            analysisJobRepository.updateProgressOnly(jobId, 80, "Deep analysis complete");

            log.info("🎯 [Step 4/4] Extracting final scores from AI Engine...");
            job.setCurrentStep("Calculating final neural network score");
            job.setProgress(90);
            analysisJobRepository.updateProgressOnly(jobId, 90, "Extracting final scores from AI Engine");

            // Extract scores directly from the Python response
            Double codeQualityScore = ((Number) dualAnalysisResult.getOrDefault("code_quality_score", 50.0)).doubleValue();
            Double architectureScore = ((Number) dualAnalysisResult.getOrDefault("architecture_score", 50.0)).doubleValue();
            Double documentationScore = ((Number) dualAnalysisResult.getOrDefault("documentation_score", 50.0)).doubleValue();
            Double testingScore = ((Number) dualAnalysisResult.getOrDefault("testing_score", 50.0)).doubleValue();
            Double finalPercentage = ((Number) dualAnalysisResult.getOrDefault("overall_score", 50.0)).doubleValue();
            
            // The python endpoint already selects repos
            @SuppressWarnings("unchecked")
            java.util.List<String> selectedRepos = (java.util.List<String>) dualAnalysisResult.getOrDefault("selected_repositories", new java.util.ArrayList<>());

            job.setProgress(100);
            job.setStatus(AnalysisJob.JobStatus.COMPLETED);
            job.setCompletedAt(LocalDateTime.now());
            job.setCurrentStep("Analysis complete!");

            job.setOverallScore(finalPercentage);
            job.setCodeQualityScore(codeQualityScore);
            job.setArchitectureScore(architectureScore);
            job.setDocumentationScore(documentationScore);
            job.setTestingScore(testingScore);
            job.setTotalRepos(allRepositories.size());
            job.setAnalyzedRepos(selectedRepos.size());
            job.setGithubUsername(githubUsername);

            Map<String, Object> analysisPayload = new HashMap<>();
            analysisPayload.put("github_username", githubUsername);
            analysisPayload.put("overall_score", finalPercentage);
            analysisPayload.put("code_quality_score", codeQualityScore);
            analysisPayload.put("architecture_score", architectureScore);
            analysisPayload.put("documentation_score", documentationScore);
            analysisPayload.put("testing_score", testingScore);
            analysisPayload.put("status", "completed");
            analysisPayload.put("total_repositories", allRepositories.size());
            analysisPayload.put("analyzed_repositories", selectedRepos.size());

            if (job.getStudent() != null) {
                studentService.updateAiAnalysisResult(job.getStudent().getId(), analysisPayload);
            }

            try {
                AnalysisResultsDTO resultsDTO = new AnalysisResultsDTO();
                resultsDTO.setUsername(githubUsername);
                resultsDTO.setTotalRepositories(allRepositories.size());
                resultsDTO.setAnalyzedRepositories(selectedRepos.size());
                resultsDTO.setOverallScore(finalPercentage);
                
                int totalStars = 0;
                int totalForks = 0;
                int totalLanguages = 0;
                
                java.util.List<RepositoryDetail> repoDetails = new java.util.ArrayList<>();
                
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> deepAnalysisResults = (java.util.List<Map<String, Object>>) dualAnalysisResult.getOrDefault("deep_analysis_results", new java.util.ArrayList<>());
                
                for (Map<String, Object> pythonRepoResult : deepAnalysisResults) {
                    String repoName = (String) pythonRepoResult.getOrDefault("repo_name", "unknown");
                    
                    // Find original repo to get stars, forks, languages, description
                    Map<String, Object> originalRepo = allRepositories.stream()
                        .filter(r -> {
                            Object nameObj = r.get("name");
                            return nameObj != null && repoName.equalsIgnoreCase(nameObj.toString());
                        })
                        .findFirst()
                        .orElse(new HashMap<>());
                        
                    int stars = ((Number) originalRepo.getOrDefault("stars", 0)).intValue();
                    int forks = ((Number) originalRepo.getOrDefault("forks", 0)).intValue();
                    String language = (String) originalRepo.getOrDefault("language", "unknown");
                    String desc = (String) originalRepo.getOrDefault("description", "");
                    
                    totalStars += stars;
                    totalForks += forks;
                    if (!"unknown".equals(language)) {
                        totalLanguages++;
                    }
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> analysis = (Map<String, Object>) pythonRepoResult.getOrDefault("analysis", new HashMap<>());
                    Double overallScore = ((Number) analysis.getOrDefault("overall_score", 0.0)).doubleValue();
                    String summary = (String) analysis.getOrDefault("summary", "");
                    
                    Double codeQuality = ((Number) analysis.getOrDefault("code_quality", 0.0)).doubleValue();
                    Double architecture = ((Number) analysis.getOrDefault("architecture", 0.0)).doubleValue();
                    Double repoDocScore = ((Number) analysis.getOrDefault("documentation", 0.0)).doubleValue();
                    Double repoTestScore = ((Number) analysis.getOrDefault("testing", 0.0)).doubleValue();
                    Double bestPractices = ((Number) analysis.getOrDefault("best_practices", 0.0)).doubleValue();
                    
                    RepositoryDetail detail = new RepositoryDetail();
                    detail.setName(repoName);
                    detail.setUrl((String) pythonRepoResult.getOrDefault("repo_url", ""));
                    detail.setScore(overallScore);
                    detail.setStars(stars);
                    detail.setForks(forks);
                    detail.setDescription(desc);
                    
                    detail.setCodeQualityScore(codeQuality);
                    detail.setArchitectureScore(architecture);
                    detail.setDocumentationScore(repoDocScore);
                    detail.setTestingScore(repoTestScore);
                    detail.setBestPracticesScore(bestPractices);
                    
                    if (!"unknown".equals(language)) {
                        detail.setLanguages(java.util.Collections.singletonList(language));
                    } else {
                        detail.setLanguages(new java.util.ArrayList<>());
                    }
                    
                    detail.setQwenAnalysis(summary);
                    detail.setCodeLlamaAnalysis("");
                    detail.setNeuralScore(overallScore);
                    
                    // Assign tier based on score
                    if (overallScore >= 80) {
                        detail.setTier("TIER 1");
                    } else if (overallScore >= 60) {
                        detail.setTier("TIER 2");
                    } else {
                        detail.setTier("TIER 3");
                    }
                    
                    repoDetails.add(detail);
                }
                
                resultsDTO.setTotalStars(totalStars);
                resultsDTO.setTotalForks(totalForks);
                resultsDTO.setAverageLanguagesCount(selectedRepos.isEmpty() ? 0.0 : (double)totalLanguages / selectedRepos.size());
                
                resultsDTO.setCodeQualityScore(codeQualityScore);
                resultsDTO.setArchitectureScore(architectureScore);
                resultsDTO.setDocumentationScore(documentationScore);
                resultsDTO.setTestingScore(testingScore);
                
                resultsDTO.setTier1Count((int) repoDetails.stream().filter(r -> "TIER 1".equals(r.getTier())).count());
                resultsDTO.setTier2Count((int) repoDetails.stream().filter(r -> "TIER 2".equals(r.getTier())).count());
                resultsDTO.setTier3Count((int) repoDetails.stream().filter(r -> "TIER 3".equals(r.getTier())).count());
                
                resultsDTO.setRepositories(repoDetails);
                resultsDTO.setCompletedAt(LocalDateTime.now().toString());

                // AI Employability Metrics
                resultsDTO.setEmployabilityTier((String) dualAnalysisResult.getOrDefault("employability_tier", "Unknown"));
                
                Object profReady = dualAnalysisResult.get("professional_readiness");
                if (profReady instanceof Number) {
                    resultsDTO.setProfessionalReadiness(((Number) profReady).doubleValue());
                }
                
                Object growthPot = dualAnalysisResult.get("growth_potential");
                if (growthPot instanceof Number) {
                    resultsDTO.setGrowthPotential(((Number) growthPot).doubleValue());
                }
                
                resultsDTO.setRecommendedLevel((String) dualAnalysisResult.getOrDefault("recommended_level", "Unknown"));

                ObjectMapper mapper = new ObjectMapper();
                job.setResultsJson(mapper.writeValueAsString(resultsDTO));
                log.info("✅ Analysis results stored");
            } catch (Exception je) {
                log.warn("Could not store results JSON: {}", je.getMessage(), je);
            }
            log.info("✅ Analysis completed!");
            log.info("   Final Score: {}", String.format("%.2f%%", finalPercentage));
            log.info("   Code Quality: {}", String.format("%.2f", codeQualityScore));
            log.info("   Architecture Quality: {}", String.format("%.2f", architectureScore));
            analysisJobRepository.save(job);
        } catch (Exception e) {
            log.error("❌ Error during intelligent analysis: {}", e.getMessage(), e);
            log.error("❌ Exception class: {}", e.getClass().getName());
            log.error("❌ Stack trace:", e);
            Optional<AnalysisJob> jobOpt = analysisJobRepository.findById(jobId);
            if (jobOpt.isPresent()) {
                AnalysisJob job = jobOpt.get();
                job.setStatus(AnalysisJob.JobStatus.FAILED);
                String errMsg = e.getClass().getSimpleName() + ": " + e.getMessage();
                if (errMsg.length() > 250) {
                    errMsg = errMsg.substring(0, 250) + "...";
                }
                job.setErrorMessage(errMsg);
                analysisJobRepository.save(job);
                if (job.getStudent() != null) {
                    Map<String, Object> failedPayload = new HashMap<>();
                    failedPayload.put("status", "failed");
                    failedPayload.put("error_message", job.getErrorMessage());
                    studentService.updateAiAnalysisResult(job.getStudent().getId(), failedPayload);
                }
                log.error("❌ Job {} marked as FAILED with error: {}", jobId, job.getErrorMessage());
            }
        }
    }
    public AnalysisJob getJobById(Long jobId) {
        return analysisJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));
    }
    public Optional<AnalysisJob> getLatestJobForUser(Long userId) {
        return analysisJobRepository.findByUserId(userId).stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
    }
    public AnalysisJob getResultsByUsernameAndUserId(String username, Long userId) {
        log.info("Fetching results for username: {} userId: {}", username, userId);

        if (userId != null) {
            Optional<AnalysisJob> jobOpt = analysisJobRepository
                    .findFirstByGithubUsernameAndUserIdOrderByCreatedAtDesc(username, userId);
            if (jobOpt.isPresent()) {
                AnalysisJob job = jobOpt.get();
                log.info("Found analysis job with status: {}", job.getStatus());
                return job;
            }
        }

        log.info("Trying to find by username only as fallback...");
        // Use database query instead of loading all rows in memory
        List<AnalysisJob> results = analysisJobRepository.findByGithubUsernameOrderByCreatedAtDesc(username);
        return results.isEmpty() ? null : results.get(0);
    }
    public void updateAnalysisJob(AnalysisJob job) {
        log.info("Updating analysis job: {}", job.getId());
        analysisJobRepository.save(job);
        log.info("Analysis job updated with results");
    }

    public GitHubApiClient.TokenValidationResult validateGitHubToken(String token) {
        log.info("🔍 Validating GitHub token in service...");
        return gitHubApiClient.validateToken(token);
    }
}
