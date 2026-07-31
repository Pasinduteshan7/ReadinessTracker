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
    
    @Column(unique = true, nullable = false)
    private String analysisId;
    
    @Column
    private String githubUrl;
    
    @Column
    private String repositoryName;
    
    @Column
    private String repositoryOwner;
    
    @Enumerated(EnumType.STRING)
    @Column
    private ProjectScope projectScope;
    
    @Column
    private Double finalReadinessScore = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AnalysisStatus status = AnalysisStatus.PENDING;
    
    @Column
    private Integer progress = 0;
    
    @Column(length = 500)
    private String currentStep;
    
    @Column(length = 1000)
    private String errorMessage;
    
    @Column(columnDefinition = "TEXT")
    private String modelScoresJson; // JSON serialized Map<String, Double>
    
    @Column(columnDefinition = "TEXT")
    private String appliedWeightsJson; // JSON serialized Map<String, Double>
    
    @Column(columnDefinition = "TEXT")
    private String analysisDetailsJson; // Full breakdown with all categories
    
    @Column(columnDefinition = "TEXT")
    private String recommendationsJson; // JSON array of recommendations
    
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
