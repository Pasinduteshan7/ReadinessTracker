package com.example.readinesstrackerbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileAnalysisSaveRequest {

    @JsonProperty("student_id")
    private Long studentId;

    @JsonProperty("overall_score")
    private Double overallScore;

    @JsonProperty("readiness_level")
    private String readinessLevel;

    @JsonProperty("top_career_path")
    private String topCareerPath;

    @JsonProperty("top_career_match")
    private Double topCareerMatch;

    @JsonProperty("skills_tech_score")
    private Double skillsTechScore;

    @JsonProperty("projects_depth_score")
    private Double projectsDepthScore;

    @JsonProperty("certifications_score")
    private Double certificationsScore;

    @JsonProperty("experience_score")
    private Double experienceScore;

    @JsonProperty("education_score")
    private Double educationScore;

    @JsonProperty("presentation_score")
    private Double presentationScore;

    @JsonProperty("capability_breakdown")
    private JsonNode capabilityBreakdown;

    @JsonProperty("career_compatibility")
    private JsonNode careerCompatibility;

    @JsonProperty("ai_coach_recommendations")
    private JsonNode aiCoachRecommendations;

    @JsonProperty("extracted_skills")
    private JsonNode extractedSkills;

    @JsonProperty("extracted_profile")
    private JsonNode extractedProfile;

    @JsonProperty("pdf_filename")
    private String pdfFilename;
}
