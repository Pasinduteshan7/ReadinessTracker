package com.example.readinesstrackerbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CohortReadinessResponse {
    private List<UnifiedReadinessDTO> rankedStudents;
    private UnifiedReadinessDTO studentReadiness;
    private Integer totalCohortSize;
    private Double averageOverallScore;
    private Double averageAcademicScore;
    private Double averageGithubScore;
    private Double averageIndustryScore;
    private Double averageProfileScore;
    private Double topScore;
}
