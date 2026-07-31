package com.example.readinesstrackerbackend.service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.example.readinesstrackerbackend.entity.FinalScore;
import com.example.readinesstrackerbackend.model.User;
import com.example.readinesstrackerbackend.repository.FinalScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class ScoreCalculationService {
    private final FinalScoreRepository finalScoreRepository;
    private static final double REPO_QUALITY_WEIGHT = 0.4;
    private static final double ALGORITHM_WEIGHT = 0.3;
    private static final double AI_PENALTY_WEIGHT = 0.3;
    public FinalScore calculateFinalScore(User user, Double repoQuality, 
                                         Double algorithmScore, Double aiPenalty) {
        log.info("Calculating final score for user: {}", user.getGithubUsername());

        Double finalScore = (repoQuality * REPO_QUALITY_WEIGHT) + 
                           (algorithmScore * ALGORITHM_WEIGHT) - 
                           (aiPenalty * AI_PENALTY_WEIGHT);
        finalScore = Math.max(0, Math.min(100, finalScore));
        FinalScore score = new FinalScore();
        score.setUser(user);
        score.setRepoQualityScore(repoQuality);
        score.setAlgorithmScore(algorithmScore);
        score.setAiPenalty(aiPenalty);
        score.setFinalScore(finalScore);
        score.setCalculatedAt(LocalDateTime.now());
        FinalScore saved = finalScoreRepository.save(score);
        updateLeaderboardRanks();
        return saved;
    }
    public void updateLeaderboardRanks() {
        log.info("Updating leaderboard ranks");
        List<FinalScore> scores = finalScoreRepository.findLeaderboard(PageRequest.of(0, Integer.MAX_VALUE));
        for (int i = 0; i < scores.size(); i++) {
            FinalScore score = scores.get(i);
            score.setRank(i + 1);
            score.setPercentile((double) (100 - ((i + 1) * 100 / scores.size())));
        }
        finalScoreRepository.saveAll(scores);
    }
    public Optional<FinalScore> getUserScore(Long userId) {
        return finalScoreRepository.findByUserId(userId);
    }
    public List<FinalScore> getLeaderboard(int limit, int offset) {
        return finalScoreRepository.findLeaderboard(PageRequest.of(offset / limit, limit));
    }
}
