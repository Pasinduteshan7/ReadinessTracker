package com.example.readinesstrackerbackend.service;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.example.readinesstrackerbackend.model.User;
import com.example.readinesstrackerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    public User createOrUpdateUser(String githubUsername, Long githubId, String email, String avatarUrl) {
        log.info("Creating or updating user: {}", githubUsername);
        Optional<User> existingUser = userRepository.findByGithubId(githubId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setEmail(email);
            user.setAvatarUrl(avatarUrl);
            log.info("Updated existing user: {}", githubUsername);
            return userRepository.save(user);
        }
        User newUser = new User();
        newUser.setGithubUsername(githubUsername);
        newUser.setGithubId(githubId);
        newUser.setEmail(email);
        newUser.setAvatarUrl(avatarUrl);
        newUser.setFollowers(0);
        log.info("Created new user: {}", githubUsername);
        return userRepository.save(newUser);
    }
    public Optional<User> getUserByUsername(String githubUsername) {
        return userRepository.findByGithubUsername(githubUsername);
    }
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }
}
