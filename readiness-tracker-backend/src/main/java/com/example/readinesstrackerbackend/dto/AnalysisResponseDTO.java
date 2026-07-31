package com.example.readinesstrackerbackend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponseDTO {
    private String username;
    private RepositoryStatsDTO repositories;
    private RepoQualityDTO qualityAnalysis;
    private AIDetectionDTO aiDetection;
    private FinalScoreDTO finalScore;
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepositoryStatsDTO {
        private Integer total;
        private Integer publicRepos;
        private Integer privateRepos;
        private Integer stars;
        private Integer forks;
        private String topLanguage;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepoQualityDTO {
        private Double score7b;
        private Double score3b;
        private Double average;
        private MetricsDTO metrics;
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class MetricsDTO {
            private Double codeStructure;
            private Double documentation;
            private Double errorHandling;
            private Double testCoverage;
            private Double readmeQuality;
        }
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIDetectionDTO {
        private Double score;
        private Double likelihood;
        private Double confidence;
        private SignalsDTO signals;
        private String warning;
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SignalsDTO {
            private Boolean perfectStructure;
            private Boolean verboseComments;
            private Boolean suspiciousPatterns;
            private Boolean genericVariableNames;
        }
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinalScoreDTO {
        private Double combined;
        private Integer rank;
        private Double percentile;
        private BreakdownDTO breakdown;
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class BreakdownDTO {
            private Double repoQualityWeight;
            private Double algorithmWeight;
            private Double aiPenaltyWeight;
        }
    }
}
