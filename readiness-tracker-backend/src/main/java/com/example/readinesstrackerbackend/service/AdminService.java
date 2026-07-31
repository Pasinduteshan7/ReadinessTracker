package com.example.readinesstrackerbackend.service;
import com.example.readinesstrackerbackend.entity.Admin;
import com.example.readinesstrackerbackend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin register(Admin admin) {
        admin.setCreatedAt(System.currentTimeMillis());
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }
    public Admin login(String email, String password) {
        Admin admin = adminRepository.findByEmail(email);
        if (admin == null) {
            return null;
        }

        String storedPassword = admin.getPassword();
        if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
            return admin;
        }

        if (storedPassword != null && storedPassword.equals(password)) {
            admin.setPassword(passwordEncoder.encode(password));
            adminRepository.save(admin);
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
