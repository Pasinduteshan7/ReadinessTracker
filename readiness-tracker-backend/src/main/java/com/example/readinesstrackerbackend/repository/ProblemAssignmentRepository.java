package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.ProblemAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemAssignmentRepository extends JpaRepository<ProblemAssignment, Long> {
    Optional<ProblemAssignment> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
