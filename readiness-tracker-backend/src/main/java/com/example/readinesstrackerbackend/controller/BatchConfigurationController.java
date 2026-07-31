package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.entity.BatchConfiguration;
import com.example.readinesstrackerbackend.repository.BatchConfigurationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Batch Configuration Controller
 * 
 * Endpoints for admins to:
 * 1. Create/configure batch (set target size)
 * 2. View batch progress
 * 3. Start/stop analysis
 * 4. Monitor analysis status
 */
@RestController
@RequestMapping("/api/admin/batch-config")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class BatchConfigurationController {
    
    @Autowired
    private BatchConfigurationRepository batchConfigRepository;
    
    /**
     * GET /api/admin/batch-config/all
     * View all batch configurations
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllBatchConfigurations() {
        try {
            List<BatchConfiguration> batches = 
                batchConfigRepository.findAllByOrderByBatchYearAsc();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalBatches", batches.size());
            response.put("batches", batches.stream().map(this::formatBatchResponse).toList());
            
            log.info("Retrieved all {} batch configurations", batches.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving batch configurations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * POST /api/admin/batch-config/create
     * Create or update batch configuration
     * 
     * Example:
     * {
     *   "batchYear": 1,
     *   "targetStudentCount": 200,
     *   "autoStartEnabled": true,
     *   "delayBeforeStartHours": 0
     * }
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBatchConfiguration(
            @RequestParam Integer batchYear,
            @RequestParam Integer targetStudentCount,
            @RequestParam(defaultValue = "true") Boolean autoStartEnabled,
            @RequestParam(defaultValue = "0") Integer delayBeforeStartHours,
            @RequestParam(required = false) String description) {
        try {
            // Check if already exists
            var existing = batchConfigRepository.findByBatchYear(batchYear);
            
            BatchConfiguration batch;
            if (existing.isPresent()) {
                batch = existing.get();
                log.info("Updating existing Batch {} configuration", batchYear);
            } else {
                batch = new BatchConfiguration();
                batch.setBatchYear(batchYear);
                batch.setCurrentStudentCount(0); // Start at 0
                batch.setStatus("PENDING");
                log.info("Creating new Batch {} configuration", batchYear);
            }
            
            batch.setTargetStudentCount(targetStudentCount);
            batch.setAutoStartEnabled(autoStartEnabled);
            batch.setDelayBeforeStartHours(delayBeforeStartHours);
            batch.setDescription(description);
            
            BatchConfiguration saved = batchConfigRepository.save(batch);
            
            log.info("✓ Batch {} configured: target={} students, autoStart={}, delay={}h",
                batchYear, targetStudentCount, autoStartEnabled, delayBeforeStartHours);
            
            return ResponseEntity.ok(formatBatchResponse(saved));
            
        } catch (Exception e) {
            log.error("Error creating batch configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/batch-config/{year}
     * View specific batch configuration and progress
     */
    @GetMapping("/{year}")
    public ResponseEntity<Map<String, Object>> getBatchConfiguration(
            @PathVariable Integer year) {
        try {
            BatchConfiguration batch = batchConfigRepository.findByBatchYear(year)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Batch configuration not found for year " + year));
            
            return ResponseEntity.ok(formatBatchResponse(batch));
            
        } catch (Exception e) {
            log.error("Error retrieving batch configuration", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/admin/batch-config/{year}/update
     * Update batch configuration
     */
    @PutMapping("/{year}/update")
    public ResponseEntity<Map<String, Object>> updateBatchConfiguration(
            @PathVariable Integer year,
            @RequestParam(required = false) Integer targetStudentCount,
            @RequestParam(required = false) Boolean autoStartEnabled,
            @RequestParam(required = false) Integer delayBeforeStartHours) {
        try {
            BatchConfiguration batch = batchConfigRepository.findByBatchYear(year)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Batch configuration not found for year " + year));
            
            if (targetStudentCount != null) {
                batch.setTargetStudentCount(targetStudentCount);
            }
            if (autoStartEnabled != null) {
                batch.setAutoStartEnabled(autoStartEnabled);
            }
            if (delayBeforeStartHours != null) {
                batch.setDelayBeforeStartHours(delayBeforeStartHours);
            }
            
            BatchConfiguration saved = batchConfigRepository.save(batch);
            
            log.info("Updated Batch {} configuration", year);
            return ResponseEntity.ok(formatBatchResponse(saved));
            
        } catch (Exception e) {
            log.error("Error updating batch configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Format batch configuration for API response
     */
    private Map<String, Object> formatBatchResponse(BatchConfiguration batch) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", batch.getId());
        response.put("batchYear", batch.getBatchYear());
        response.put("targetStudents", batch.getTargetStudentCount());
        response.put("registeredStudents", batch.getCurrentStudentCount());
        response.put("progressPercentage", String.format("%.1f", batch.getProgressPercentage()) + "%");
        response.put("isFull", batch.isBatchFull());
        
        // Status progress
        response.put("status", batch.getStatus());
        response.put("autoStartEnabled", batch.getAutoStartEnabled());
        response.put("delayBeforeStartHours", batch.getDelayBeforeStartHours());
        
        // Analysis tracking
        response.put("analysisStartedAt", batch.getAnalysisStartedAt());
        response.put("analysisCompletedAt", batch.getAnalysisCompletedAt());
        
        // Meta
        response.put("createdAt", batch.getCreatedAt());
        response.put("updatedAt", batch.getUpdatedAt());
        
        return response;
    }
}
