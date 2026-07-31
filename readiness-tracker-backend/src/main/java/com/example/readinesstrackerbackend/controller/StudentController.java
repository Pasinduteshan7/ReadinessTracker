package com.example.readinesstrackerbackend.controller;
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
        Student registered = studentService.register(student);
        String token = jwtTokenProvider.generateToken(registered.getId(), registered.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, registered));
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
}
