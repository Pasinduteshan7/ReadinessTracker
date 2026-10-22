package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.dto.CohortReadinessResponse;
import com.example.readinesstrackerbackend.dto.UnifiedReadinessDTO;
import com.example.readinesstrackerbackend.entity.*;
import com.example.readinesstrackerbackend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedReadinessService {

    private final StudentRepository studentRepository;
    private final StudentModuleMarksRepository moduleMarksRepository;
    private final StudentIndustryReadinessRepository industryReadinessRepository;
    private final StudentProfileAnalysisRepository profileAnalysisRepository;
    private final FinalScoreRepository finalScoreRepository;

    private static final double WEIGHT_ACADEMIC = 0.25;
    private static final double WEIGHT_GITHUB = 0.30;
    private static final double WEIGHT_INDUSTRY = 0.20;
    private static final double WEIGHT_PROFILE = 0.25;

    public CohortReadinessResponse getCohortReadiness(Long currentStudentId) {
        log.info("Calculating unified employability readiness cohort analysis for studentId: {}", currentStudentId);

        List<Student> students = studentRepository.findAll();
        if (students.isEmpty()) {
            return CohortReadinessResponse.builder()
                    .rankedStudents(Collections.emptyList())
                    .totalCohortSize(0)
                    .averageOverallScore(0.0)
                    .averageAcademicScore(0.0)
                    .averageGithubScore(0.0)
                    .averageIndustryScore(0.0)
                    .averageProfileScore(0.0)
                    .topScore(0.0)
                    .build();
        }

        // Cache related entities into Maps for O(1) lookup
        Map<Long, StudentModuleMarks> marksMap = moduleMarksRepository.findAll().stream()
                .filter(m -> m.getStudentId() != null)
                .collect(Collectors.toMap(StudentModuleMarks::getStudentId, m -> m, (a, b) -> a));

        Map<Long, StudentIndustryReadiness> industryMap = industryReadinessRepository.findAll().stream()
                .filter(i -> i.getStudentId() != null)
                .collect(Collectors.toMap(StudentIndustryReadiness::getStudentId, i -> i, (a, b) -> a));

        Map<Long, StudentProfileAnalysis> profileMap = profileAnalysisRepository.findAll().stream()
                .filter(p -> p.getStudentId() != null)
                .collect(Collectors.toMap(StudentProfileAnalysis::getStudentId, p -> p, (a, b) -> a));

        Map<Long, FinalScore> finalScoresMap = new HashMap<>();
        try {
            finalScoreRepository.findAll().forEach(fs -> {
                if (fs.getStudent() != null && fs.getStudent().getId() != null) {
                    finalScoresMap.put(fs.getStudent().getId(), fs);
                }
            });
        } catch (Exception e) {
            log.warn("Could not load final_scores for student lookup: {}", e.getMessage());
        }

        List<UnifiedReadinessDTO> dtos = new ArrayList<>();

        for (Student student : students) {
            Long sid = student.getId();
            StudentModuleMarks marks = marksMap.get(sid);
            StudentIndustryReadiness industry = industryMap.get(sid);
            StudentProfileAnalysis profile = profileMap.get(sid);
            FinalScore finalScore = finalScoresMap.get(sid);

            Double academicScore = calculateAcademicScore(student, marks);
            Double githubScore = calculateGithubScore(student, finalScore);
            Double industryScore = industry != null ? industry.getIndustryMatchScore() : null;
            Double profileScore = profile != null ? profile.getOverallScore() : null;

            int evaluatedCount = 0;
            double weightedSum = 0.0;
            double totalWeight = 0.0;

            if (academicScore != null) {
                weightedSum += academicScore * WEIGHT_ACADEMIC;
                totalWeight += WEIGHT_ACADEMIC;
                evaluatedCount++;
            }
            if (githubScore != null) {
                weightedSum += githubScore * WEIGHT_GITHUB;
                totalWeight += WEIGHT_GITHUB;
                evaluatedCount++;
            }
            if (industryScore != null) {
                weightedSum += industryScore * WEIGHT_INDUSTRY;
                totalWeight += WEIGHT_INDUSTRY;
                evaluatedCount++;
            }
            if (profileScore != null) {
                weightedSum += profileScore * WEIGHT_PROFILE;
                totalWeight += WEIGHT_PROFILE;
                evaluatedCount++;
            }

            double overallScore = (totalWeight > 0) ? (weightedSum / totalWeight) : 0.0;
            overallScore = Math.round(overallScore * 10.0) / 10.0; // round to 1 decimal

            String tier = determineTier(overallScore);

            String topSpec = marks != null ? (marks.getPrimarySpecializationLabel() != null ? marks.getPrimarySpecializationLabel() : marks.getPrimarySpecialization()) : null;
            Double specConf = marks != null ? marks.getPrimaryConfidence() : null;

            String topCareer = profile != null ? profile.getTopCareerPath() : null;
            Double topCareerMatch = profile != null ? profile.getTopCareerMatch() : null;

            // Determine primary strength and growth area
            String primaryStrength = determineStrength(academicScore, githubScore, industryScore, profileScore);
            String primaryGrowth = determineGrowthArea(academicScore, githubScore, industryScore, profileScore);

            UnifiedReadinessDTO dto = UnifiedReadinessDTO.builder()
                    .studentId(sid)
                    .studentName(student.getName())
                    .email(student.getEmail())
                    .registrationNumber(student.getRegistrationNumber())
                    .currentYear(student.getCurrentYear())
                    .batchYear(student.getBatchYear())
                    .avatarUrl(student.getAvatarUrl())
                    .currentGpa(student.getCurrentGpa())
                    .overallScore(overallScore)
                    .readinessTier(tier)
                    .evaluatedPillarsCount(evaluatedCount)
                    .academicScore(academicScore != null ? Math.round(academicScore * 10.0) / 10.0 : null)
                    .githubScore(githubScore != null ? Math.round(githubScore * 10.0) / 10.0 : null)
                    .industryScore(industryScore != null ? Math.round(industryScore * 10.0) / 10.0 : null)
                    .profileScore(profileScore != null ? Math.round(profileScore * 10.0) / 10.0 : null)
                    .topSpecialization(topSpec)
                    .specializationConfidence(specConf)
                    .topCareerPath(topCareer)
                    .topCareerMatch(topCareerMatch)
                    .primaryStrength(primaryStrength)
                    .primaryGrowthArea(primaryGrowth)
                    .build();

            dtos.add(dto);
        }

        // Sort descending by overallScore
        dtos.sort((a, b) -> Double.compare(b.getOverallScore(), a.getOverallScore()));

        // Assign ranks & percentiles
        int total = dtos.size();
        for (int i = 0; i < total; i++) {
            UnifiedReadinessDTO dto = dtos.get(i);
            int rank = i + 1;
            dto.setRank(rank);
            double percentile = total > 1 ? Math.round(((double) (total - rank) / (total - 1)) * 1000.0) / 10.0 : 100.0;
            dto.setPercentile(percentile);
        }

        // Compute cohort averages
        double sumOverall = dtos.stream().mapToDouble(UnifiedReadinessDTO::getOverallScore).sum();
        double avgOverall = Math.round((sumOverall / total) * 10.0) / 10.0;

        double avgAcademic = averagePillar(dtos.stream().map(UnifiedReadinessDTO::getAcademicScore).collect(Collectors.toList()));
        double avgGithub = averagePillar(dtos.stream().map(UnifiedReadinessDTO::getGithubScore).collect(Collectors.toList()));
        double avgIndustry = averagePillar(dtos.stream().map(UnifiedReadinessDTO::getIndustryScore).collect(Collectors.toList()));
        double avgProfile = averagePillar(dtos.stream().map(UnifiedReadinessDTO::getProfileScore).collect(Collectors.toList()));

        UnifiedReadinessDTO currentStudentDto = null;
        if (currentStudentId != null) {
            currentStudentDto = dtos.stream()
                    .filter(d -> d.getStudentId().equals(currentStudentId))
                    .findFirst()
                    .orElse(null);
        }

        return CohortReadinessResponse.builder()
                .rankedStudents(dtos)
                .studentReadiness(currentStudentDto)
                .totalCohortSize(total)
                .averageOverallScore(avgOverall)
                .averageAcademicScore(avgAcademic)
                .averageGithubScore(avgGithub)
                .averageIndustryScore(avgIndustry)
                .averageProfileScore(avgProfile)
                .topScore(dtos.isEmpty() ? 0.0 : dtos.get(0).getOverallScore())
                .build();
    }

    private Double calculateAcademicScore(Student student, StudentModuleMarks marks) {
        if (marks != null) {
            Double[] markValues = new Double[]{
                    marks.getSoftwareEngineeringPrinciple(), marks.getOopConcept(), marks.getDsa(), marks.getAdsa(),
                    marks.getMl(), marks.getAi(), marks.getImageProcessing(), marks.getQaTesting(),
                    marks.getSignalAndSystem(), marks.getAnalogElectronics(), marks.getEmbededSystem(),
                    marks.getSoftwareArchitecture(), marks.getDataBase(), marks.getDigitalLogicDesign(),
                    marks.getInformationSecurity(), marks.getDevops(), marks.getOperatingSystemAndNetworking(),
                    marks.getControlSystem(), marks.getDigitalSystemDesignWithHdl(), marks.getComputerNetwork(),
                    marks.getGui()
            };
            double sum = 0.0;
            int count = 0;
            for (Double v : markValues) {
                if (v != null) {
                    sum += v;
                    count++;
                }
            }
            if (count > 0) {
                return sum / count;
            }
        }
        if (student.getCurrentGpa() != null && student.getCurrentGpa() > 0) {
            return Math.min(100.0, (student.getCurrentGpa() / 4.0) * 100.0);
        }
        return null;
    }

    private Double calculateGithubScore(Student student, FinalScore finalScore) {
        if (student.getLatestAiOverallScore() != null) {
            return student.getLatestAiOverallScore();
        }
        if (finalScore != null) {
            if (finalScore.getFinalScore() != null) return finalScore.getFinalScore();
            if (finalScore.getRepoQualityScore() != null) return finalScore.getRepoQualityScore();
            if (finalScore.getGithubScore() != null) return finalScore.getGithubScore();
        }
        return null;
    }

    private String determineTier(double score) {
        if (score >= 80.0) return "Industry Ready";
        if (score >= 60.0) return "Nearly Ready";
        if (score >= 40.0) return "Developing";
        return "Foundational";
    }

    private String determineStrength(Double academic, Double github, Double industry, Double profile) {
        double max = -1;
        String strength = "Holistic Potential";
        if (academic != null && academic > max) { max = academic; strength = "Academic Rigor"; }
        if (github != null && github > max) { max = github; strength = "Codebase & GitHub Quality"; }
        if (industry != null && industry > max) { max = industry; strength = "Industry Skill Match"; }
        if (profile != null && profile > max) { strength = "Social Media & Career Profile"; }
        return strength;
    }

    private String determineGrowthArea(Double academic, Double github, Double industry, Double profile) {
        if (github == null || github < 50) return "GitHub Code Quality & Testing";
        if (industry == null || industry < 50) return "Industry Tech Stack Alignment";
        if (profile == null || profile < 50) return "Resume & LinkedIn Visibility";
        if (academic == null || academic < 50) return "Curriculum Module Marks";
        return "Advanced Project Depth & CI/CD";
    }

    private double averagePillar(List<Double> scores) {
        List<Double> valid = scores.stream().filter(Objects::nonNull).toList();
        if (valid.isEmpty()) return 0.0;
        double sum = valid.stream().mapToDouble(Double::doubleValue).sum();
        return Math.round((sum / valid.size()) * 10.0) / 10.0;
    }
}
