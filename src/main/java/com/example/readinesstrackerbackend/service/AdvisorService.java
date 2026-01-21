package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.Advisor;
import com.example.readinesstrackerbackend.repository.AdvisorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdvisorService {
    @Autowired
    private AdvisorRepository advisorRepository;
    
    public Advisor register(Advisor advisor) {
        advisor.setCreatedAt(System.currentTimeMillis());
        return advisorRepository.save(advisor);
    }
    
    public Advisor login(String email, String password) {
        Advisor advisor = advisorRepository.findByEmail(email);
        if (advisor != null && advisor.getPassword().equals(password)) {
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
