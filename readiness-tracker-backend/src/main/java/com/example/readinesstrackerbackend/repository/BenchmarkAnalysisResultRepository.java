package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.BenchmarkAnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BenchmarkAnalysisResultRepository extends JpaRepository<BenchmarkAnalysisResult, Long> {

    List<BenchmarkAnalysisResult> findByBenchmarkAccountIdOrderByAnalyzedAtDesc(Long benchmarkAccountId);

    Optional<BenchmarkAnalysisResult> findFirstByBenchmarkAccountIdOrderByAnalyzedAtDesc(Long benchmarkAccountId);

    void deleteByBenchmarkAccountId(Long benchmarkAccountId);

    /**
     * Aggregation query to compute the baseline averages from all completed benchmark analyses using JPQL.
     * Returns: [avgCodeQuality, avgArchitecture, avgDocumentation, avgTesting, avgBestPractices, avgOverallScore, sampleSize]
     */
    @Query("""
            SELECT 
                COALESCE(AVG(bar.codeQuality), 0.0),
                COALESCE(AVG(bar.architecture), 0.0),
                COALESCE(AVG(bar.documentation), 0.0),
                COALESCE(AVG(bar.testing), 0.0),
                COALESCE(AVG(bar.bestPractices), 0.0),
                COALESCE(AVG(bar.overallScore), 0.0),
                COUNT(DISTINCT bar.benchmarkAccount.id)
            FROM BenchmarkAnalysisResult bar
            WHERE bar.benchmarkAccount.analysisStatus = 'COMPLETED'
            """)
    Object[] getBaselineAverages();

    /**
     * Fetch all overall scores for standard deviation calculation in Java.
     */
    @Query("""
            SELECT bar.overallScore
            FROM BenchmarkAnalysisResult bar
            WHERE bar.benchmarkAccount.analysisStatus = 'COMPLETED'
            """)
    List<Double> getCompletedOverallScores();
}
