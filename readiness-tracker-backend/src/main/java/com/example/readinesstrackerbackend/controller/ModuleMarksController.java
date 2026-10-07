package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.entity.StudentModuleMarks;
import com.example.readinesstrackerbackend.service.ModuleMarksService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/module-marks")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
@RequiredArgsConstructor
@Slf4j
public class ModuleMarksController {

    private final ModuleMarksService moduleMarksService;

    @PostMapping("/student/{studentId}")
    public ResponseEntity<?> saveMarks(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> marksPayload) {
        try {
            log.info("Received module marks update for student ID: {}", studentId);
            StudentModuleMarks saved = moduleMarksService.saveMarksAndPredict(studentId, marksPayload);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Failed to save module marks for student {}: {}", studentId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getMarksForStudent(@PathVariable Long studentId) {
        return moduleMarksService.getMarksByStudentId(studentId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Collections.emptyMap()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<StudentModuleMarks>> getAllMarks() {
        return ResponseEntity.ok(moduleMarksService.getAllMarks());
    }

    @GetMapping("/curriculum")
    public ResponseEntity<?> getCurriculumModules() {
        List<Map<String, String>> modules = new ArrayList<>();
        // Grouped curriculum modules
        modules.add(Map.of("key", "softwareEngineeringPrinciple", "label", "Software Engineering Principle", "category", "Software Engineering"));
        modules.add(Map.of("key", "oopConcept", "label", "OOP Concepts", "category", "Software Engineering"));
        modules.add(Map.of("key", "dsa", "label", "Data Structures & Algorithms (DSA)", "category", "Software Engineering"));
        modules.add(Map.of("key", "adsa", "label", "Advanced DSA (ADSA)", "category", "Software Engineering"));
        modules.add(Map.of("key", "softwareArchitecture", "label", "Software Architecture", "category", "Software Engineering"));
        modules.add(Map.of("key", "dataBase", "label", "Database Systems", "category", "Software Engineering"));
        modules.add(Map.of("key", "gui", "label", "GUI & Frontend Development", "category", "Software Engineering"));
        modules.add(Map.of("key", "qaTesting", "label", "QA & Software Testing", "category", "Software Engineering"));
        modules.add(Map.of("key", "devops", "label", "DevOps & CI/CD", "category", "Software Engineering"));

        modules.add(Map.of("key", "ml", "label", "Machine Learning (ML)", "category", "AI & Data Science"));
        modules.add(Map.of("key", "ai", "label", "Artificial Intelligence (AI)", "category", "AI & Data Science"));
        modules.add(Map.of("key", "imageProcessing", "label", "Digital Image Processing", "category", "AI & Data Science"));

        modules.add(Map.of("key", "embededSystem", "label", "Embedded Systems", "category", "Embedded & Hardware"));
        modules.add(Map.of("key", "analogElectronics", "label", "Analog Electronics", "category", "Embedded & Hardware"));
        modules.add(Map.of("key", "signalAndSystem", "label", "Signal & Linear Systems", "category", "Embedded & Hardware"));
        modules.add(Map.of("key", "digitalLogicDesign", "label", "Digital Logic Design", "category", "Embedded & Hardware"));
        modules.add(Map.of("key", "digitalSystemDesignWithHdl", "label", "Digital System Design with HDL", "category", "Embedded & Hardware"));
        modules.add(Map.of("key", "controlSystem", "label", "Control Systems", "category", "Embedded & Hardware"));

        modules.add(Map.of("key", "informationSecurity", "label", "Information & Cyber Security", "category", "Security & Networks"));
        modules.add(Map.of("key", "computerNetwork", "label", "Computer Networks", "category", "Security & Networks"));
        modules.add(Map.of("key", "operatingSystemAndNetworking", "label", "OS & Networking", "category", "Security & Networks"));

        return ResponseEntity.ok(modules);
    }
}
