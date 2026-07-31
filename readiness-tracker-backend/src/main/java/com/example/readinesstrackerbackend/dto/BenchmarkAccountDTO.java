package com.example.readinesstrackerbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkAccountDTO {
    private String fullName;
    private String githubUsername;
    private Integer graduationYear;
    private String outcomeLabel; // HIRED_TOP_COMPANY, HIRED_GOOD_COMPANY, HIRED_AVERAGE, FREELANCE_SELF_EMPLOYED
    private String companyRole;  // optional
    private Boolean consentConfirmed;
    private String personalGithubToken;
}
