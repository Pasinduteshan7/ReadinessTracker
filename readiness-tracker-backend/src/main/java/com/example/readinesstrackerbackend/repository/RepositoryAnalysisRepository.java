package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.RepositoryAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryAnalysisRepository extends JpaRepository<RepositoryAnalysis, Long> {
    
    Optional<RepositoryAnalysis> findByAnalysisId(String analysisId);
    
    Optional<RepositoryAnalysis> findByGithubUrl(String githubUrl);
    
    List<RepositoryAnalysis> findByRepositoryOwner(String repositoryOwner);
    
    List<RepositoryAnalysis> findByProjectScope(RepositoryAnalysis.ProjectScope projectScope);
    
    List<RepositoryAnalysis> findByStatus(RepositoryAnalysis.AnalysisStatus status);
    
    List<RepositoryAnalysis> findByStatusOrderByCreatedAtDesc(RepositoryAnalysis.AnalysisStatus status);
    
    List<RepositoryAnalysis> findByRepositoryOwnerOrderByCreatedAtDesc(String repositoryOwner);
}
