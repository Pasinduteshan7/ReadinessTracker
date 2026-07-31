package com.example.readinesstrackerbackend.service;
import com.example.readinesstrackerbackend.entity.Advisor;
import com.example.readinesstrackerbackend.repository.AdvisorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class AdvisorService {
    @Autowired
    private AdvisorRepository advisorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Advisor register(Advisor advisor) {
        advisor.setCreatedAt(System.currentTimeMillis());
        advisor.setPassword(passwordEncoder.encode(advisor.getPassword()));
        return advisorRepository.save(advisor);
    }
    public Advisor login(String email, String password) {
        Advisor advisor = advisorRepository.findByEmail(email);
        if (advisor == null) {
            return null;
        }

        String storedPassword = advisor.getPassword();
        if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
            return advisor;
        }

        if (storedPassword != null && storedPassword.equals(password)) {
            advisor.setPassword(passwordEncoder.encode(password));
            advisorRepository.save(advisor);
            return advisor;
        }

        return null;
    }
    public List<Advisor> getAllAdvisors() {
        return advisorRepository.findAll();
    }
    public Advisor getAdvisorById(Long id) {
        return advisorRepository.findById(id).orElse(null);
    }
}
