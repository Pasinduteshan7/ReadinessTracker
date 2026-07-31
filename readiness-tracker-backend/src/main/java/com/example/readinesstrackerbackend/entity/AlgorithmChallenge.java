package com.example.readinesstrackerbackend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "algorithm_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlgorithmChallenge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String difficulty;
    
    @Column(nullable = false, unique = true)
    private String problemCode;
    
    @Column(length = 1)
    private String variant;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String exampleInput;
    
    @Column(columnDefinition = "TEXT")
    private String exampleOutput;
    
    @Column(columnDefinition = "TEXT")
    private String constraints;
    
    @Column(nullable = false, columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String testCases;
    
    @Column(nullable = false)
    private Integer maxScore;
    
    @Column(nullable = false)
    private Integer timeLimitMinutes = 30;
    
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String topics;
    
    @Column(length = 100)
    private String expectedTimeComplexity;
    
    @Column(length = 100)
    private String expectedSpaceComplexity;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(columnDefinition = "TEXT")
    private String solutionPreview;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
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
}
