package com.example.readinesstrackerbackend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultsDTO {
    private String username;
    private Integer totalRepositories;
    private Integer analyzedRepositories;
    private Double overallScore;
    private Integer totalStars;
    private Integer totalForks;
    private Double averageLanguagesCount;
    private Double codeQualityScore;
    private Double architectureScore;
    private Double documentationScore;
    private Double testingScore;
    private Integer tier1Count;
    private Integer tier2Count;
    private Integer tier3Count;
    private List<RepositoryDetail> repositories;
    private String completedAt;
    
    // AI Employability Metrics
    private String employabilityTier;
    private Double professionalReadiness;
    private Double growthPotential;
    private String recommendedLevel;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepositoryDetail {
        private String name;
        private Double score;
        private String tier;
        private Integer stars;
        private Integer forks;
        private List<String> languages;
        private String description;
        private String url;
        private String qwenAnalysis;
        private String codeLlamaAnalysis;
        private Double neuralScore;
        
        // Added Repo-Specific Metrics
        private Double codeQualityScore;
        private Double architectureScore;
        private Double documentationScore;
        private Double testingScore;
        private Double bestPracticesScore;
    }
}
