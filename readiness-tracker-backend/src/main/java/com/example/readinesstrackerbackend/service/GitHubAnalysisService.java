package com.example.readinesstrackerbackend.service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.example.readinesstrackerbackend.dto.AnalysisRequestDTO;
import com.example.readinesstrackerbackend.dto.AnalysisResultsDTO;
import com.example.readinesstrackerbackend.dto.AnalysisResultsDTO.RepositoryDetail;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.readinesstrackerbackend.entity.AnalysisJob;
import com.example.readinesstrackerbackend.entity.RepositoryAnalysis;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.AnalysisJobRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubAnalysisService {
    private final AnalysisJobRepository analysisJobRepository;
    private final StudentRepository studentRepository;
    private final StudentService studentService;
    private final PythonBridgeService pythonBridgeService;
    private final GitHubApiClient gitHubApiClient;
    private final IndustryDemandService industryDemandService;
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

        AnalysisJob job = new AnalysisJob();
        
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
            if (job.getStudent() == null) {
                log.error("❌ CRITICAL: AnalysisJob user is null! JobId: {}", jobId);
                throw new IllegalStateException("User not associated with AnalysisJob");
            }
            
            String githubUsername = job.getStudent().getGithubUsername();
            if (githubUsername == null || githubUsername.isEmpty()) {
                log.error("❌ CRITICAL: GitHub username is null or empty for user: {}", job.getStudent().getId());
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
                    if (overallScore >= 80) detail.setTier("TIER 1");
                    else if (overallScore >= 60) detail.setTier("TIER 2");
                    else detail.setTier("TIER 3");
                    repoDetails.add(detail);
                    
                    // Create Database Entity
                    RepositoryAnalysis repoAnalysis = new RepositoryAnalysis();
                    repoAnalysis.setAnalysisJob(job);
                    repoAnalysis.setGithubUrl(detail.getUrl());
                    repoAnalysis.setRepositoryName(detail.getName());
                    repoAnalysis.setDescription(detail.getDescription());
                    repoAnalysis.setStars(detail.getStars());
                    repoAnalysis.setForks(detail.getForks());
                    repoAnalysis.setLanguages(String.join(",", detail.getLanguages()));
                    repoAnalysis.setTier(detail.getTier());
                    repoAnalysis.setOverallScore(overallScore);
                    repoAnalysis.setCodeQualityScore(codeQuality);
                    repoAnalysis.setArchitectureScore(architecture);
                    repoAnalysis.setDocumentationScore(repoDocScore);
                    repoAnalysis.setTestingScore(repoTestScore);
                    repoAnalysis.setBestPracticesScore(bestPractices);
                    repoAnalysis.setQwenAnalysis(summary);
                    
                    job.getRepositories().add(repoAnalysis);
                }
                
                                resultsDTO.setTotalStars(totalStars);
                resultsDTO.setTotalForks(totalForks);
                double avgLang = selectedRepos.isEmpty() ? 0.0 : (double)totalLanguages / selectedRepos.size();
                resultsDTO.setAverageLanguagesCount(avgLang);
                
                resultsDTO.setCodeQualityScore(codeQualityScore);
                resultsDTO.setArchitectureScore(architectureScore);
                resultsDTO.setDocumentationScore(documentationScore);
                resultsDTO.setTestingScore(testingScore);
                
                int t1 = (int) repoDetails.stream().filter(r -> "TIER 1".equals(r.getTier())).count();
                int t2 = (int) repoDetails.stream().filter(r -> "TIER 2".equals(r.getTier())).count();
                int t3 = (int) repoDetails.stream().filter(r -> "TIER 3".equals(r.getTier())).count();
                
                resultsDTO.setTier1Count(t1);
                resultsDTO.setTier2Count(t2);
                resultsDTO.setTier3Count(t3);
                
                resultsDTO.setRepositories(repoDetails);
                resultsDTO.setCompletedAt(LocalDateTime.now().toString());

                // AI Employability Metrics
                String empTier = (String) dualAnalysisResult.getOrDefault("employability_tier", "Unknown");
                resultsDTO.setEmployabilityTier(empTier);
                
                double profR = 0.0;
                Object profReady = dualAnalysisResult.get("professional_readiness");
                if (profReady instanceof Number) {
                    profR = ((Number) profReady).doubleValue();
                    resultsDTO.setProfessionalReadiness(profR);
                }
                
                double growthP = 0.0;
                Object growthPot = dualAnalysisResult.get("growth_potential");
                if (growthPot instanceof Number) {
                    growthP = ((Number) growthPot).doubleValue();
                    resultsDTO.setGrowthPotential(growthP);
                }
                
                String recLevel = (String) dualAnalysisResult.getOrDefault("recommended_level", "Unknown");
                resultsDTO.setRecommendedLevel(recLevel);

                ObjectMapper mapper = new ObjectMapper();
                job.setResultsJson(mapper.writeValueAsString(resultsDTO));
                
                // SAVE METADATA TO DATABASE ENTITY
                job.setEmployabilityTier(empTier);
                job.setProfessionalReadiness(profR);
                job.setGrowthPotential(growthP);
                job.setRecommendedLevel(recLevel);
                job.setTotalStars(totalStars);
                job.setTotalForks(totalForks);
                job.setTier1Count(t1);
                job.setTier2Count(t2);
                job.setTier3Count(t3);
                job.setAverageLanguagesCount(avgLang);
                log.info("✅ Analysis results stored");
            } catch (Exception je) {
                log.warn("Could not store results JSON: {}", je.getMessage(), je);
            }
            log.info("✅ Analysis completed!");
            log.info("   Final Score: {}", String.format("%.2f%%", finalPercentage));
            log.info("   Code Quality: {}", String.format("%.2f", codeQualityScore));
            log.info("   Architecture Quality: {}", String.format("%.2f", architectureScore));
            analysisJobRepository.save(job);

            // Auto-extract verified skills from GitHub repositories and persist Industry Readiness to Supabase
            if (job.getStudent() != null) {
                try {
                    Set<String> githubSkills = extractSkillsFromRepositories(allRepositories);
                    if (!githubSkills.isEmpty()) {
                        Student student = job.getStudent();
                        Set<String> mergedSkills = new LinkedHashSet<>(githubSkills);
                        if (student.getSkills() != null && !student.getSkills().isBlank()) {
                            Arrays.stream(student.getSkills().split(","))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .forEach(mergedSkills::add);
                        }
                        student.setSkills(String.join(", ", mergedSkills));
                        studentRepository.save(student);

                        // Recalculate and persist directly to student_industry_readiness in Supabase
                        industryDemandService.calculateAndSaveMatch(student);
                        log.info("✅ Auto-synced GitHub skills to student profile and persisted Industry Readiness in Supabase: {}", mergedSkills);
                    }
                } catch (Exception se) {
                    log.warn("Could not auto-sync GitHub skills to student: {}", se.getMessage());
                }
            }
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
        return analysisJobRepository.findByStudentId(userId).stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
    }
    public AnalysisJob getResultsByUsernameAndUserId(String username, Long userId) {
        log.info("Fetching results for username: {} userId: {}", username, userId);

        if (userId != null) {
            Optional<AnalysisJob> jobOpt = analysisJobRepository
                    .findFirstByGithubUsernameAndStudentIdOrderByCreatedAtDesc(username, userId);
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

    /**
     * Extracts programming languages and framework skills from all GitHub repositories.
     */
    private Set<String> extractSkillsFromRepositories(List<Map<String, Object>> allRepositories) {
        Set<String> detectedSkills = new LinkedHashSet<>();
        if (allRepositories == null || allRepositories.isEmpty()) {
            return detectedSkills;
        }

        // Map keyword variations to canonical industry skill names
        Map<String, String> keywordToSkill = Map.ofEntries(
            Map.entry("react", "React"),
            Map.entry("reactjs", "React"),
            Map.entry("spring", "Spring Boot"),
            Map.entry("springboot", "Spring Boot"),
            Map.entry("spring-boot", "Spring Boot"),
            Map.entry("nextjs", "Next.js"),
            Map.entry("next.js", "Next.js"),
            Map.entry("vue", "Vue"),
            Map.entry("vuejs", "Vue"),
            Map.entry("angular", "Angular"),
            Map.entry("node", "Node.js"),
            Map.entry("nodejs", "Node.js"),
            Map.entry("express", "Express"),
            Map.entry("fastapi", "FastAPI"),
            Map.entry("flask", "Flask"),
            Map.entry("django", "Django"),
            Map.entry("docker", "Docker"),
            Map.entry("kubernetes", "Kubernetes"),
            Map.entry("aws", "AWS"),
            Map.entry("android", "Android"),
            Map.entry("ios", "iOS"),
            Map.entry("swift", "Swift"),
            Map.entry("flutter", "Flutter"),
            Map.entry("react-native", "React Native"),
            Map.entry("mongodb", "MongoDB"),
            Map.entry("postgres", "PostgreSQL"),
            Map.entry("postgresql", "PostgreSQL"),
            Map.entry("mysql", "MySQL"),
            Map.entry("redis", "Redis"),
            Map.entry("graphql", "GraphQL"),
            Map.entry("tailwind", "Tailwind")
        );

        for (Map<String, Object> repo : allRepositories) {
            // 1. Primary Language from repository
            Object langObj = repo.get("language");
            if (langObj != null && !langObj.toString().isBlank() && !"unknown".equalsIgnoreCase(langObj.toString())) {
                detectedSkills.add(langObj.toString().trim());
            }

            // 2. Technologies identified from repository name & description
            String name = repo.getOrDefault("name", "").toString().toLowerCase(Locale.ROOT);
            String desc = repo.getOrDefault("description", "").toString().toLowerCase(Locale.ROOT);
            String combinedText = name + " " + desc;

            for (Map.Entry<String, String> entry : keywordToSkill.entrySet()) {
                if (combinedText.contains(entry.getKey())) {
                    detectedSkills.add(entry.getValue());
                }
            }
        }
        return detectedSkills;
    }
}

