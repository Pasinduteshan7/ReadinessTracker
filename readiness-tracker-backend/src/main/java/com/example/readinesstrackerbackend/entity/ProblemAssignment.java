package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "problem_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private AlgorithmChallenge challenge;
    
    @Column(nullable = false)
    private LocalDateTime assignedAt;
    
    @Column(nullable = false)
    private String difficulty;
    
    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
    }
}
