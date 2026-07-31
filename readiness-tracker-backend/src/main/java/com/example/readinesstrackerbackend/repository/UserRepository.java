package com.example.readinesstrackerbackend.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.readinesstrackerbackend.model.User;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByGithubUsername(String githubUsername);
    Optional<User> findByGithubId(Long githubId);
    Optional<User> findByEmail(String email);
}
