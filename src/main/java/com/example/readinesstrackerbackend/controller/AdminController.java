package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.LoginRequest;
import com.example.readinesstrackerbackend.entity.Admin;
import com.example.readinesstrackerbackend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
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
}
