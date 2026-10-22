package com.example.readinesstrackerbackend.repository;
import com.example.readinesstrackerbackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByEmail(String email);
    List<Student> findByAdvisorId(Long advisorId);
    List<Student> findByAdvisorIsNull();
    long countByAdvisorId(Long advisorId);
}

