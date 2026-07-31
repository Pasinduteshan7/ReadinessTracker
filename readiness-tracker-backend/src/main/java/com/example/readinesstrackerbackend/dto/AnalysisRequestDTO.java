package com.example.readinesstrackerbackend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequestDTO {
    private String githubUsername;
    private Long userId;
    private String githubToken;
}
