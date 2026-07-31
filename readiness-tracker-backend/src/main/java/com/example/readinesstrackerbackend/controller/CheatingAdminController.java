package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.entity.SubmissionCheatingFlags;
import com.example.readinesstrackerbackend.service.AntiCheatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cheating")
@RequiredArgsConstructor
public class CheatingAdminController {
    
    private final AntiCheatService antiCheatService;
    
    @GetMapping("/pending-review")
    public ResponseEntity<?> getPendingReview() {
        try {
            List<SubmissionCheatingFlags> pendingReviews = antiCheatService.getPendingReview();
            
            List<Map<String, Object>> response = pendingReviews.stream()
                .map(flags -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", flags.getId());
                    item.put("userId", flags.getSubmission().getUserId());
                    item.put("challengeId", flags.getSubmission().getChallenge().getId());
                    item.put("username", flags.getSubmission().getUserId());
                    item.put("submittedAt", flags.getSubmission().getSubmittedAt());
                    item.put("pasteAttempts", flags.getPasteAttempts());
                    item.put("tabSwitches", flags.getTabSwitches());
                    item.put("suspiciousLevel", flags.getSubmission().getSuspiciousLevel());
                    return item;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/review/{submissionId}")
    public ResponseEntity<?> reviewSubmission(@PathVariable Long submissionId,
                                             @RequestBody Map<String, Object> payload) {
        try {
            String verdict = (String) payload.get("verdict");
            String notes = (String) payload.get("notes");
            
            SubmissionCheatingFlags flags = antiCheatService.getCheatingFlags(submissionId);
            flags.setReviewedAt(LocalDateTime.now());
            flags.setFinalVerdict(verdict);
            flags.setReviewerNotes(notes);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Review submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<?> getCheatingStats() {
        try {
            List<SubmissionCheatingFlags> allFlags = antiCheatService.getPendingReview();
            
            int totalFlagged = allFlags.size();
            int confirmedCheating = (int) allFlags.stream()
                .filter(f -> "confirmed_cheating".equals(f.getFinalVerdict()))
                .count();
            int suspended = (int) allFlags.stream()
                .filter(f -> "suspicious".equals(f.getFinalVerdict()))
                .count();
            int clean = (int) allFlags.stream()
                .filter(f -> "clean".equals(f.getFinalVerdict()))
                .count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total_flagged", totalFlagged);
            stats.put("confirmed_cheating", confirmedCheating);
            stats.put("suspicious", suspended);
            stats.put("clean", clean);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
