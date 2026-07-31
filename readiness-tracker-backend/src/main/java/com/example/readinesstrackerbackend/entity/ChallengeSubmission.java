package com.example.readinesstrackerbackend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "challenge_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private AlgorithmChallenge challenge;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;
    
    @Column(nullable = false)
    private String language = "python";
    
    @Column(nullable = false)
    private Integer testCasesPassed = 0;
    
    @Column(nullable = false)
    private Integer testCasesTotal = 0;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal passRate;
    
    @Column
    private Long executionTimeMs;
    
    @Column(columnDefinition = "TEXT")
    private String executionError;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal llmCorrectnessScore = BigDecimal.ZERO;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal llmEfficiencyScore = BigDecimal.ZERO;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal llmQualityScore = BigDecimal.ZERO;
    
    @Column(columnDefinition = "TEXT")
    private String llmFeedback;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal finalScore = BigDecimal.ZERO;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String scoreBreakdown;
    
    @Column
    private Integer timeTakenSeconds;
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(nullable = false)
    private Boolean isFlagged = false;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String cheatFlags;
    
    @Column(length = 20)
    private String suspiciousLevel;
    
    @Column
    private Integer codeLines;
    
    @Column
    private Integer codeComplexity;
    
    @Column
    private Boolean hasComments;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal commentRatio;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
