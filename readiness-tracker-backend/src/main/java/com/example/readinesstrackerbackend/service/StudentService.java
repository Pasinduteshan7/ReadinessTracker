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
import com.example.readinesstrackerbackend.repository.AnalysisJobRepository;
import com.example.readinesstrackerbackend.repository.FinalScoreRepository;
import com.example.readinesstrackerbackend.repository.GitHubProfileRepository;
import com.example.readinesstrackerbackend.repository.StudentIndustryReadinessRepository;
import com.example.readinesstrackerbackend.repository.StudentModuleMarksRepository;
import com.example.readinesstrackerbackend.repository.StudentProfileAnalysisRepository;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class StudentService {
    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdvisorRepository advisorRepository;

    @Autowired
    private AnalysisJobRepository analysisJobRepository;

    @Autowired
    private StudentIndustryReadinessRepository studentIndustryReadinessRepository;

    @Autowired
    private StudentModuleMarksRepository studentModuleMarksRepository;

    @Autowired
    private StudentProfileAnalysisRepository studentProfileAnalysisRepository;

    @Autowired
    private FinalScoreRepository finalScoreRepository;

    @Autowired
    private GitHubProfileRepository gitHubProfileRepository;

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
        if (student.getBatchYear() == null && student.getCurrentYear() != null) {
            if (student.getCurrentYear().contains("1")) student.setBatchYear(1);
            else if (student.getCurrentYear().contains("2")) student.setBatchYear(2);
            else if (student.getCurrentYear().contains("3")) student.setBatchYear(3);
            else if (student.getCurrentYear().contains("4")) student.setBatchYear(4);
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

            if (updates.getPortfolioUrl() != null && !updates.getPortfolioUrl().isEmpty()) {
                student.setPortfolioUrl(updates.getPortfolioUrl());
            } else if (updates.getPortfolioUrl() != null) {
                student.setPortfolioUrl(null);
            }

            if (updates.getCodingProfile() != null && !updates.getCodingProfile().isEmpty()) {
                student.setCodingProfile(updates.getCodingProfile());
            } else if (updates.getCodingProfile() != null) {
                student.setCodingProfile(null);
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

    public void changePassword(Long studentId, String currentPassword, String newPassword) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalArgumentException("Current password is required.");
        }

        String stored = student.getPassword();
        boolean matches = (stored != null && passwordEncoder.matches(currentPassword, stored))
                || (stored != null && stored.equals(currentPassword));

        if (!matches) {
            throw new IllegalArgumentException("Current password does not match.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters.");
        }

        if (!newPassword.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("New password must contain at least one uppercase letter (A-Z).");
        }

        if (!newPassword.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("New password must contain at least one number (0-9).");
        }

        student.setPassword(passwordEncoder.encode(newPassword));
        studentRepository.save(student);
    }

    @Transactional
    public void deleteStudentCascade(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        log.info("🗑️ Starting cascade deletion for student ID: {} ({}, {})", studentId, student.getName(), student.getEmail());

        // 1. Delete associated AnalysisJobs (cascading into RepositoryAnalysis rows)
        List<com.example.readinesstrackerbackend.entity.AnalysisJob> jobs = analysisJobRepository.findByStudentId(studentId);
        if (jobs != null && !jobs.isEmpty()) {
            analysisJobRepository.deleteAll(jobs);
            log.info("Deleted {} analysis jobs for student ID {}", jobs.size(), studentId);
        }

        // 2. Delete StudentIndustryReadiness record
        studentIndustryReadinessRepository.findByStudentId(studentId)
                .ifPresent(studentIndustryReadinessRepository::delete);

        // 3. Delete StudentModuleMarks record
        studentModuleMarksRepository.findByStudentId(studentId)
                .ifPresent(studentModuleMarksRepository::delete);

        // 4. Delete StudentProfileAnalysis record
        studentProfileAnalysisRepository.findByStudentId(studentId)
                .ifPresent(studentProfileAnalysisRepository::delete);

        // 5. Delete FinalScore record
        finalScoreRepository.findByStudentId(studentId)
                .ifPresent(finalScoreRepository::delete);

        // 6. Delete GitHubProfile record
        gitHubProfileRepository.findByStudentId(studentId)
                .ifPresent(gitHubProfileRepository::delete);

        // 7. Delete the Student record itself
        studentRepository.delete(student);
        log.info("✅ Successfully deleted student ID: {}", studentId);
    }
}

