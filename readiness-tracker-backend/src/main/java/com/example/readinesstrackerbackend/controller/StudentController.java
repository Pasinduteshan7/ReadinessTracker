package com.example.readinesstrackerbackend.controller;
import com.example.readinesstrackerbackend.dto.ChangePasswordRequest;
import com.example.readinesstrackerbackend.dto.LoginRequest;
import com.example.readinesstrackerbackend.dto.LoginResponse;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.service.StudentService;
import com.example.readinesstrackerbackend.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class StudentController {
    private static final Logger log = LoggerFactory.getLogger(StudentController.class);
    @Autowired
    private StudentService studentService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Student student) {
        try {
            Student registered = studentService.register(student);
            String token = jwtTokenProvider.generateToken(registered.getId(), registered.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, registered));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Student registration failed: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Registration failed");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Student student = studentService.login(request.getEmail(), request.getPassword());
        if (student != null) {
            String token = jwtTokenProvider.generateToken(student.getId(), student.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, student));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        if (student != null) {
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.status(404).body("Student not found");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student updates) {
        try {
            log.info("Updating student ID: {} with data: {}", id, updates);
            Student updated = studentService.updateStudent(id, updates);
            if (updated != null) {
                String token = jwtTokenProvider.generateToken(updated.getId(), updated.getEmail());
                return ResponseEntity.ok(new LoginResponse(token, updated));
            }
            return ResponseEntity.status(404).body("Student not found");
        } catch (Exception e) {
            log.error("Error updating student: ", e);
            return ResponseEntity.status(500).body("Error updating student: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/ai-analysis")
    public ResponseEntity<?> getStudentAiAnalysis(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        if (student == null) {
            return ResponseEntity.status(404).body("Student not found");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", student.getId());
        response.put("studentName", student.getName());
        response.put("latestAiOverallScore", student.getLatestAiOverallScore());
        response.put("latestAiCodeQualityScore", student.getLatestAiCodeQualityScore());
        response.put("latestAiArchitectureScore", student.getLatestAiArchitectureScore());
        response.put("latestAiDocumentationScore", student.getLatestAiDocumentationScore());
        response.put("latestAiTestingScore", student.getLatestAiTestingScore());
        response.put("latestAiStatus", student.getLatestAiStatus());
        response.put("aiAnalysisResultJson", student.getAiAnalysisResultJson());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/github-token")
    public ResponseEntity<?> saveGithubToken(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String token = body != null ? body.get("token") : null;
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Token cannot be empty"));
            }
            studentService.saveGithubToken(id, token.trim());
            String preview = studentService.getMaskedGithubToken(id);
            log.info("🔐 Encrypted and saved GitHub token for student ID: {}", id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "GitHub token encrypted and saved securely",
                    "hasGithubToken", true,
                    "preview", preview != null ? preview : ""
            ));
        } catch (Exception e) {
            log.error("Error saving GitHub token: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Error saving GitHub token: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/github-token")
    public ResponseEntity<?> deleteGithubToken(@PathVariable Long id) {
        try {
            studentService.deleteGithubToken(id);
            log.info("🗑️ Removed GitHub token for student ID: {}", id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "GitHub token removed successfully",
                    "hasGithubToken", false
            ));
        } catch (Exception e) {
            log.error("Error removing GitHub token: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Error removing GitHub token: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/github-token/status")
    public ResponseEntity<?> getGithubTokenStatus(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        if (student == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Student not found"));
        }
        boolean hasToken = student.getHasGithubToken() != null && student.getHasGithubToken();
        String preview = hasToken ? studentService.getMaskedGithubToken(id) : null;
        return ResponseEntity.ok(Map.of(
                "hasGithubToken", hasToken,
                "preview", preview != null ? preview : ""
        ));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Current password and new password are required"));
            }
            studentService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update password for student ID {}: ", id, e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update password: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudentCascade(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student account deleted successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete student ID {}: ", id, e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete student: " + e.getMessage()));
        }
    }
}
