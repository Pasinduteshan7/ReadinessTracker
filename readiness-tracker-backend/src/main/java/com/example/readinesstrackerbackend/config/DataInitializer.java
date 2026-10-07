package com.example.readinesstrackerbackend.config;

import com.example.readinesstrackerbackend.entity.Admin;
import com.example.readinesstrackerbackend.entity.Advisor;
import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.AdminRepository;
import com.example.readinesstrackerbackend.repository.AdvisorRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminRepository adminRepository;
    private final AdvisorRepository advisorRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            AdminRepository adminRepository,
            AdvisorRepository advisorRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.advisorRepository = advisorRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedAdvisor();
        seedStudent();
    }

    private void seedAdmin() {
        if (adminRepository.findByEmail("admin@readiness.com") == null) {
            Admin admin = new Admin();
            admin.setName("Admin User");
            admin.setEmail("admin@readiness.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setCreatedAt(System.currentTimeMillis());
            adminRepository.save(admin);
            log.info("Initialized default admin: admin@readiness.com / admin123");
        }
    }

    private void seedAdvisor() {
        if (advisorRepository.findByEmail("adviser@readiness.com") == null) {
            Advisor advisor = new Advisor();
            advisor.setName("Adviser Test");
            advisor.setEmail("adviser@readiness.com");
            advisor.setEmployeeId("ADV001");
            advisor.setDepartment("Computer Science");
            advisor.setPassword(passwordEncoder.encode("adviser123"));
            advisor.setCreatedAt(System.currentTimeMillis());
            advisorRepository.save(advisor);
            log.info("Initialized default advisor: adviser@readiness.com / adviser123");
        }
    }

    private void seedStudent() {
        if (studentRepository.findByEmail("eg245365@engug.ruh.ac.lk") == null) {
            Student student = new Student();
            student.setName("Test Student");
            student.setEmail("eg245365@engug.ruh.ac.lk");
            student.setRegistrationNumber("EG/2020/4536");
            student.setPassword(passwordEncoder.encode("12345678"));
            student.setCurrentYear("1st Year");
            student.setCurrentGpa(3.75);
            student.setGithubUsername("Hasitha160");
            student.setCreatedAt(System.currentTimeMillis());
            studentRepository.save(student);
            log.info("Initialized default student: eg245365@engug.ruh.ac.lk / 12345678");
        }
    }
}
