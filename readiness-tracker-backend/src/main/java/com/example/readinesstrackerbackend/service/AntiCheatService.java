package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.ChallengeSubmission;
import com.example.readinesstrackerbackend.entity.SubmissionCheatingFlags;
import com.example.readinesstrackerbackend.repository.SubmissionCheatingFlagsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AntiCheatService {
    
    private final SubmissionCheatingFlagsRepository flagsRepository;
    
    public SubmissionCheatingFlags initializeCheatingFlags(ChallengeSubmission submission) {
        SubmissionCheatingFlags flags = new SubmissionCheatingFlags();
        flags.setSubmission(submission);
        return flagsRepository.save(flags);
    }
    
    public void recordPasteAttempt(Long submissionId) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setPasteAttempts(flags.getPasteAttempts() + 1);
        flags.setPasteBlockedCount(flags.getPasteBlockedCount() + 1);
        flagsRepository.save(flags);
    }
    
    public void recordTabSwitch(Long submissionId, Long timestamp) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setTabSwitches(flags.getTabSwitches() + 1);
        flagsRepository.save(flags);
    }
    
    public void recordKeystrokeData(Long submissionId, Integer keystrokeCount, Integer avgInterval) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setKeystrokeCount(keystrokeCount);
        flags.setAverageKeystrokeIntervalMs(avgInterval);
        
        List<String> typingFlags = new ArrayList<>();
        if (avgInterval != null && avgInterval < 30) {
            typingFlags.add("abnormally_fast_typing");
        }
        flags.setTypingPatternFlags("");
        
        flagsRepository.save(flags);
    }
    
    public void recordLargeInsertion(Long submissionId, Integer length, String textPreview) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setLargeInsertions(flags.getLargeInsertions() + 1);
        flagsRepository.save(flags);
    }
    
    public void analyzeSimilarity(Long submissionId, BigDecimal similarity) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setSimilarityToKnownSolutions(similarity);
        flagsRepository.save(flags);
    }
    
    public void compareCodeStyle(Long submissionId, BigDecimal naming, BigDecimal styleVariance, BigDecimal commentVariance) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setNamingConventionMatch(naming);
        flags.setCodeStyleVariance(styleVariance);
        flags.setCommentDensityVariance(commentVariance);
        flagsRepository.save(flags);
    }
    
    public String generateSuspiciousLevel(SubmissionCheatingFlags flags) {
        int suspiciousScore = 0;
        
        if (flags.getPasteAttempts() > 3) suspiciousScore += 20;
        if (flags.getTabSwitches() > 5) suspiciousScore += 20;
        if (flags.getAverageKeystrokeIntervalMs() != null && flags.getAverageKeystrokeIntervalMs() < 30) {
            suspiciousScore += 15;
        }
        if (flags.getLeetcodePatternsFound() > 0) suspiciousScore += 30;
        if (flags.getSimilarityToKnownSolutions() != null && 
            flags.getSimilarityToKnownSolutions().compareTo(BigDecimal.valueOf(0.85)) > 0) {
            suspiciousScore += 35;
        }
        
        if (suspiciousScore >= 50) return "critical";
        if (suspiciousScore >= 35) return "high";
        if (suspiciousScore >= 20) return "medium";
        return "low";
    }
    
    public void flagForManualReview(Long submissionId, String reason) {
        SubmissionCheatingFlags flags = getFlagsBySubmission(submissionId);
        flags.setManualReviewRequired(true);
        flags.setReviewReason(reason);
        flagsRepository.save(flags);
    }
    
    private SubmissionCheatingFlags getFlagsBySubmission(Long submissionId) {
        return flagsRepository.findBySubmissionId(submissionId)
            .orElseThrow(() -> new RuntimeException("Cheating flags not found for submission: " + submissionId));
    }
    
    public SubmissionCheatingFlags getCheatingFlags(Long submissionId) {
        return getFlagsBySubmission(submissionId);
    }
    
    public List<SubmissionCheatingFlags> getPendingReview() {
        return flagsRepository.findByManualReviewRequired(true);
    }
}
