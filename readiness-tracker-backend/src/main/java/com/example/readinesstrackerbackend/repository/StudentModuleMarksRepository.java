package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.StudentModuleMarks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentModuleMarksRepository extends JpaRepository<StudentModuleMarks, Long> {
    Optional<StudentModuleMarks> findByStudentId(Long studentId);
}
