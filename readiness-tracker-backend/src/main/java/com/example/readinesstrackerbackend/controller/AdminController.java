package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.AdvisorAssignmentRequest;
import com.example.readinesstrackerbackend.dto.LoginRequest;

import com.example.readinesstrackerbackend.entity.Admin;
import com.example.readinesstrackerbackend.entity.Advisor;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.service.AdminService;
import com.example.readinesstrackerbackend.service.AdvisorService;
import com.example.readinesstrackerbackend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private AdvisorService advisorService;

    @PostMapping("/register")
    public ResponseEntity<Admin> register(@RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.register(admin));
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Admin admin = adminService.login(request.getEmail(), request.getPassword());
        if (admin != null) {
            return ResponseEntity.ok(admin);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        Admin admin = adminService.getAdminById(id);
        if (admin != null) {
            return ResponseEntity.ok(admin);
        }
        return ResponseEntity.status(404).body("Admin not found");
    }

    @PostMapping("/assignments/assign")
    public ResponseEntity<?> assignAdvisor(@RequestBody AdvisorAssignmentRequest request) {
        try {
            if (request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No students provided"));
            }
            List<Student> updated = studentService.bulkAssignAdvisor(request.getStudentIds(), request.getAdvisorId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Assigned " + updated.size() + " student(s) successfully",
                "assignedCount", updated.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/assignments/unassign")
    public ResponseEntity<?> unassignAdvisor(@RequestBody AdvisorAssignmentRequest request) {
        try {
            if (request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No students provided"));
            }
            List<Student> updated = studentService.bulkUnassignAdvisor(request.getStudentIds());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Unassigned " + updated.size() + " student(s) successfully",
                "unassignedCount", updated.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/assignments/stats")
    public ResponseEntity<?> getAssignmentStats() {
        List<Student> allStudents = studentService.getAllStudents();
        List<Advisor> allAdvisors = advisorService.getAllAdvisors();
        List<Student> unassigned = studentService.getUnassignedStudents();

        List<Map<String, Object>> advisorWorkloads = allAdvisors.stream().map(advisor -> {
            long count = studentService.getStudentsByAdvisorId(advisor.getId()).size();
            Map<String, Object> map = new HashMap<>();
            map.put("id", advisor.getId());
            map.put("name", advisor.getName());
            map.put("email", advisor.getEmail());
            map.put("employeeId", advisor.getEmployeeId());
            map.put("department", advisor.getDepartment());
            map.put("specialization", advisor.getSpecialization());
            map.put("assignedCount", count);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("totalStudents", allStudents.size());
        response.put("totalAdvisors", allAdvisors.size());
        response.put("assignedCount", allStudents.size() - unassigned.size());
        response.put("unassignedCount", unassigned.size());
        response.put("advisorWorkloads", advisorWorkloads);

        return ResponseEntity.ok(response);
    }
}

