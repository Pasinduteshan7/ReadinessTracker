package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "benchmark_analysis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkAnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "benchmark_account_id", nullable = false)
    private BenchmarkAccount benchmarkAccount;

    @Column
    private Double codeQuality;

    @Column
    private Double architecture;

    @Column
    private Double documentation;

    @Column
    private Double testing;

    @Column
    private Double bestPractices;

    @Column
    private Double overallScore;

    @Column(columnDefinition = "TEXT")
    private String deepAnalysisJson;

    @Column(nullable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        if (analyzedAt == null) {
            analyzedAt = LocalDateTime.now();
        }
    }
}
