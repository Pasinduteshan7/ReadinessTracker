package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "submission_cheating_flags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionCheatingFlags {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private ChallengeSubmission submission;
    
    @Column(nullable = false)
    private Integer pasteAttempts = 0;
    
    @Column(nullable = false)
    private Integer pasteBlockedCount = 0;
    
    @Column(nullable = false)
    private Integer tabSwitches = 0;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String tabSwitchTimestamps;
    
    @Column(nullable = false)
    private Integer keystrokeCount = 0;
    
    @Column
    private Integer averageKeystrokeIntervalMs;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String typingPatternFlags;
    
    @Column(nullable = false)
    private Integer largeInsertions = 0;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String largeInsertionDetails;
    
    @Column(nullable = false)
    private Integer leetcodePatternsFound = 0;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String unusualImports;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal similarityToKnownSolutions;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal namingConventionMatch;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal codeStyleVariance;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal commentDensityVariance;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String extensionsDetected;
    
    @Column(nullable = false)
    private Boolean manualReviewRequired = false;
    
    @Column(length = 255)
    private String reviewReason;
    
    @Column(nullable = false)
    private LocalDateTime flaggedAt;
    
    @Column
    private LocalDateTime reviewedAt;
    
    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;
    
    @Column(length = 50)
    private String finalVerdict;
    
    @PrePersist
    protected void onCreate() {
        flaggedAt = LocalDateTime.now();
    }
}
