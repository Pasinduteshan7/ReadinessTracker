package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.Student;
import com.example.readinesstrackerbackend.entity.StudentModuleMarks;
import com.example.readinesstrackerbackend.repository.StudentModuleMarksRepository;
import com.example.readinesstrackerbackend.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleMarksService {

    private final StudentModuleMarksRepository moduleMarksRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    // Field mapping: Database field name -> ML model feature name
    public static final Map<String, String> FIELD_TO_ML_FEATURE = new LinkedHashMap<>();
    static {
        FIELD_TO_ML_FEATURE.put("softwareEngineeringPrinciple", "Software_engineering_principle");
        FIELD_TO_ML_FEATURE.put("oopConcept", "OOP_concept");
        FIELD_TO_ML_FEATURE.put("dsa", "DSA");
        FIELD_TO_ML_FEATURE.put("adsa", "ADSA");
        FIELD_TO_ML_FEATURE.put("ml", "ML");
        FIELD_TO_ML_FEATURE.put("ai", "AI");
        FIELD_TO_ML_FEATURE.put("imageProcessing", "image_processing");
        FIELD_TO_ML_FEATURE.put("qaTesting", "QA_testing");
        FIELD_TO_ML_FEATURE.put("signalAndSystem", "signal_and_system");
        FIELD_TO_ML_FEATURE.put("analogElectronics", "analog_electronics");
        FIELD_TO_ML_FEATURE.put("embededSystem", "embeded_system");
        FIELD_TO_ML_FEATURE.put("softwareArchitecture", "software_architecture");
        FIELD_TO_ML_FEATURE.put("dataBase", "data_base");
        FIELD_TO_ML_FEATURE.put("digitalLogicDesign", "digital_logic_design");
        FIELD_TO_ML_FEATURE.put("informationSecurity", "information_security");
        FIELD_TO_ML_FEATURE.put("devops", "devops");
        FIELD_TO_ML_FEATURE.put("operatingSystemAndNetworking", "operating_system_and_networking");
        FIELD_TO_ML_FEATURE.put("controlSystem", "control_system");
        FIELD_TO_ML_FEATURE.put("digitalSystemDesignWithHdl", "digital_system_design_with_HDL");
        FIELD_TO_ML_FEATURE.put("computerNetwork", "computer_network");
        FIELD_TO_ML_FEATURE.put("gui", "GUI");
    }

    public Optional<StudentModuleMarks> getMarksByStudentId(Long studentId) {
        return moduleMarksRepository.findByStudentId(studentId);
    }

    public List<StudentModuleMarks> getAllMarks() {
        return moduleMarksRepository.findAll();
    }

    @Transactional
    public StudentModuleMarks saveMarksAndPredict(Long studentId, Map<String, Object> inputMarks) {
        StudentModuleMarks record = moduleMarksRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentModuleMarks m = new StudentModuleMarks();
                    m.setStudentId(studentId);
                    return m;
                });

        // Set subject marks
        record.setSoftwareEngineeringPrinciple(toDouble(inputMarks.get("softwareEngineeringPrinciple")));
        record.setOopConcept(toDouble(inputMarks.get("oopConcept")));
        record.setDsa(toDouble(inputMarks.get("dsa")));
        record.setAdsa(toDouble(inputMarks.get("adsa")));
        record.setMl(toDouble(inputMarks.get("ml")));
        record.setAi(toDouble(inputMarks.get("ai")));
        record.setImageProcessing(toDouble(inputMarks.get("imageProcessing")));
        record.setQaTesting(toDouble(inputMarks.get("qaTesting")));
        record.setSignalAndSystem(toDouble(inputMarks.get("signalAndSystem")));
        record.setAnalogElectronics(toDouble(inputMarks.get("analogElectronics")));
        record.setEmbededSystem(toDouble(inputMarks.get("embededSystem")));
        record.setSoftwareArchitecture(toDouble(inputMarks.get("softwareArchitecture")));
        record.setDataBase(toDouble(inputMarks.get("dataBase")));
        record.setDigitalLogicDesign(toDouble(inputMarks.get("digitalLogicDesign")));
        record.setInformationSecurity(toDouble(inputMarks.get("informationSecurity")));
        record.setDevops(toDouble(inputMarks.get("devops")));
        record.setOperatingSystemAndNetworking(toDouble(inputMarks.get("operatingSystemAndNetworking")));
        record.setControlSystem(toDouble(inputMarks.get("controlSystem")));
        record.setDigitalSystemDesignWithHdl(toDouble(inputMarks.get("digitalSystemDesignWithHdl")));
        record.setComputerNetwork(toDouble(inputMarks.get("computerNetwork")));
        record.setGui(toDouble(inputMarks.get("gui")));
        record.setUpdatedAt(System.currentTimeMillis());

        // Prepare ML payload
        Map<String, Object> mlFeatures = new HashMap<>();
        for (Map.Entry<String, String> entry : FIELD_TO_ML_FEATURE.entrySet()) {
            Object val = inputMarks.get(entry.getKey());
            if (val != null && !val.toString().trim().isEmpty()) {
                try {
                    mlFeatures.put(entry.getValue(), Double.parseDouble(val.toString()));
                } catch (NumberFormatException ignored) {}
            }
        }

        // Run ML Prediction
        try {
            Map<String, Object> prediction = runMlModel(mlFeatures);
            if (prediction != null) {
                record.setPrimarySpecialization((String) prediction.get("primary"));
                record.setPrimarySpecializationLabel((String) prediction.get("primary_label"));
                record.setPrimaryConfidence(toDouble(prediction.get("primary_confidence")));

                record.setSecondarySpecialization((String) prediction.get("secondary"));
                record.setSecondarySpecializationLabel((String) prediction.get("secondary_label"));
                record.setSecondaryConfidence(toDouble(prediction.get("secondary_confidence")));

                record.setPredictionDetailsJson(objectMapper.writeValueAsString(prediction));
                log.info("Predicted specialization for student {}: {} ({}%)",
                        studentId, record.getPrimarySpecializationLabel(), record.getPrimaryConfidence());
            }
        } catch (Exception e) {
            log.error("Failed to execute ML model prediction for student {}: {}", studentId, e.getMessage(), e);
        }

        return moduleMarksRepository.save(record);
    }

    private Map<String, Object> runMlModel(Map<String, Object> mlFeatures) {
        File tempFile = null;
        try {
            tempFile = File.createTempFile("student_marks_", ".json");
            objectMapper.writeValue(tempFile, mlFeatures);

            String pythonExe = findPythonExecutable();
            String scriptPath = findPredictScript();

            log.info("Running ML prediction with Python [{}] and script [{}]", pythonExe, scriptPath);

            ProcessBuilder pb = new ProcessBuilder(pythonExe, scriptPath, "--raw", tempFile.getAbsolutePath());
            pb.redirectErrorStream(true);

            Process process = pb.start();
            StringBuilder stdout = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    stdout.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            String output = stdout.toString().trim();

            if (exitCode != 0) {
                log.error("Python ML script exited with code {}: {}", exitCode, output);
                return null;
            }

            // Parse json from stdout (find first line that looks like valid json)
            for (String line : output.split("\n")) {
                line = line.trim();
                if (line.startsWith("{") && line.endsWith("}")) {
                    return objectMapper.readValue(line, new TypeReference<Map<String, Object>>() {});
                }
            }

            log.warn("Could not find valid JSON in Python script output: {}", output);
            return null;

        } catch (Exception e) {
            log.error("Error executing Python ML predictor: {}", e.getMessage(), e);
            return null;
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private String findPythonExecutable() {
        // Priority 1: Project's .venv
        File venvPython = new File("e:/Software new/.venv/Scripts/python.exe");
        if (venvPython.exists()) return venvPython.getAbsolutePath();

        File localVenv = new File("../.venv/Scripts/python.exe");
        if (localVenv.exists()) return localVenv.getAbsolutePath();

        File cPython = new File("C:/Program Files/Python313/python.exe");
        if (cPython.exists()) return cPython.getAbsolutePath();

        return "python";
    }

    private String findPredictScript() {
        File script1 = new File("mudule-services/predict.py");
        if (script1.exists()) return script1.getAbsolutePath();

        File script2 = new File("readiness-tracker-backend/mudule-services/predict.py");
        if (script2.exists()) return script2.getAbsolutePath();

        File script3 = new File("e:/Software new/ReadinessTracker/readiness-tracker-backend/mudule-services/predict.py");
        if (script3.exists()) return script3.getAbsolutePath();

        return "predict.py";
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            String s = val.toString().trim();
            if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
            return Double.parseDouble(s);
        } catch (Exception e) {
            return null;
        }
    }
}
