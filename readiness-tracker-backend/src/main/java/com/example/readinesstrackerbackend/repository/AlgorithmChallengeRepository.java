package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.AlgorithmChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlgorithmChallengeRepository extends JpaRepository<AlgorithmChallenge, Long> {
    List<AlgorithmChallenge> findByDifficulty(String difficulty);
    List<AlgorithmChallenge> findByDifficultyAndIsActive(String difficulty, Boolean isActive);
    Optional<AlgorithmChallenge> findByProblemCode(String problemCode);
    List<AlgorithmChallenge> findAllByIsActive(Boolean isActive);
}
