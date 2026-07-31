package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.entity.AlgorithmChallenge;
import com.example.readinesstrackerbackend.entity.ChallengeSubmission;
import com.example.readinesstrackerbackend.service.ChallengeService;
import com.example.readinesstrackerbackend.service.SubmissionService;
import com.example.readinesstrackerbackend.service.AntiCheatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/challenge")
@RequiredArgsConstructor
public class ChallengeController {
    
    private final ChallengeService challengeService;
    private final SubmissionService submissionService;
    private final AntiCheatService antiCheatService;
    
    @PostMapping("/assign")
    public ResponseEntity<?> assignChallenge(@RequestParam Long userId, @RequestParam String difficulty) {
        try {
            AlgorithmChallenge challenge = challengeService.assignRandomProblem(userId, difficulty);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("challenge_id", challenge.getId());
            response.put("title", challenge.getTitle());
            response.put("difficulty", challenge.getDifficulty());
            response.put("problem_code", challenge.getProblemCode());
            response.put("description", challenge.getDescription());
            response.put("example_input", challenge.getExampleInput());
            response.put("example_output", challenge.getExampleOutput());
            response.put("constraints", challenge.getConstraints());
            response.put("max_score", challenge.getMaxScore());
            response.put("time_limit_minutes", challenge.getTimeLimitMinutes());
            response.put("topics", challenge.getTopics());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{challengeId}")
    public ResponseEntity<?> getChallenge(@PathVariable Long challengeId) {
        try {
            AlgorithmChallenge challenge = challengeService.getChallengeById(challengeId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", challenge.getId());
            response.put("title", challenge.getTitle());
            response.put("difficulty", challenge.getDifficulty());
            response.put("problem_code", challenge.getProblemCode());
            response.put("description", challenge.getDescription());
            response.put("example_input", challenge.getExampleInput());
            response.put("example_output", challenge.getExampleOutput());
            response.put("constraints", challenge.getConstraints());
            response.put("max_score", challenge.getMaxScore());
            response.put("time_limit_minutes", challenge.getTimeLimitMinutes());
            response.put("test_cases", challenge.getTestCases());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitSolution(@RequestParam Long userId, 
                                           @RequestParam Long challengeId,
                                           @RequestBody Map<String, Object> payload) {
        try {
            String code = (String) payload.get("code");
            String language = (String) payload.getOrDefault("language", "python");
            Integer timeTakenSeconds = ((Number) payload.getOrDefault("time_taken_seconds", 0)).intValue();
            
            ChallengeSubmission submission = submissionService.createSubmission(
                userId, challengeId, code, language, timeTakenSeconds
            );
            
            antiCheatService.initializeCheatingFlags(submission);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("submission_id", submission.getId());
            response.put("message", "Code submitted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/monitor/paste")
    public ResponseEntity<?> recordPasteAttempt(@RequestParam Long submissionId) {
        try {
            antiCheatService.recordPasteAttempt(submissionId);
            return ResponseEntity.ok(Map.of("recorded", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/monitor/tab-switch")
    public ResponseEntity<?> recordTabSwitch(@RequestParam Long submissionId, @RequestParam Long timestamp) {
        try {
            antiCheatService.recordTabSwitch(submissionId, timestamp);
            return ResponseEntity.ok(Map.of("recorded", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/monitor/keystroke")
    public ResponseEntity<?> recordKeystroke(@RequestParam Long submissionId, 
                                            @RequestParam Integer keystrokeCount,
                                            @RequestParam Integer avgInterval) {
        try {
            antiCheatService.recordKeystrokeData(submissionId, keystrokeCount, avgInterval);
            return ResponseEntity.ok(Map.of("recorded", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId) {
        try {
            ChallengeSubmission submission = submissionService.getSubmission(submissionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", submission.getId());
            response.put("code", submission.getCode());
            response.put("language", submission.getLanguage());
            response.put("final_score", submission.getFinalScore());
            response.put("is_flagged", submission.getIsFlagged());
            response.put("submitted_at", submission.getSubmittedAt());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
