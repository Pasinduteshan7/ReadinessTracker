package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.Admin;
import com.example.readinesstrackerbackend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;
    
    public Admin register(Admin admin) {
        admin.setCreatedAt(System.currentTimeMillis());
        return adminRepository.save(admin);
    }
    
    public Admin login(String email, String password) {
        Admin admin = adminRepository.findByEmail(email);
        if (admin != null && admin.getPassword().equals(password)) {
            return admin;
        }
        return null;
    }
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public Admin getAdminById(Long id) {
        return adminRepository.findById(id).orElse(null);
    }
}
