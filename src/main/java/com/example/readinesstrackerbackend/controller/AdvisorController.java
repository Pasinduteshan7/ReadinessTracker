package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.LoginRequest;
import com.example.readinesstrackerbackend.entity.Advisor;
import com.example.readinesstrackerbackend.service.AdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advisors")
@CrossOrigin(origins = "http://localhost:5173")
public class AdvisorController {
    
    @Autowired
    private AdvisorService advisorService;
    
    @PostMapping("/register")
    public ResponseEntity<Advisor> register(@RequestBody Advisor advisor) {
        return ResponseEntity.ok(advisorService.register(advisor));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Advisor advisor = advisorService.login(request.getEmail(), request.getPassword());
        if (advisor != null) {
            return ResponseEntity.ok(advisor);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    
    @GetMapping
    public ResponseEntity<List<Advisor>> getAllAdvisors() {
        return ResponseEntity.ok(advisorService.getAllAdvisors());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdvisorById(@PathVariable Long id) {
        Advisor advisor = advisorService.getAdvisorById(id);
        if (advisor != null) {
            return ResponseEntity.ok(advisor);
        }
        return ResponseEntity.status(404).body("Advisor not found");
    }
}
