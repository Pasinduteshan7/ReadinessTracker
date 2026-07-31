package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.AlgorithmChallenge;
import com.example.readinesstrackerbackend.entity.ProblemAssignment;
import com.example.readinesstrackerbackend.repository.AlgorithmChallengeRepository;
import com.example.readinesstrackerbackend.repository.ProblemAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ChallengeService {
    
    private final AlgorithmChallengeRepository challengeRepository;
    private final ProblemAssignmentRepository assignmentRepository;
    private final Random random = new Random();
    
    public AlgorithmChallenge assignRandomProblem(Long userId, String difficulty) {
        if (assignmentRepository.existsByUserId(userId)) {
            Optional<ProblemAssignment> existing = assignmentRepository.findByUserId(userId);
            if (existing.isPresent()) {
                return existing.get().getChallenge();
            }
        }
        
        List<AlgorithmChallenge> availableChallenges = 
            challengeRepository.findByDifficultyAndIsActive(difficulty, true);
        
        if (availableChallenges.isEmpty()) {
            throw new RuntimeException("No challenges available for difficulty: " + difficulty);
        }
        
        AlgorithmChallenge selectedChallenge = 
            availableChallenges.get(random.nextInt(availableChallenges.size()));
        
        ProblemAssignment assignment = new ProblemAssignment();
        assignment.setUserId(userId);
        assignment.setChallenge(selectedChallenge);
        assignment.setDifficulty(difficulty);
        assignmentRepository.save(assignment);
        
        return selectedChallenge;
    }
    
    public AlgorithmChallenge getChallengeByCode(String problemCode) {
        return challengeRepository.findByProblemCode(problemCode)
            .orElseThrow(() -> new RuntimeException("Challenge not found: " + problemCode));
    }
    
    public AlgorithmChallenge getChallengeById(Long id) {
        return challengeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Challenge not found: " + id));
    }
    
    public List<AlgorithmChallenge> getChallengesByDifficulty(String difficulty) {
        return challengeRepository.findByDifficultyAndIsActive(difficulty, true);
    }
    
    public ProblemAssignment getUserAssignment(Long userId) {
        return assignmentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("No assignment found for user: " + userId));
    }
    
    public Optional<ProblemAssignment> findUserAssignment(Long userId) {
        return assignmentRepository.findByUserId(userId);
    }
}
