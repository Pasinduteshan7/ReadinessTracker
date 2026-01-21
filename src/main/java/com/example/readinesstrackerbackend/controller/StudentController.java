package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.LoginRequest;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {
    
    @Autowired
    private StudentService studentService;
    
    @PostMapping("/register")
    public ResponseEntity<Student> register(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.register(student));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Student student = studentService.login(request.getEmail(), request.getPassword());
        if (student != null) {
            return ResponseEntity.ok(student);
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
}
