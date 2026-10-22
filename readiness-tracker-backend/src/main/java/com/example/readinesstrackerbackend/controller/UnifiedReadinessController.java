package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.CohortReadinessResponse;
import com.example.readinesstrackerbackend.dto.UnifiedReadinessDTO;
import com.example.readinesstrackerbackend.service.UnifiedReadinessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/overall-readiness")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
@RequiredArgsConstructor
@Slf4j
public class UnifiedReadinessController {

    private final UnifiedReadinessService unifiedReadinessService;

    /**
     * Get overall employability analysis and leaderboard for the entire cohort
     */
    @GetMapping("/cohort")
    public ResponseEntity<CohortReadinessResponse> getCohortReadiness() {
        return ResponseEntity.ok(unifiedReadinessService.getCohortReadiness(null));
    }

    /**
     * Get overall employability analysis for a specific student with cohort context
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<CohortReadinessResponse> getStudentCohortReadiness(@PathVariable Long studentId) {
        return ResponseEntity.ok(unifiedReadinessService.getCohortReadiness(studentId));
    }

    /**
     * Head-to-head comparison between two students across all 4 pillars
     */
    @GetMapping("/compare/{studentId1}/{studentId2}")
    public ResponseEntity<?> compareStudents(@PathVariable Long studentId1, @PathVariable Long studentId2) {
        CohortReadinessResponse cohort = unifiedReadinessService.getCohortReadiness(studentId1);
        UnifiedReadinessDTO s1 = cohort.getRankedStudents().stream()
                .filter(s -> s.getStudentId().equals(studentId1))
                .findFirst()
                .orElse(null);
        UnifiedReadinessDTO s2 = cohort.getRankedStudents().stream()
                .filter(s -> s.getStudentId().equals(studentId2))
                .findFirst()
                .orElse(null);

        if (s1 == null || s2 == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("student1", s1);
        comparison.put("student2", s2);
        comparison.put("scoreDifference", Math.round((s1.getOverallScore() - s2.getOverallScore()) * 10.0) / 10.0);
        comparison.put("cohortAverage", cohort.getAverageOverallScore());

        return ResponseEntity.ok(comparison);
    }
}
