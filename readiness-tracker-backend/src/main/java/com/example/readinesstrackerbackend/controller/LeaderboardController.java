package com.example.readinesstrackerbackend.controller;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.readinesstrackerbackend.entity.FinalScore;
import com.example.readinesstrackerbackend.service.ScoreCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@Slf4j
public class LeaderboardController {
    private final ScoreCalculationService scoreCalculationService;
    @GetMapping("/top")
    public ResponseEntity<?> getTopScores(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        try {
            log.info("Fetching leaderboard: limit={}, offset={}", limit, offset);
            List<LeaderboardEntryDTO> entries = scoreCalculationService
                    .getLeaderboard(limit, offset)
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new LeaderboardResponse(
                    entries,
                    limit,
                    offset,
                    entries.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching leaderboard", e);
            return ResponseEntity.status(500).build();
        }
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserScore(@PathVariable Long userId) {
        try {
            log.info("Fetching score for user: {}", userId);
            FinalScore score = scoreCalculationService.getUserScore(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Score not found"));
            return ResponseEntity.ok(new UserScoreResponse(
                    userId,
                    score.getFinalScore(),
                    score.getRank(),
                    score.getPercentile(),
                    score.getScoreBreakdown()
            ));
        } catch (Exception e) {
            log.error("Error fetching user score", e);
            return ResponseEntity.notFound().build();
        }
    }
    private LeaderboardEntryDTO mapToDTO(FinalScore score) {
        return new LeaderboardEntryDTO(
                score.getUser() != null ? score.getUser().getId() : null,
                score.getUser() != null ? score.getUser().getGithubUsername() : "Unknown",
                score.getUser() != null ? score.getUser().getAvatarUrl() : null,
                score.getFinalScore(),
                score.getRank(),
                score.getPercentile()
        );
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class LeaderboardResponse {
        private List<LeaderboardEntryDTO> entries;
        private int limit;
        private int offset;
        private int count;
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class LeaderboardEntryDTO {
        private Long userId;
        private String username;
        private String avatarUrl;
        private Double finalScore;
        private Integer rank;
        private Double percentile;
    }
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class UserScoreResponse {
        private Long userId;
        private Double finalScore;
        private Integer rank;
        private Double percentile;
        private String scoreBreakdown;
    }
}
