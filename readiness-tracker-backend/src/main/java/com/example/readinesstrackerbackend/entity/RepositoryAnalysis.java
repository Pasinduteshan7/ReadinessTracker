package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "repository_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "analysis_job_id", nullable = false)
    private AnalysisJob analysisJob;
    
    @Column
    private String githubUrl;
    
    @Column
    private String repositoryName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column
    private Integer stars;
    
    @Column
    private Integer forks;
    
    @Column
    private String languages;
    
    @Column
    private String tier;
    
    @Column
    private Double overallScore;
    
    @Column
    private Double codeQualityScore;
    
    @Column
    private Double architectureScore;
    
    @Column
    private Double documentationScore;
    
    @Column
    private Double testingScore;
    
    @Column
    private Double bestPracticesScore;
    
    @Column(columnDefinition = "TEXT")
    private String qwenAnalysis;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ProjectScope {
        DEVOPS,
        ML_AI,
        SOFTWARE_ENGINEERING,
        CYBERSECURITY,
        COMMUNICATION
    }
    
    public enum AnalysisStatus {
        PENDING,
        ANALYZING,
        COMPLETED,
        FAILED
    }
}
