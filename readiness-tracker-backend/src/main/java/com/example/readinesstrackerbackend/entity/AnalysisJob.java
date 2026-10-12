package com.example.readinesstrackerbackend.entity;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "analysis_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String jobId;
@ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobStatus status = JobStatus.PENDING;
    @Column
    private Integer progress = 0;
    private String currentStep;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @Column(columnDefinition = "TEXT")
    private String resultsJson;
    @Column(nullable = true)
    private String githubUsername;

    @Column(nullable = true)
    private Double overallScore;
    @Column(nullable = true)
    private Double codeQualityScore;
    @Column(nullable = true)
    private Double architectureScore;
    @Column(nullable = true)
    private Double documentationScore;
    @Column(nullable = true)
    private Double testingScore;
    @Column(nullable = true)
    private Integer totalRepos;
    @Column(nullable = true)
    private Integer analyzedRepos;

    @Column(nullable = true)
    private String employabilityTier;
    
    @Column(nullable = true)
    private Double professionalReadiness;
    
    @Column(nullable = true)
    private Double growthPotential;
    
    @Column(nullable = true)
    private String recommendedLevel;
    
    @Column(nullable = true)
    private Integer totalStars;
    
    @Column(nullable = true)
    private Integer totalForks;
    
    @Column(nullable = true)
    private Integer tier1Count;
    
    @Column(nullable = true)
    private Integer tier2Count;
    
    @Column(nullable = true)
    private Integer tier3Count;
    
    @Column(nullable = true)
    private Double averageLanguagesCount;
    
    @OneToMany(mappedBy = "analysisJob", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepositoryAnalysis> repositories = new ArrayList<>();
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        jobId = java.util.UUID.randomUUID().toString();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    public enum JobStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
