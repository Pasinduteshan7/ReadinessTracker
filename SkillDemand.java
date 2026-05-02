package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "skills_demand", indexes = {
        @Index(name = "idx_skill_name", columnList = "skill_name"),
        @Index(name = "idx_count", columnList = "count DESC")
})
public class SkillDemand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 255)
    private String skillName;

    @Column
    private Integer count;

    @Column
    private Double percentage;

    @Column(length = 100)
    private String category; // Language, Framework, Database, Cloud, Tool, etc.

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime lastUpdated;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
