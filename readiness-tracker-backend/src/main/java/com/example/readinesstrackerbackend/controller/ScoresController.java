package com.example.readinesstrackerbackend.controller;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.readinesstrackerbackend.entity.FinalScore;
import com.example.readinesstrackerbackend.model.User;
import com.example.readinesstrackerbackend.repository.FinalScoreRepository;
import com.example.readinesstrackerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
@Slf4j
public class ScoresController {
    private final FinalScoreRepository finalScoreRepository;
    private final UserRepository userRepository;
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserScores(@PathVariable Long userId) {
        try {
            log.info("Fetching scores for user: {}", userId);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found"));
            }
            Optional<FinalScore> scoreOpt = finalScoreRepository.findByUser(userOpt.get());
            if (scoreOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("No scores available for this user yet"));
            }
            FinalScore score = scoreOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("username", score.getUser().getUsername());
            response.put("rank", score.getRank());
            response.put("percentile", score.getPercentile());

            Map<String, Object> scores = new HashMap<>();
            scores.put("final_score", score.getFinalScore());
            scores.put("codellama_7b_quality", score.getRepoQuality7b());
            scores.put("qwen_3b_quality", score.getRepoQuality3b());
            scores.put("documentation", score.getDocumentation());
            scores.put("security", score.getSecurity());
            scores.put("maintainability", score.getMaintainability());
            response.put("scores", scores);
            response.put("calculated_at", score.getCalculatedAt());

            if (score.getDualModelBreakdown() != null) {
                response.put("detailed_breakdown", score.getDualModelBreakdown());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching scores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        try {
            log.info("Fetching leaderboard");
            List<FinalScore> topScores = finalScoreRepository.findAll();

            topScores.sort((a, b) -> {
                if (a.getFinalScore() == null || b.getFinalScore() == null) return 0;
                return b.getFinalScore().compareTo(a.getFinalScore());
            });

            List<FinalScore> top100 = topScores.stream()
                .limit(100)
                .toList();
            List<Map<String, Object>> leaderboard = top100.stream()
                .map(score -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("rank", score.getRank());
                    entry.put("username", score.getUser().getUsername());
                    entry.put("final_score", score.getFinalScore());
                    entry.put("percentage", String.format("%.1f%%", (score.getFinalScore() != null ? score.getFinalScore() * 100 : 0)));
                    entry.put("codellama_quality", score.getRepoQuality7b());
                    entry.put("qwen_quality", score.getRepoQuality3b());
                    entry.put("percentile", score.getPercentile());
                    return entry;
                })
                .toList();
            Map<String, Object> response = new HashMap<>();
            response.put("total_users", finalScoreRepository.count());
            response.put("leaderboard_size", leaderboard.size());
            response.put("leaderboard", leaderboard);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching leaderboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    @GetMapping("/compare/{userId1}/{userId2}")
    public ResponseEntity<?> compareScores(@PathVariable Long userId1, @PathVariable Long userId2) {
        try {
            log.info("Comparing scores between users: {} and {}", userId1, userId2);
            Optional<User> user1Opt = userRepository.findById(userId1);
            Optional<User> user2Opt = userRepository.findById(userId2);
            if (user1Opt.isEmpty() || user2Opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("One or both users not found"));
            }
            Optional<FinalScore> score1Opt = finalScoreRepository.findByUser(user1Opt.get());
            Optional<FinalScore> score2Opt = finalScoreRepository.findByUser(user2Opt.get());
            if (score1Opt.isEmpty() || score2Opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Scores not available for one or both users"));
            }
            FinalScore score1 = score1Opt.get();
            FinalScore score2 = score2Opt.get();
            Map<String, Object> user1Data = new HashMap<>();
            user1Data.put("username", score1.getUser().getUsername());
            user1Data.put("final_score", score1.getFinalScore());
            user1Data.put("codellama_7b", score1.getRepoQuality7b());
            user1Data.put("qwen_3b", score1.getRepoQuality3b());
            user1Data.put("documentation", score1.getDocumentation());
            user1Data.put("security", score1.getSecurity());
            user1Data.put("rank", score1.getRank());
            Map<String, Object> user2Data = new HashMap<>();
            user2Data.put("username", score2.getUser().getUsername());
            user2Data.put("final_score", score2.getFinalScore());
            user2Data.put("codellama_7b", score2.getRepoQuality7b());
            user2Data.put("qwen_3b", score2.getRepoQuality3b());
            user2Data.put("documentation", score2.getDocumentation());
            user2Data.put("security", score2.getSecurity());
            user2Data.put("rank", score2.getRank());
            Map<String, Object> response = new HashMap<>();
            response.put("user1", user1Data);
            response.put("user2", user2Data);
            response.put("difference", score1.getFinalScore() - score2.getFinalScore());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error comparing scores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    public static class ErrorResponse {
        public String error;
        public ErrorResponse(String error) {
            this.error = error;
        }
        public String getError() {
            return error;
        }
    }
}
