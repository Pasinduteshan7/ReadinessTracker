package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.entity.BatchConfiguration;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.BatchConfigurationRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
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
import org.springframework.transaction.annotation.Transactional;
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

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Synchronize actual student registration counts from database
     */
    private int syncBatchStudentCount(BatchConfiguration batch) {
        if (batch == null || batch.getBatchYear() == null) return 0;
        List<Student> allStudents = studentRepository.findAll();
        int count = 0;
        for (Student s : allStudents) {
            boolean matches = false;
            if (s.getBatchYear() != null && s.getBatchYear().equals(batch.getBatchYear())) {
                matches = true;
            } else if (s.getCurrentYear() != null && s.getCurrentYear().contains(String.valueOf(batch.getBatchYear()))) {
                matches = true;
                if (s.getBatchYear() == null) {
                    s.setBatchYear(batch.getBatchYear());
                    try {
                        studentRepository.save(s);
                    } catch (Exception ignored) {}
                }
            }
            if (matches) count++;
        }
        if (batch.getCurrentStudentCount() == null || batch.getCurrentStudentCount() != count) {
            batch.setCurrentStudentCount(count);
            batchConfigRepository.save(batch);
        }
        return count;
    }
    
    /**
     * GET /api/admin/batch-config/all
     * View all batch configurations
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllBatchConfigurations() {
        try {
            List<BatchConfiguration> batches = 
                batchConfigRepository.findAllByOrderByBatchYearAsc();

            batches.forEach(this::syncBatchStudentCount);
            
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
     * GET /api/admin/batch-config/promote-preview
     * Preview student counts before academic year promotion
     */
    @GetMapping("/promote-preview")
    public ResponseEntity<Map<String, Object>> getPromotePreview() {
        try {
            List<Student> allStudents = studentRepository.findAll();
            int year4Count = 0;
            int year3Count = 0;
            int year2Count = 0;
            int year1Count = 0;

            for (Student s : allStudents) {
                Integer by = s.getBatchYear();
                String cy = s.getCurrentYear() != null ? s.getCurrentYear() : "";
                if ((by != null && by == 4) || cy.contains("4")) {
                    year4Count++;
                } else if ((by != null && by == 3) || cy.contains("3")) {
                    year3Count++;
                } else if ((by != null && by == 2) || cy.contains("2")) {
                    year2Count++;
                } else if ((by != null && by == 1) || cy.contains("1")) {
                    year1Count++;
                }
            }

            Map<String, Object> preview = new HashMap<>();
            preview.put("graduatingCount", year4Count);
            preview.put("promotingToFourthYear", year3Count);
            preview.put("promotingToThirdYear", year2Count);
            preview.put("promotingToSecondYear", year1Count);
            preview.put("totalActiveUndergrads", year4Count + year3Count + year2Count + year1Count);

            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            log.error("Error generating promote preview", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/admin/batch-config/promote-academic-year
     * Promotes all active student batches by +1 year and opens new Year 1 batch
     */
    @PostMapping("/promote-academic-year")
    @Transactional
    public ResponseEntity<Map<String, Object>> promoteAcademicYear(
            @RequestParam(defaultValue = "200") Integer newFirstYearTarget) {
        try {
            List<Student> allStudents = studentRepository.findAll();
            int graduated = 0;
            int promotedTo4 = 0;
            int promotedTo3 = 0;
            int promotedTo2 = 0;

            // 1. Promote students in reverse order (4 -> Graduated, 3 -> 4, 2 -> 3, 1 -> 2)
            for (Student s : allStudents) {
                Integer by = s.getBatchYear();
                String cy = s.getCurrentYear() != null ? s.getCurrentYear() : "";

                if ((by != null && by == 4) || cy.contains("4")) {
                    s.setCurrentYear("Graduated");
                    s.setBatchYear(5);
                    graduated++;
                } else if ((by != null && by == 3) || cy.contains("3")) {
                    s.setCurrentYear("4th Year");
                    s.setBatchYear(4);
                    promotedTo4++;
                } else if ((by != null && by == 2) || cy.contains("2")) {
                    s.setCurrentYear("3rd Year");
                    s.setBatchYear(3);
                    promotedTo3++;
                } else if ((by != null && by == 1) || cy.contains("1")) {
                    s.setCurrentYear("2nd Year");
                    s.setBatchYear(2);
                    promotedTo2++;
                }
            }
            studentRepository.saveAll(allStudents);

            // 2. Roll over batch_configurations for Years 1..4
            Map<Integer, BatchConfiguration> configMap = new HashMap<>();
            for (int y = 1; y <= 4; y++) {
                BatchConfiguration bc = batchConfigRepository.findByBatchYear(y).orElse(null);
                if (bc == null) {
                    bc = new BatchConfiguration();
                    bc.setBatchYear(y);
                    bc.setTargetStudentCount(200);
                    bc.setCurrentStudentCount(0);
                    bc.setStatus("PENDING");
                    bc.setAutoStartEnabled(true);
                    bc.setDelayBeforeStartHours(0);
                    bc = batchConfigRepository.save(bc);
                }
                configMap.put(y, bc);
            }

            Integer oldYear3Target = configMap.get(3).getTargetStudentCount();
            Integer oldYear2Target = configMap.get(2).getTargetStudentCount();
            Integer oldYear1Target = configMap.get(1).getTargetStudentCount();

            BatchConfiguration batch4 = configMap.get(4);
            batch4.setTargetStudentCount(oldYear3Target != null ? oldYear3Target : 200);
            batch4.setCurrentStudentCount(promotedTo4);
            batch4.setStatus("PENDING");
            batchConfigRepository.save(batch4);

            BatchConfiguration batch3 = configMap.get(3);
            batch3.setTargetStudentCount(oldYear2Target != null ? oldYear2Target : 200);
            batch3.setCurrentStudentCount(promotedTo3);
            batch3.setStatus("PENDING");
            batchConfigRepository.save(batch3);

            BatchConfiguration batch2 = configMap.get(2);
            batch2.setTargetStudentCount(oldYear1Target != null ? oldYear1Target : 200);
            batch2.setCurrentStudentCount(promotedTo2);
            batch2.setStatus("PENDING");
            batchConfigRepository.save(batch2);

            BatchConfiguration batch1 = configMap.get(1);
            batch1.setTargetStudentCount(newFirstYearTarget != null && newFirstYearTarget > 0 ? newFirstYearTarget : 200);
            batch1.setCurrentStudentCount(0);
            batch1.setStatus("PENDING");
            batchConfigRepository.save(batch1);

            log.info("✓ Academic year successfully promoted: Graduated={}, Year 4={}, Year 3={}, Year 2={}, New Year 1 target={}",
                    graduated, promotedTo4, promotedTo3, promotedTo2, newFirstYearTarget);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Academic year promoted successfully");
            result.put("graduatedCount", graduated);
            result.put("promotedToFourthYear", promotedTo4);
            result.put("promotedToThirdYear", promotedTo3);
            result.put("promotedToSecondYear", promotedTo2);
            result.put("newFirstYearTarget", batch1.getTargetStudentCount());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error promoting academic year", e);
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
