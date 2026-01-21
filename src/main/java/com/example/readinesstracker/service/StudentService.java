package com.example.readinesstracker.service;

import com.example.readinesstracker.entity.Student;
import com.example.readinesstracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;
    
    public Student register(Student student) {
        student.setCreatedAt(System.currentTimeMillis());
        return studentRepository.save(student);
    }
    
    public Student login(String email, String password) {
        Student student = studentRepository.findByEmail(email);
        if (student != null && student.getPassword().equals(password)) {
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
}
