import os
import re

base_dir = 'd:/PROJECTS/PERSONAL/group/EMPLOYABILITY READINESS TRACKER/Readiness tracker/readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/service'
path = os.path.join(base_dir, 'GitHubAnalysisService.java')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for RepositoryAnalysis
if 'import com.example.readinesstrackerbackend.entity.RepositoryAnalysis;' not in content:
    content = content.replace('import com.example.readinesstrackerbackend.entity.AnalysisJob;', 'import com.example.readinesstrackerbackend.entity.AnalysisJob;\nimport com.example.readinesstrackerbackend.entity.RepositoryAnalysis;')

# Inside the loop over selectedRepos, replace the RepositoryDetail mapping with RepositoryAnalysis mapping
# First find the block

old_block = """                    RepositoryDetail detail = new RepositoryDetail();
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
                    
                    repoDetails.add(detail);"""

new_block = """                    RepositoryDetail detail = new RepositoryDetail();
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
                    
                    job.getRepositories().add(repoAnalysis);"""

# Because of exact spacing differences, regex is safer:
content = re.sub(r'RepositoryDetail detail = new RepositoryDetail\(\);.*?repoDetails\.add\(detail\);', new_block, content, flags=re.DOTALL)


old_end_block = """                resultsDTO.setTotalStars(totalStars);
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
                job.setResultsJson(mapper.writeValueAsString(resultsDTO));"""

new_end_block = """                resultsDTO.setTotalStars(totalStars);
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
                job.setAverageLanguagesCount(avgLang);"""

content = re.sub(r'resultsDTO\.setTotalStars\(totalStars\);.*?job\.setResultsJson\(mapper\.writeValueAsString\(resultsDTO\)\);', new_end_block, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('GitHubAnalysisService updated successfully')
