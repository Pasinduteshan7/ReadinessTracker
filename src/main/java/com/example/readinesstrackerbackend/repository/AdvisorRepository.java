package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.Advisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdvisorRepository extends JpaRepository<Advisor, Long> {
    Advisor findByEmail(String email);
    Advisor findByEmployeeId(String employeeId);
}
