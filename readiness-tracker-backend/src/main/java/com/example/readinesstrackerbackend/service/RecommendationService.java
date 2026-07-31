package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.RepositoryAnalysis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    
    /**
     * Generate recommendations based on project scope and score breakdown
     */
    public List<String> generateRecommendations(
            RepositoryAnalysis.ProjectScope scope, 
            Map<String, Object> breakdown) {
        
        List<String> recommendations = new ArrayList<>();
        
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> categories = 
            (Map<String, Map<String, Object>>) breakdown.get("categories");
        
        // Get weak areas
        List<String> weakAreas = identifyWeakAreas(categories);
        
        // Generate scope-specific recommendations
        switch (scope) {
            case DEVOPS:
                recommendations.addAll(generateDevOpsRecommendations(weakAreas, categories));
                break;
            case ML_AI:
                recommendations.addAll(generateMLRecommendations(weakAreas, categories));
                break;
            case SOFTWARE_ENGINEERING:
                recommendations.addAll(generateSERecommendations(weakAreas, categories));
                break;
            case CYBERSECURITY:
                recommendations.addAll(generateSecurityRecommendations(weakAreas, categories));
                break;
            case COMMUNICATION:
                recommendations.addAll(generateCommunicationRecommendations(weakAreas, categories));
                break;
        }
        
        return recommendations;
    }
    
    private List<String> identifyWeakAreas(Map<String, Map<String, Object>> categories) {
        List<String> weakAreas = new ArrayList<>();
        
        for (Map.Entry<String, Map<String, Object>> entry : categories.entrySet()) {
            Double score = (Double) entry.getValue().get("score");
            if (score != null && score < 75) {
                weakAreas.add(entry.getKey());
            }
        }
        
        return weakAreas;
    }
    
    private List<String> generateDevOpsRecommendations(
            List<String> weakAreas, 
            Map<String, Map<String, Object>> categories) {
        
        List<String> recommendations = new ArrayList<>();
        
        if (weakAreas.contains("efficiency")) {
            recommendations.add("Optimize deployment pipeline efficiency - consider using Docker multi-stage builds");
            recommendations.add("Implement infrastructure as code (IaC) best practices for faster provisioning");
            recommendations.add("Profile your CI/CD pipeline to identify bottlenecks");
        }
        
        if (weakAreas.contains("architecture")) {
            recommendations.add("Improve microservices architecture - decouple components");
            recommendations.add("Implement proper load balancing and scalability patterns");
            recommendations.add("Document system architecture diagrams (C4 model)");
        }
        
        if (weakAreas.contains("security")) {
            recommendations.add("Implement secret management (e.g., HashiCorp Vault)");
            recommendations.add("Enable container scanning in your CI/CD pipeline");
            recommendations.add("Enforce RBAC and least privilege principles");
        }
        
        if (weakAreas.contains("correctness")) {
            recommendations.add("Add infrastructure validation tests");
            recommendations.add("Implement health checks and monitoring");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your DevOps implementation is strong! Continue monitoring best practices");
        }
        
        return recommendations;
    }
    
    private List<String> generateMLRecommendations(
            List<String> weakAreas, 
            Map<String, Map<String, Object>> categories) {
        
        List<String> recommendations = new ArrayList<>();
        
        if (weakAreas.contains("correctness")) {
            recommendations.add("Improve model validation with cross-validation techniques");
            recommendations.add("Add data quality checks and preprocessing validation");
            recommendations.add("Document data assumptions and model limitations");
        }
        
        if (weakAreas.contains("architecture")) {
            recommendations.add("Implement proper ML pipeline architecture (data → preprocessing → model → evaluation)");
            recommendations.add("Use experiment tracking tools (MLflow, Weights & Biases)");
            recommendations.add("Implement reproducibility with fixed random seeds and versioning");
        }
        
        if (weakAreas.contains("security")) {
            recommendations.add("Implement data privacy measures (encryption, PII masking)");
            recommendations.add("Add model poisoning detection mechanisms");
            recommendations.add("Document data lineage and access controls");
        }
        
        if (weakAreas.contains("efficiency")) {
            recommendations.add("Optimize model inference time with quantization or pruning");
            recommendations.add("Implement batching for efficient inference");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your ML implementation is excellent! Focus on production deployment best practices");
        }
        
        return recommendations;
    }
    
    private List<String> generateSERecommendations(
            List<String> weakAreas, 
            Map<String, Map<String, Object>> categories) {
        
        List<String> recommendations = new ArrayList<>();
        
        if (weakAreas.contains("correctness")) {
            recommendations.add("Increase test coverage to at least 80%");
            recommendations.add("Add edge case and integration tests");
            recommendations.add("Implement continuous integration checks");
        }
        
        if (weakAreas.contains("architecture")) {
            recommendations.add("Refactor code to follow SOLID principles");
            recommendations.add("Document architecture decisions (ADRs)");
            recommendations.add("Use design patterns appropriately");
        }
        
        if (weakAreas.contains("security")) {
            recommendations.add("Add input validation and sanitization");
            recommendations.add("Implement proper authentication and authorization");
            recommendations.add("Conduct security code review");
        }
        
        if (weakAreas.contains("efficiency")) {
            recommendations.add("Profile code for performance bottlenecks");
            recommendations.add("Optimize database queries");
            recommendations.add("Implement caching strategies");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your software engineering practices are solid! Maintain code quality standards");
        }
        
        return recommendations;
    }
    
    private List<String> generateSecurityRecommendations(
            List<String> weakAreas, 
            Map<String, Map<String, Object>> categories) {
        
        List<String> recommendations = new ArrayList<>();
        
        if (weakAreas.contains("security")) {
            recommendations.add("CRITICAL: Conduct comprehensive security audit");
            recommendations.add("Implement vulnerability scanning in CI/CD pipeline (SAST/DAST)");
            recommendations.add("Establish incident response procedures");
            recommendations.add("Regular penetration testing required");
        }
        
        if (weakAreas.contains("correctness")) {
            recommendations.add("Implement security logging and monitoring");
            recommendations.add("Add security test cases for threat scenarios");
        }
        
        if (weakAreas.contains("architecture")) {
            recommendations.add("Implement defense-in-depth strategy");
            recommendations.add("Use security by design principles");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your security posture is strong. Maintain regular security audits and training");
        }
        
        return recommendations;
    }
    
    private List<String> generateCommunicationRecommendations(
            List<String> weakAreas, 
            Map<String, Map<String, Object>> categories) {
        
        List<String> recommendations = new ArrayList<>();
        
        if (weakAreas.contains("efficiency")) {
            recommendations.add("Improve documentation clarity - add quick start guides");
            recommendations.add("Create summary documents for key concepts");
            recommendations.add("Add visual diagrams and flowcharts");
        }
        
        if (weakAreas.contains("correctness")) {
            recommendations.add("Verify accuracy of all documented information");
            recommendations.add("Add examples and use cases");
            recommendations.add("Keep documentation synchronized with code");
        }
        
        if (weakAreas.contains("architecture")) {
            recommendations.add("Improve document structure and organization");
            recommendations.add("Add table of contents and cross-references");
            recommendations.add("Group related topics logically");
        }
        
        if (weakAreas.contains("security")) {
            recommendations.add("Document security practices and guidelines");
            recommendations.add("Add responsible disclosure policy");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your documentation is excellent! Maintain and update regularly");
        }
        
        return recommendations;
    }
}
