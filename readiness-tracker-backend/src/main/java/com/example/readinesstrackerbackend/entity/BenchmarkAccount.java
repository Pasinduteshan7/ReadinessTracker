package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "benchmark_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String githubUsername;

    @Column
    private Integer graduationYear;

    @Column(nullable = false)
    private String outcomeLabel; // HIRED_TOP_COMPANY, HIRED_GOOD_COMPANY, HIRED_AVERAGE, FREELANCE_SELF_EMPLOYED

    @Column
    private String companyRole; // optional, admin-only reference

    @Column(nullable = false)
    private Boolean consentConfirmed = false;

    @Column
    private String personalGithubToken;

    @Column
    private Long addedByAdminId;

    @Column(nullable = false, length = 20)
    private String analysisStatus = "PENDING"; // PENDING, ANALYZING, COMPLETED, FAILED

    @Column
    private String errorMessage;

    @Column
    private LocalDateTime lastAnalyzedAt;

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
