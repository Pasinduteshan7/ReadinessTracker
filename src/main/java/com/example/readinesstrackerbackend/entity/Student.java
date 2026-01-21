package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String registrationNumber;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String currentYear;
    
    @Column(nullable = true)
    private Double currentGpa;
    
    @Column(nullable = true)
    private String githubUsername;
    
    @Column(nullable = true)
    private String linkedinUrl;
    
    @Column(nullable = true)
    private String facebookUrl;
    
    @Column(name = "created_at")
    private Long createdAt;
}
