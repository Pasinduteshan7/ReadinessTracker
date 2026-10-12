package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.ChallengeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {
    Optional<ChallengeSubmission> findByStudentIdAndChallenge_Id(Long studentId, Long challengeId);
    Optional<ChallengeSubmission> findByStudentId(Long studentId);
    List<ChallengeSubmission> findByIsFlagged(Boolean isFlagged);
    List<ChallengeSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
}
