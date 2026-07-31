package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StudentServiceTest {

    @Test
    void updateAiAnalysisResultPersistsScoresAndJson() {
        StudentRepository studentRepository = Mockito.mock(StudentRepository.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);

        StudentService studentService = new StudentService();
        ReflectionTestUtils.setField(studentService, "studentRepository", studentRepository);
        ReflectionTestUtils.setField(studentService, "passwordEncoder", passwordEncoder);

        Student student = new Student();
        student.setId(10L);
        when(studentRepository.findById(10L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> analysisResult = new HashMap<>();
        analysisResult.put("overall_score", 88.5);
        analysisResult.put("code_quality_score", 90.0);
        analysisResult.put("architecture_score", 85.0);
        analysisResult.put("documentation_score", 80.0);
        analysisResult.put("testing_score", 78.0);
        analysisResult.put("status", "completed");

        Student updated = studentService.updateAiAnalysisResult(10L, analysisResult);

        assertNotNull(updated);
        assertEquals(88.5, updated.getLatestAiOverallScore());
        assertEquals(90.0, updated.getLatestAiCodeQualityScore());
        assertEquals(85.0, updated.getLatestAiArchitectureScore());
        assertEquals(80.0, updated.getLatestAiDocumentationScore());
        assertEquals(78.0, updated.getLatestAiTestingScore());
        assertEquals("completed", updated.getLatestAiStatus());
        assertTrue(updated.getAiAnalysisResultJson().contains("overall_score"));
        verify(studentRepository).save(student);
    }

    @Test
    void loginAcceptsLegacyPlainTextPasswords() {
        StudentRepository studentRepository = Mockito.mock(StudentRepository.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);

        StudentService studentService = new StudentService();
        ReflectionTestUtils.setField(studentService, "studentRepository", studentRepository);
        ReflectionTestUtils.setField(studentService, "passwordEncoder", passwordEncoder);

        Student student = new Student();
        student.setEmail("student@example.com");
        student.setPassword("legacy-password");

        when(studentRepository.findByEmail("student@example.com")).thenReturn(student);
        when(passwordEncoder.matches("legacy-password", "legacy-password")).thenReturn(false);

        Student authenticated = studentService.login("student@example.com", "legacy-password");

        assertSame(student, authenticated);
    }
}
