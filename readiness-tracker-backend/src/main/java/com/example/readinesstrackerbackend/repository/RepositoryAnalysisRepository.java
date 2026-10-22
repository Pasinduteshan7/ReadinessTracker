package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.RepositoryAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositoryAnalysisRepository extends JpaRepository<RepositoryAnalysis, Long> {
    
    Optional<RepositoryAnalysis> findByGithubUrl(String githubUrl);
    
}
