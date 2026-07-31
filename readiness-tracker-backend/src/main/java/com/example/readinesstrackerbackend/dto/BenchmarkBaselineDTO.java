package com.example.readinesstrackerbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkBaselineDTO {
    private Double avgCodeQuality;
    private Double avgArchitecture;
    private Double avgDocumentation;
    private Double avgTesting;
    private Double avgBestPractices;
    private Double avgOverallScore;
    private Double scoreSpread; // standard deviation
    private Long sampleSize;   // number of completed benchmark accounts
}
