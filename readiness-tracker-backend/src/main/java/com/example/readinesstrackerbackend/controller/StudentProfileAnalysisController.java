package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.ProfileAnalysisSaveRequest;
import com.example.readinesstrackerbackend.entity.StudentProfileAnalysis;
import com.example.readinesstrackerbackend.service.StudentProfileAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile-analysis")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
@RequiredArgsConstructor
@Slf4j
public class StudentProfileAnalysisController {

    private final StudentProfileAnalysisService service;

    /**
     * Save or update social media / resume profile analysis in Supabase
     */
    @PostMapping("/save")
    public ResponseEntity<StudentProfileAnalysis> saveAnalysis(@RequestBody ProfileAnalysisSaveRequest request) {
        try {
            StudentProfileAnalysis saved = service.saveOrUpdate(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid save profile analysis request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error saving profile analysis for student: {}", request.getStudentId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Fetch existing profile analysis for a student from Supabase
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentProfileAnalysis> getByStudentId(@PathVariable Long studentId) {
        return service.getByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Fetch all profile analyses for cohort statistics & advisor view
     */
    @GetMapping("/all")
    public ResponseEntity<List<StudentProfileAnalysis>> getAllAnalyses() {
        return ResponseEntity.ok(service.getAll());
    }
}
