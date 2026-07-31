package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.BatchConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchConfigurationRepository extends JpaRepository<BatchConfiguration, Long> {
    
    /**
     * Find configuration by batch year
     */
    Optional<BatchConfiguration> findByBatchYear(Integer batchYear);
    
    /**
     * Find all batch configurations
     */
    List<BatchConfiguration> findAllByOrderByBatchYearAsc();
    
    /**
     * Find batches that are READY and full (should start analysis)
     */
    @Query("""
        SELECT bc FROM BatchConfiguration bc 
        WHERE bc.status = 'READY' 
        AND bc.currentStudentCount >= bc.targetStudentCount
        AND bc.autoStartEnabled = true
        """)
    List<BatchConfiguration> findReadyBatchesFull();
    
    /**
     * Find batches currently ANALYZING
     */
    @Query("SELECT bc FROM BatchConfiguration bc WHERE bc.status = 'ANALYZING'")
    List<BatchConfiguration> findAnalyzingBatches();
    
    /**
     * Find completed batches
     */
    @Query("SELECT bc FROM BatchConfiguration bc WHERE bc.status = 'COMPLETE'")
    List<BatchConfiguration> findCompletedBatches();
    
    /**
     * Find pending batches (not started)
     */
    @Query("SELECT bc FROM BatchConfiguration bc WHERE bc.status = 'PENDING'")
    List<BatchConfiguration> findPendingBatches();
}
