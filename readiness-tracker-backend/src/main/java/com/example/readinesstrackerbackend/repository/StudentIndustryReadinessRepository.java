package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.entity.StudentIndustryReadiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentIndustryReadinessRepository extends JpaRepository<StudentIndustryReadiness, Long> {

    Optional<StudentIndustryReadiness> findByStudentId(Long studentId);
}
