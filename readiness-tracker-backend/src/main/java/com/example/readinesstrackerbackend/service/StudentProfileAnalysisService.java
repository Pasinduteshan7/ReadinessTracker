package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.dto.ProfileAnalysisSaveRequest;
import com.example.readinesstrackerbackend.entity.StudentProfileAnalysis;
import com.example.readinesstrackerbackend.repository.StudentProfileAnalysisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentProfileAnalysisService {

    private final StudentProfileAnalysisRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional
    public StudentProfileAnalysis saveOrUpdate(ProfileAnalysisSaveRequest request) {
        if (request.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID cannot be null");
        }

        StudentProfileAnalysis analysis = repository.findByStudentId(request.getStudentId())
                .orElse(StudentProfileAnalysis.builder()
                        .studentId(request.getStudentId())
                        .createdAt(LocalDateTime.now())
                        .build());

        analysis.setOverallScore(request.getOverallScore() != null ? request.getOverallScore() : 0.0);
        analysis.setReadinessLevel(request.getReadinessLevel() != null ? request.getReadinessLevel() : "Unknown");
        analysis.setTopCareerPath(request.getTopCareerPath());
        analysis.setTopCareerMatch(request.getTopCareerMatch());

        analysis.setSkillsTechScore(request.getSkillsTechScore() != null ? request.getSkillsTechScore() : 0.0);
        analysis.setProjectsDepthScore(request.getProjectsDepthScore() != null ? request.getProjectsDepthScore() : 0.0);
        analysis.setCertificationsScore(request.getCertificationsScore() != null ? request.getCertificationsScore() : 0.0);
        analysis.setExperienceScore(request.getExperienceScore() != null ? request.getExperienceScore() : 0.0);
        analysis.setEducationScore(request.getEducationScore() != null ? request.getEducationScore() : 0.0);
        analysis.setPresentationScore(request.getPresentationScore() != null ? request.getPresentationScore() : 0.0);

        analysis.setPdfFilename(request.getPdfFilename());
        analysis.setUpdatedAt(LocalDateTime.now());

        try {
            if (request.getCapabilityBreakdown() != null) {
                analysis.setCapabilityBreakdown(objectMapper.writeValueAsString(request.getCapabilityBreakdown()));
            }
            if (request.getCareerCompatibility() != null) {
                analysis.setCareerCompatibility(objectMapper.writeValueAsString(request.getCareerCompatibility()));
            }
            if (request.getAiCoachRecommendations() != null) {
                analysis.setAiCoachRecommendations(objectMapper.writeValueAsString(request.getAiCoachRecommendations()));
            }
            if (request.getExtractedSkills() != null) {
                analysis.setExtractedSkills(objectMapper.writeValueAsString(request.getExtractedSkills()));
            }
            if (request.getExtractedProfile() != null) {
                analysis.setExtractedProfile(objectMapper.writeValueAsString(request.getExtractedProfile()));
            }
        } catch (Exception e) {
            log.error("Failed to serialize JSON fields for studentId: {}", request.getStudentId(), e);
        }

        StudentProfileAnalysis saved = repository.save(analysis);
        log.info("Successfully persisted Profile Analysis in Supabase for studentId: {} (Score: {})",
                saved.getStudentId(), saved.getOverallScore());
        return saved;
    }

    public Optional<StudentProfileAnalysis> getByStudentId(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    public List<StudentProfileAnalysis> getAll() {
        return repository.findAll();
    }
}
