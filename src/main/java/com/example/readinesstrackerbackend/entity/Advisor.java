package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "advisors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Advisor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, unique = true)
    private String employeeId;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = true)
    private String specialization;
    
    @Column(name = "created_at")
    private Long createdAt;
}
