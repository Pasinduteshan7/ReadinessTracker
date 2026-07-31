package com.example.readinesstrackerbackend.dto;

import com.example.readinesstrackerbackend.entity.Student;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String name;
    private String registrationNumber;
    private String currentYear;
    private Double currentGpa;
    private String githubUsername;
    private String linkedinUrl;
    private Long createdAt;

    public LoginResponse(String token, Student student) {
        this.token = token;
        this.id = student.getId();
        this.email = student.getEmail();
        this.name = student.getName();
        this.registrationNumber = student.getRegistrationNumber();
        this.currentYear = student.getCurrentYear();
        this.currentGpa = student.getCurrentGpa();
        this.githubUsername = student.getGithubUsername();
        this.linkedinUrl = student.getLinkedinUrl();
        this.createdAt = student.getCreatedAt();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getCurrentYear() {
        return currentYear;
    }

    public void setCurrentYear(String currentYear) {
        this.currentYear = currentYear;
    }

    public Double getCurrentGpa() {
        return currentGpa;
    }

    public void setCurrentGpa(Double currentGpa) {
        this.currentGpa = currentGpa;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
}
