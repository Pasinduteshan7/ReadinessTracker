package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.service.JobDemandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Job Demand Analysis
 * Serves data for the Industry Demand tab in StudentDashboard
 * 
 * Endpoints:
 * - GET /api/job-demand/top-demanded-jobs
 * - GET /api/job-demand/job-salaries
 * - GET /api/job-demand/top-languages
 * - GET /api/job-demand/top-skills
 * - GET /api/job-demand/summary
 */
@RestController
@RequestMapping("/api/job-demand")
@CrossOrigin(origins = "http://localhost:5174") // React frontend
public class JobDemandController {

    @Autowired
    private JobDemandService jobDemandService;

    /**
     * GET /api/job-demand/top-demanded-jobs
     * Returns top 5 most demanded job titles with salary and skills
     */
    @GetMapping("/top-demanded-jobs")
    public ResponseEntity<?> getTopDemandedJobs(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Map<String, Object>> topJobs = jobDemandService.getTopDemandedJobs(limit);

            Map<String, Object> response = new HashMap<>();
            response.put("total_jobs_analyzed", topJobs.stream()
                    .mapToInt(j -> (Integer) j.get("count"))
                    .sum());
            response.put("top_" + limit + "_demanded_jobs", topJobs);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/job-demand/job-salaries
     * Returns salary breakdown for top job titles
     */
    @GetMapping("/job-salaries")
    public ResponseEntity<?> getJobSalaryBreakdown(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Map<String, Object>> salaryData = jobDemandService.getJobSalaryBreakdown(limit);

            Map<String, Object> response = new HashMap<>();
            response.put("salary_breakdown", salaryData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/job-demand/top-languages
     * Returns top 10 programming languages filtered from top 5 demanded jobs
     * Query parameters:
     * - topJobs: Number of top jobs to analyze (default: 5)
     * - topLanguages: Number of top languages to return (default: 10)
     */
    @GetMapping("/top-languages")
    public ResponseEntity<?> getTopProgrammingLanguages(
            @RequestParam(defaultValue = "5") int topJobs,
            @RequestParam(defaultValue = "10") int topLanguages) {
        try {
            Map<String, Object> result = jobDemandService.getTopProgrammingLanguages(topJobs, topLanguages);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/job-demand/top-skills
     * Returns overall top skills across all analyzed jobs
     */
    @GetMapping("/top-skills")
    public ResponseEntity<?> getTopSkills(
            @RequestParam(defaultValue = "15") int limit) {
        try {
            List<Map<String, Object>> topSkills = jobDemandService.getTopSkills(limit);

            Map<String, Object> response = new HashMap<>();
            response.put("top_" + limit + "_skills", topSkills);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/job-demand/summary
     * Returns complete summary for dashboard card display
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getJobDemandSummary() {
        try {
            Map<String, Object> summary = jobDemandService.getJobDemandSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/job-demand/refresh
     * Manually trigger job collection (calls Python module)
     * Note: This endpoint would invoke the Python JobDemandModule
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshJobData() {
        try {
            // TODO: Implement Python module invocation
            // Process: Call job_demand_module.py to collect and save data
            // Then return updated summary

            Map<String, Object> response = new HashMap<>();
            response.put("status", "Collection triggered");
            response.put("message", "Python job scraper has been triggered. Check back in 60 seconds.");

            return ResponseEntity.accepted().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "Job Demand API is running",
                "timestamp", System.currentTimeMillis()));
    }
}
