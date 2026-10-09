package com.example.readinesstrackerbackend.dto;

import java.util.List;

public class IndustryDemandResult {

    private Long studentId;
    private Double industryMatchScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;

    public IndustryDemandResult() {
    }

    public IndustryDemandResult(Long studentId, Double industryMatchScore,
                                List<String> matchedSkills, List<String> missingSkills) {
        this.studentId = studentId;
        this.industryMatchScore = industryMatchScore;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Double getIndustryMatchScore() {
        return industryMatchScore;
    }

    public void setIndustryMatchScore(Double industryMatchScore) {
        this.industryMatchScore = industryMatchScore;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }
}