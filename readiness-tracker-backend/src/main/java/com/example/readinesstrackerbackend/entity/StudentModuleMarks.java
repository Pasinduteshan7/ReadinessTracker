package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_module_marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentModuleMarks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long studentId;

    // 21 Curriculum Subject Marks
    @Column private Double softwareEngineeringPrinciple;
    @Column private Double oopConcept;
    @Column private Double dsa;
    @Column private Double adsa;
    @Column private Double ml;
    @Column private Double ai;
    @Column private Double imageProcessing;
    @Column private Double qaTesting;
    @Column private Double signalAndSystem;
    @Column private Double analogElectronics;
    @Column private Double embededSystem;
    @Column private Double softwareArchitecture;
    @Column private Double dataBase;
    @Column private Double digitalLogicDesign;
    @Column private Double informationSecurity;
    @Column private Double devops;
    @Column private Double operatingSystemAndNetworking;
    @Column private Double controlSystem;
    @Column private Double digitalSystemDesignWithHdl;
    @Column private Double computerNetwork;
    @Column private Double gui;

    // ML Specialization Prediction Result
    @Column private String primarySpecialization;
    @Column private String primarySpecializationLabel;
    @Column private Double primaryConfidence;

    @Column private String secondarySpecialization;
    @Column private String secondarySpecializationLabel;
    @Column private Double secondaryConfidence;

    @Column(columnDefinition = "TEXT")
    private String predictionDetailsJson;

    @Column
    private Long updatedAt;
}
