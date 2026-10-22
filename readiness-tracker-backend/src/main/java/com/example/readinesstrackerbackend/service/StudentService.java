package com.example.readinesstrackerbackend.service;
import com.example.readinesstrackerbackend.entity.Advisor;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.AdvisorRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.readinesstrackerbackend.util.EncryptionUtil;
import java.util.Map;
@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdvisorRepository advisorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EncryptionUtil encryptionUtil;

    private static final java.util.regex.Pattern STUDENT_EMAIL_PATTERN =
            java.util.regex.Pattern.compile("^eg2\\d+@engug\\.ruh\\.ac\\.lk$", java.util.regex.Pattern.CASE_INSENSITIVE);

    public Student saveGithubToken(Long studentId, String plainToken) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        if (plainToken == null || plainToken.trim().isEmpty()) {
            student.setGithubToken(null);
        } else {
            String encrypted = encryptionUtil.encrypt(plainToken.trim());
            student.setGithubToken(encrypted);
        }
        return studentRepository.save(student);
    }

    public Student deleteGithubToken(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));
        student.setGithubToken(null);
        return studentRepository.save(student);
    }

    public String getDecryptedGithubToken(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null || student.getGithubToken() == null || student.getGithubToken().isBlank()) {
            return null;
        }
        return encryptionUtil.decrypt(student.getGithubToken());
    }

    public String getMaskedGithubToken(Long studentId) {
        String plain = getDecryptedGithubToken(studentId);
        return encryptionUtil.maskToken(plain);
    }

    public Student register(Student student) {
        if (student.getEmail() == null || !STUDENT_EMAIL_PATTERN.matcher(student.getEmail().trim()).matches()) {
            throw new IllegalArgumentException("Only Ruhuna student emails matching eg2xxxxx@engug.ruh.ac.lk are accepted.");
        }

        String normalizedEmail = student.getEmail().trim().toLowerCase();
        if (studentRepository.findByEmail(normalizedEmail) != null) {
            throw new IllegalArgumentException("An account with this university email already exists.");
        }

        student.setEmail(normalizedEmail);
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

            if (updates.getSkills() != null) {
                student.setSkills(normalizeSkills(updates.getSkills()));
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

    private String normalizeSkills(String skills) {
        return java.util.Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isEmpty())
                .distinct()
                .collect(java.util.stream.Collectors.joining(", "));
    }

    public Student assignAdvisor(Long studentId, Long advisorId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));
        if (advisorId == null) {
            student.setAdvisor(null);
        } else {
            Advisor advisor = advisorRepository.findById(advisorId)
                    .orElseThrow(() -> new IllegalArgumentException("Advisor not found with ID: " + advisorId));
            student.setAdvisor(advisor);
        }
        return studentRepository.save(student);
    }

    public List<Student> bulkAssignAdvisor(List<Long> studentIds, Long advisorId) {
        if (studentIds == null || studentIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        Advisor advisor = null;
        if (advisorId != null) {
            advisor = advisorRepository.findById(advisorId)
                    .orElseThrow(() -> new IllegalArgumentException("Advisor not found with ID: " + advisorId));
        }
        List<Student> students = studentRepository.findAllById(studentIds);
        for (Student s : students) {
            s.setAdvisor(advisor);
        }
        return studentRepository.saveAll(students);
    }

    public List<Student> bulkUnassignAdvisor(List<Long> studentIds) {
        return bulkAssignAdvisor(studentIds, null);
    }

    public List<Student> getStudentsByAdvisorId(Long advisorId) {
        return studentRepository.findByAdvisorId(advisorId);
    }

    public List<Student> getUnassignedStudents() {
        return studentRepository.findByAdvisorIsNull();
    }
}

