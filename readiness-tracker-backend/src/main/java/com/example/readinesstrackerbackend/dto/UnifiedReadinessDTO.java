package com.example.readinesstrackerbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnifiedReadinessDTO {
    private Long studentId;
    private String studentName;
    private String email;
    private String registrationNumber;
    private String currentYear;
    private Integer batchYear;
    private String avatarUrl;
    private Double currentGpa;

    // Overall Score & Standing
    private Double overallScore;
    private Integer rank;
    private Double percentile;
    private String readinessTier;
    private Integer evaluatedPillarsCount;

    // The 4 Evaluation Pillars (0 - 100)
    private Double academicScore;
    private Double githubScore;
    private Double industryScore;
    private Double profileScore;

    // Pillar Details & Recommendations
    private String topSpecialization;
    private Double specializationConfidence;
    private String topCareerPath;
    private Double topCareerMatch;
    private String primaryStrength;
    private String primaryGrowthArea;
}
