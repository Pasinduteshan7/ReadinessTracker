package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.ChallengeSubmission;
import com.example.readinesstrackerbackend.entity.AlgorithmChallenge;
import com.example.readinesstrackerbackend.repository.ChallengeSubmissionRepository;
import com.example.readinesstrackerbackend.repository.AlgorithmChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    
    private final ChallengeSubmissionRepository submissionRepository;
    private final AlgorithmChallengeRepository challengeRepository;
    
    public ChallengeSubmission createSubmission(Long userId, Long challengeId, String code, 
                                                String language, Integer timeTakenSeconds) {
        AlgorithmChallenge challenge = challengeRepository.findById(challengeId)
            .orElseThrow(() -> new RuntimeException("Challenge not found: " + challengeId));
        
        ChallengeSubmission submission = new ChallengeSubmission();
        submission.setUserId(userId);
        submission.setChallenge(challenge);
        submission.setCode(code);
        submission.setLanguage(language);
        submission.setTimeTakenSeconds(timeTakenSeconds);
        
        return submissionRepository.save(submission);
    }
    
    public void updateTestResults(Long submissionId, Integer passed, Integer total, Long executionTimeMs) {
        ChallengeSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        submission.setTestCasesPassed(passed);
        submission.setTestCasesTotal(total);
        submission.setExecutionTimeMs(executionTimeMs);
        
        if (total > 0) {
            BigDecimal passRate = BigDecimal.valueOf((double) passed / total * 100);
            submission.setPassRate(passRate);
        }
        
        submissionRepository.save(submission);
    }
    
    public void updateLLMScores(Long submissionId, BigDecimal correctness, 
                               BigDecimal efficiency, BigDecimal quality, String feedback) {
        ChallengeSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        submission.setLlmCorrectnessScore(correctness);
        submission.setLlmEfficiencyScore(efficiency);
        submission.setLlmQualityScore(quality);
        submission.setLlmFeedback(feedback);
        
        submissionRepository.save(submission);
    }
    
    public void calculateFinalScore(Long submissionId) {
        ChallengeSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        BigDecimal testScore = submission.getPassRate() != null ? 
            submission.getPassRate().multiply(BigDecimal.valueOf(0.6)) : BigDecimal.ZERO;
        
        BigDecimal qualityScore = submission.getLlmQualityScore() != null ?
            submission.getLlmQualityScore().multiply(BigDecimal.valueOf(0.2)) : BigDecimal.ZERO;
        
        BigDecimal efficiencyScore = submission.getLlmEfficiencyScore() != null ?
            submission.getLlmEfficiencyScore().multiply(BigDecimal.valueOf(0.2)) : BigDecimal.ZERO;
        
        BigDecimal rawScore = testScore.add(qualityScore).add(efficiencyScore);
        
        BigDecimal maxScore = BigDecimal.valueOf(submission.getChallenge().getMaxScore());
        BigDecimal finalScore = rawScore.min(maxScore);
        
        submission.setFinalScore(finalScore);
        submission.setScoreBreakdown("{\"test_cases\":\"" + testScore + "\",\"quality\":\"" + qualityScore + "\",\"efficiency\":\"" + efficiencyScore + "\"}");
        
        submissionRepository.save(submission);
    }
    
    public ChallengeSubmission getSubmission(Long submissionId) {
        return submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
    }
    
    public Optional<ChallengeSubmission> getUserSubmission(Long userId, Long challengeId) {
        return submissionRepository.findByUserIdAndChallenge_Id(userId, challengeId);
    }
    
    public Optional<ChallengeSubmission> getUserLatestSubmission(Long userId) {
        return submissionRepository.findByUserId(userId);
    }
    
    public List<ChallengeSubmission> getFlaggedSubmissions() {
        return submissionRepository.findByIsFlagged(true);
    }
    
    public void flagSubmission(Long submissionId, String suspiciousLevel, String cheatFlags) {
        ChallengeSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        submission.setIsFlagged(true);
        submission.setSuspiciousLevel(suspiciousLevel);
        submission.setCheatFlags(cheatFlags);
        
        submissionRepository.save(submission);
    }
}
