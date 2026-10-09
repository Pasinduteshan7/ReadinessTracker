package com.example.readinesstrackerbackend.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String name;
    @Column(unique = true)
    private String registrationNumber;
    @Column(unique = true)
    private String email;
    @Column
    private String password;
    @Column
    private String currentYear;
    @Column(nullable = true)
    private Double currentGpa;
    @Column(nullable = true)
    private String githubUsername;
    @Column(nullable = true, unique = true)
    private Long githubId;
    @Column(length = 1000)
    private String githubToken;
    @Column(length = 500)
    private String avatarUrl;
    @Column
    private Integer followers = 0;

    @Column(nullable = true)
    private String linkedinUrl;
    @Column(nullable = true)
    private String facebookUrl;
    @Column(nullable = true)
    private Integer batchYear;
    @Column(name = "created_at")
    private Long createdAt;
    @Column(name = "latest_ai_overall_score")
    private Double latestAiOverallScore;
    @Column(name = "latest_ai_code_quality_score")
    private Double latestAiCodeQualityScore;
    @Column(name = "latest_ai_architecture_score")
    private Double latestAiArchitectureScore;
    @Column(name = "latest_ai_documentation_score")
    private Double latestAiDocumentationScore;
    @Column(name = "latest_ai_testing_score")
    private Double latestAiTestingScore;
    @Column(name = "latest_ai_status")
    private String latestAiStatus;
    @Column(name = "ai_analysis_result_json", columnDefinition = "TEXT")
    private String aiAnalysisResultJson;
}
