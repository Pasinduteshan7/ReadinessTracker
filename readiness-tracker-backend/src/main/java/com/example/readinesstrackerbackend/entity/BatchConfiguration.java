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

/**
 * Batch Configuration Entity
 * 
 * Stores admin-configured batch settings:
 * - Target student count per batch
 * - Auto-start trigger when batch is full
 * - Analysis status tracking
 * 
 * When current_student_count == target_student_count,
 * full analysis automatically starts (if auto_start_enabled = true)
 */
@Entity
@Table(name = "batch_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer batchYear; // 1, 2, 3, 4

    @Column(nullable = false)
    private Integer targetStudentCount; // Admin sets: 200, 196, 190, 205, etc.

    @Column(nullable = false)
    private Integer currentStudentCount; // Auto-updated as students register (default 0)

    // Analysis Status
    @Column(nullable = false)
    private String status; // PENDING, READY, ANALYZING, COMPLETE

    // AUTO-START configuration
    @Column(nullable = false)
    private Boolean autoStartEnabled; // true = auto-trigger when full, false = manual

    // How many hours after reaching target to start (if auto-start enabled)
    private Integer delayBeforeStartHours; // 0 = immediate, 24 = wait 24 hours

    // Analysis progress tracking
    private LocalDateTime analysisStartedAt;
    private LocalDateTime analysisCompletedAt;
    private String analysisResult; // JSON summary of results

    // Metadata
    @Column(length = 500)
    private String description;

    private String configNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currentStudentCount == null) {
            currentStudentCount = 0;
        }
        if (autoStartEnabled == null) {
            autoStartEnabled = true;
        }
        if (delayBeforeStartHours == null) {
            delayBeforeStartHours = 0; // Immediate
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if batch is ready (full)
     */
    public boolean isBatchFull() {
        return currentStudentCount >= targetStudentCount;
    }

    /**
     * Check if batch should start analysis
     */
    public boolean shouldStartAnalysis() {
        return status.equals("READY") && 
               isBatchFull() && 
               autoStartEnabled;
    }

    /**
     * Get progress percentage
     */
    public Double getProgressPercentage() {
        if (targetStudentCount == 0) return 0.0;
        return (currentStudentCount / (double) targetStudentCount) * 100.0;
    }

    /**
     * Summary for logging
     */
    @Override
    public String toString() {
        return String.format(
            "BatchConfiguration{year=%d, status=%s, %d/%d students (%.1f%%), autoStart=%s}",
            batchYear, status, currentStudentCount, targetStudentCount,
            getProgressPercentage(), autoStartEnabled
        );
    }
}
