package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.ProblemAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemAssignmentRepository extends JpaRepository<ProblemAssignment, Long> {
    Optional<ProblemAssignment> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
}
