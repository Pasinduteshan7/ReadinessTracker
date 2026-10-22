package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.StudentProfileAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileAnalysisRepository extends JpaRepository<StudentProfileAnalysis, Long> {

    Optional<StudentProfileAnalysis> findByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);
}
