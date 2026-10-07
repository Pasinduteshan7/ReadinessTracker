package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.dto.IndustryDemandResult;
import com.example.readinesstrackerbackend.service.IndustryDemandService;
import com.example.readinesstrackerbackend.util.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/industry-demand")
public class IndustryDemandController {

    private final IndustryDemandService industryDemandService;
    private final JwtTokenProvider jwtTokenProvider;

    public IndustryDemandController(IndustryDemandService industryDemandService,
                                    JwtTokenProvider jwtTokenProvider) {
        this.industryDemandService = industryDemandService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<IndustryDemandResult> calculateMatch(
            @PathVariable Long studentId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")
                || !jwtTokenProvider.validateToken(authorizationHeader.substring(7).trim())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(industryDemandService.calculateMatch(studentId));
    }
}