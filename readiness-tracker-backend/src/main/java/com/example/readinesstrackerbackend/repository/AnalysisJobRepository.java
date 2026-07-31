package com.example.readinesstrackerbackend.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.example.readinesstrackerbackend.entity.AnalysisJob;
@Repository
public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, Long> {
    Optional<AnalysisJob> findByIdAndUserId(Long id, Long userId);
    List<AnalysisJob> findByUserId(Long userId);
    List<AnalysisJob> findByStatus(AnalysisJob.JobStatus status);
    Optional<AnalysisJob> findByJobId(String jobId);
    Optional<AnalysisJob> findFirstByGithubUsernameAndUserIdOrderByCreatedAtDesc(String githubUsername, Long userId);
    List<AnalysisJob> findByGithubUsernameOrderByCreatedAtDesc(String githubUsername);
    
    @Modifying
    @Transactional
    @Query("UPDATE AnalysisJob j SET j.progress = :progress, j.currentStep = :currentStep WHERE j.id = :id")
    void updateProgressOnly(@Param("id") Long id, @Param("progress") Integer progress, @Param("currentStep") String currentStep);
}
