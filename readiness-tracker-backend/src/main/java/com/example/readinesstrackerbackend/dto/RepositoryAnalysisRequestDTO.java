package com.example.readinesstrackerbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryAnalysisRequestDTO {
    private String githubUrl;
    private String githubToken; // Optional, for private repos
}
