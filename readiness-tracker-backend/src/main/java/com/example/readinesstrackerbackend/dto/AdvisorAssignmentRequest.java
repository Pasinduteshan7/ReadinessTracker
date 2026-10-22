package com.example.readinesstrackerbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdvisorAssignmentRequest {
    private Long advisorId;
    private List<Long> studentIds;
}
