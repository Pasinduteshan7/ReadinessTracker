package com.example.readinesstrackerbackend.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.readinesstrackerbackend.entity.GitHubProfile;
@Repository
public interface GitHubProfileRepository extends JpaRepository<GitHubProfile, Long> {
    Optional<GitHubProfile> findByUserId(Long userId);
}
