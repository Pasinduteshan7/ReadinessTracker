package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.dto.IndustryDemandResult;
import com.example.readinesstrackerbackend.entity.IndustrySkill;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.IndustrySkillRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class IndustryDemandService {

    private static final int MAX_MISSING_SKILLS = 10;

    private final StudentRepository studentRepository;
    private final IndustrySkillRepository industrySkillRepository;

    public IndustryDemandService(StudentRepository studentRepository,
                                 IndustrySkillRepository industrySkillRepository) {
        this.studentRepository = studentRepository;
        this.industrySkillRepository = industrySkillRepository;
    }

    public IndustryDemandResult calculateMatch(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        List<IndustrySkill> industrySkills = industrySkillRepository.findAllByOrderByWeightDesc();
        Set<String> studentSkills = parseStudentSkills(student.getSkills());

        List<String> matchedSkills = new ArrayList<>();
        double totalWeight = 0.0;
        double matchedWeight = 0.0;

        for (IndustrySkill industrySkill : industrySkills) {
            String skillName = industrySkill.getSkillName();
            if (skillName == null || skillName.isBlank()) {
                continue;
            }

            double weight = industrySkill.getWeight() == null ? 0.0 : industrySkill.getWeight();
            totalWeight += weight;
            if (studentSkills.contains(normalize(skillName))) {
                matchedSkills.add(skillName);
                matchedWeight += weight;
            }
        }

        double score = totalWeight > 0.0 ? (matchedWeight / totalWeight) * 100.0 : 0.0;
        score = Math.max(0.0, Math.min(100.0, score));

        List<String> topMissingSkills = industrySkills.stream()
                .filter(skill -> skill.getSkillName() != null && !skill.getSkillName().isBlank())
                .filter(skill -> !studentSkills.contains(normalize(skill.getSkillName())))
                .sorted(Comparator.comparing(IndustrySkill::getWeight,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_MISSING_SKILLS)
                .map(IndustrySkill::getSkillName)
                .collect(Collectors.toList());

        return new IndustryDemandResult(studentId, score, matchedSkills, topMissingSkills);
    }

    private Set<String> parseStudentSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isEmpty())
                .map(this::normalize)
                .collect(Collectors.toSet());
    }

    private String normalize(String skill) {
        return skill.trim().toLowerCase(Locale.ROOT);
    }
}