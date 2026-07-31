package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.BatchConfiguration;
import com.example.readinesstrackerbackend.model.User;
import com.example.readinesstrackerbackend.repository.BatchConfigurationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Batch Registration Service
 * 
 * Handles:
 * 1. Incrementing student count when a new student registers
 * 2. Checking if batch is now full
 * 3. Preparing batch for auto-analysis trigger
 */
@Service
@Slf4j
public class BatchRegistrationService {
    
    @Autowired
    private BatchConfigurationRepository batchConfigRepository;
    
    /**
     * Called when a new student registers in the system
     * 
     * This increments the batch count and updates status if needed
     * When batch reaches target size, marks it as READY for analysis
     */
    @Transactional
    public void recordStudentRegistration(User student) {
        try {
            Integer batchYear = student.getBatchYear();
            
            if (batchYear == null) {
                log.warn("Student {} has no batch year assigned", student.getId());
                return;
            }
            
            // Find or create batch configuration
            BatchConfiguration batch = batchConfigRepository
                .findByBatchYear(batchYear)
                .orElse(null);
            
            if (batch == null) {
                log.warn("No batch configuration found for year {}. " +
                    "Admin must configure batch first!", batchYear);
                return;
            }
            
            // Increment student count
            int previousCount = batch.getCurrentStudentCount();
            int newCount = previousCount + 1;
            
            batch.setCurrentStudentCount(newCount);
            
            // If batch is now full, mark as READY
            if (batch.isBatchFull() && !batch.getStatus().equals("READY")) {
                batch.setStatus("READY");
                log.info("✓ BATCH {} IS FULL! {} students registered", 
                    batchYear, newCount);
                log.info("  Status changed to READY for auto-analysis trigger");
            } else if (newCount % 10 == 0 || newCount % 50 == 0) {
                // Log every 10th or 50th student
                log.info("Batch {} progress: {}/{} students ({}%)",
                    batchYear, newCount, batch.getTargetStudentCount(),
                    String.format("%.1f", batch.getProgressPercentage()));
            }
            
            batchConfigRepository.save(batch);
            
        } catch (Exception e) {
            log.error("Error recording student registration for batch analysis", e);
            // Don't throw - registration should succeed even if batch tracking fails
        }
    }
    
    /**
     * Get current batch progress for a student's batch
     */
    public BatchProgress getBatchProgress(Integer batchYear) {
        try {
            BatchConfiguration batch = batchConfigRepository
                .findByBatchYear(batchYear)
                .orElse(null);
            
            if (batch == null) {
                return new BatchProgress(batchYear, 0, null, "NOT_CONFIGURED");
            }
            
            return new BatchProgress(
                batchYear,
                batch.getCurrentStudentCount(),
                batch.getTargetStudentCount(),
                batch.getStatus()
            );
            
        } catch (Exception e) {
            log.error("Error getting batch progress", e);
            return null;
        }
    }
    
    /**
     * DTO for batch progress information
     */
    public static class BatchProgress {
        public Integer batchYear;
        public Integer currentCount;
        public Integer targetCount;
        public String status;
        public Double progressPercentage;
        public Boolean isFull;
        
        public BatchProgress(Integer batchYear, Integer currentCount, 
                           Integer targetCount, String status) {
            this.batchYear = batchYear;
            this.currentCount = currentCount;
            this.targetCount = targetCount;
            this.status = status;
            
            if (targetCount != null && targetCount > 0) {
                this.progressPercentage = (currentCount / (double) targetCount) * 100.0;
                this.isFull = currentCount >= targetCount;
            } else {
                this.progressPercentage = 0.0;
                this.isFull = false;
            }
        }
    }
}
