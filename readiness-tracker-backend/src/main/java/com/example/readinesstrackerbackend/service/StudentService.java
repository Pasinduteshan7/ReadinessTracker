package com.example.readinesstrackerbackend.service;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Student register(Student student) {
        student.setCreatedAt(System.currentTimeMillis());
        if (student.getCurrentYear() == null || student.getCurrentYear().isBlank()) {
            student.setCurrentYear("1st Year");
        }
        // Encode password before saving
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepository.save(student);
    }

    public Student login(String email, String password) {
        Student student = studentRepository.findByEmail(email);
        if (student == null) {
            return null;
        }

        String storedPassword = student.getPassword();
        if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
            return student;
        }

        if (storedPassword != null && storedPassword.equals(password)) {
            student.setPassword(passwordEncoder.encode(password));
            studentRepository.save(student);
            return student;
        }

        return null;
    }
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    public Student getStudentById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    public Student updateStudent(Long id, Student updates) {
        Student student = studentRepository.findById(id).orElse(null);
        if (student == null) {
            return null;
        }
        
        try {
            // Update only allowed fields (not email, registrationNumber, password)
            if (updates.getGithubUsername() != null && !updates.getGithubUsername().isEmpty()) {
                student.setGithubUsername(updates.getGithubUsername());
            } else if (updates.getGithubUsername() != null) {
                student.setGithubUsername(null);
            }
            
            if (updates.getLinkedinUrl() != null && !updates.getLinkedinUrl().isEmpty()) {
                student.setLinkedinUrl(updates.getLinkedinUrl());
            } else if (updates.getLinkedinUrl() != null) {
                student.setLinkedinUrl(null);
            }
            
            if (updates.getCurrentYear() != null && !updates.getCurrentYear().isEmpty()) {
                student.setCurrentYear(updates.getCurrentYear());
            }
            
            if (updates.getCurrentGpa() != null && updates.getCurrentGpa() >= 0) {
                student.setCurrentGpa(updates.getCurrentGpa());
            }
            
            return studentRepository.save(student);
        } catch (Exception e) {
            throw new RuntimeException("Error updating student: " + e.getMessage(), e);
        }
    }

    public Student updateAiAnalysisResult(Long studentId, Map<String, Object> analysisResult) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return null;
        }

        try {
            student.setLatestAiOverallScore(toDouble(analysisResult.get("overall_score")));
            student.setLatestAiCodeQualityScore(toDouble(analysisResult.get("code_quality_score")));
            student.setLatestAiArchitectureScore(toDouble(analysisResult.get("architecture_score")));
            student.setLatestAiDocumentationScore(toDouble(analysisResult.get("documentation_score")));
            student.setLatestAiTestingScore(toDouble(analysisResult.get("testing_score")));
            student.setLatestAiStatus(toStringValue(analysisResult.get("status"), "completed"));
            student.setAiAnalysisResultJson(new ObjectMapper().writeValueAsString(analysisResult));
            return studentRepository.save(student);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error storing AI analysis result: " + e.getMessage(), e);
        }
    }

    private Double toDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return null;
    }

    private String toStringValue(Object value, String defaultValue) {
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            return stringValue;
        }
        return defaultValue;
    }
}
