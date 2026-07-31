package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.SubmissionCheatingFlags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionCheatingFlagsRepository extends JpaRepository<SubmissionCheatingFlags, Long> {
    Optional<SubmissionCheatingFlags> findBySubmissionId(Long submissionId);
    List<SubmissionCheatingFlags> findByManualReviewRequired(Boolean required);
    List<SubmissionCheatingFlags> findByFinalVerdict(String verdict);
}
