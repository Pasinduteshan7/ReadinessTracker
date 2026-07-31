package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.BenchmarkAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BenchmarkAccountRepository extends JpaRepository<BenchmarkAccount, Long> {

    Optional<BenchmarkAccount> findByGithubUsername(String githubUsername);

    List<BenchmarkAccount> findByAnalysisStatus(String analysisStatus);

    boolean existsByGithubUsername(String githubUsername);
}
