package com.example.readinesstrackerbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryAnalysisResponseDTO {
    
    private String analysisId;
    private String repositoryName;
    private String repositoryOwner;
    private String projectScope;
    private Double finalReadinessScore;
    private String status;
    private Integer progress;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    
    private CategoryBreakdown categoryBreakdown;
    private Map<String, Double> appliedWeights;
    private List<String> recommendations;
    private String errorMessage;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private CategoryScore efficiency;
        private CategoryScore correctness;
        private CategoryScore architecture;
        private CategoryScore security;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryScore {
        private Double score;
        private Double weight;
        private Double weightedContribution;
    }
}
