package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_profile_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private Long studentId;

    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    @Column(name = "readiness_level", nullable = false)
    private String readinessLevel;

    @Column(name = "top_career_path")
    private String topCareerPath;

    @Column(name = "top_career_match")
    private Double topCareerMatch;

    @Column(name = "skills_tech_score")
    private Double skillsTechScore;

    @Column(name = "projects_depth_score")
    private Double projectsDepthScore;

    @Column(name = "certifications_score")
    private Double certificationsScore;

    @Column(name = "experience_score")
    private Double experienceScore;

    @Column(name = "education_score")
    private Double educationScore;

    @Column(name = "presentation_score")
    private Double presentationScore;

    @Column(name = "capability_breakdown", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String capabilityBreakdown;

    @Column(name = "career_compatibility", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String careerCompatibility;

    @Column(name = "ai_coach_recommendations", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String aiCoachRecommendations;

    @Column(name = "extracted_skills", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String extractedSkills;

    @Column(name = "extracted_profile", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String extractedProfile;

    @Column(name = "pdf_filename")
    private String pdfFilename;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
