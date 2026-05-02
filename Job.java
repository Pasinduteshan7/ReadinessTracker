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
@Table(name = "jobs_data", indexes = {
        @Index(name = "idx_job_title", columnList = "job_title"),
        @Index(name = "idx_salary", columnList = "salary_min,salary_max"),
        @Index(name = "idx_scraped_date", columnList = "scraped_date")
})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 255)
    private String jobId;

    @Column(length = 255)
    private String company;

    @Column(length = 255)
    private String jobTitle;

    @Column(length = 255)
    private String location;

    @Column(length = 50)
    private String jobType; // Remote, Hybrid, Onsite

    @Column(length = 50)
    private String experienceLevel; // Junior, Mid, Senior

    @Column(length = 255)
    private String salaryRange; // e.g., "$50k - $70k"

    @Column
    private Integer salaryMin; // Parsed minimum salary

    @Column
    private Integer salaryMax; // Parsed maximum salary

    @Column(columnDefinition = "LONGTEXT")
    private String detectedSkills; // Comma-separated list

    @Column
    private Integer skillsCount;

    @Column(length = 1000)
    private String skillCategories; // e.g., "Backend, Cloud"

    @Column
    private LocalDateTime scrapedDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to get skills as array
    public String[] getSkillsArray() {
        if (detectedSkills == null || detectedSkills.isEmpty()) {
            return new String[0];
        }
        return detectedSkills.split(",\\s*");
    }

    // Helper method to get categories as array
    public String[] getCategoriesArray() {
        if (skillCategories == null || skillCategories.isEmpty()) {
            return new String[0];
        }
        return skillCategories.split(",\\s*");
    }
}
