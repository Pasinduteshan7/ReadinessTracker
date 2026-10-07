package com.example.readinesstrackerbackend;

import com.example.readinesstrackerbackend.service.PythonBridgeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class ReadinessTrackerBackendApplicationTests {

    @Autowired
    private PythonBridgeService pythonBridgeService;

    // Mocking the RestTemplate prevents actual HTTP requests from being sent during tests
    @MockitoBean(name = "restTemplate")
    private RestTemplate restTemplate;

    @MockitoBean(name = "analysisRestTemplate")
    private RestTemplate analysisRestTemplate;

    @Test
    void contextLoads() {
        // Just tests if the Spring Context boots up successfully
    }

    @Test
    void testPerformBackgroundAnalysis_Success() {
        // 1. Arrange: Mock the Python AI Engine returning a successful JSON response
        String username = "testuser";
        Map<String, Object> mockResponse = Map.of(
            "score", 95.0, 
            "status", "success",
            "tier", "Gold"
        );
        
        when(restTemplate.postForObject(anyString(), any(), eq(Map.class)))
                .thenReturn(mockResponse);

        // 2. Act: Call the service in Java
        Map<String, Object> result = pythonBridgeService.performBackgroundAnalysis(List.of(), username);

        // 3. Assert: Verify the Java backend successfully parses and returns the correct data
        assertNotNull(result, "Result should not be null");
        assertEquals("success", result.get("status"), "Status should match the mocked JSON");
        assertEquals(95.0, result.get("score"), "Score should match the mocked JSON");
    }

    @Test
    void testPerformBackgroundAnalysis_FallbackWhenPythonEngineIsDown() {
        // 1. Arrange: Simulate the Python AI Engine crashing or being offline (Connection Refused)
        String username = "testuser";
        
        when(restTemplate.postForObject(anyString(), any(), eq(Map.class)))
                .thenThrow(new RuntimeException("Connection refused: Python Engine is offline"));

        // 2. Act: Trigger analysis. It should NOT crash the Java backend.
        // If this throws an exception, the test will fail, proving the backend isn't resilient.
        Map<String, Object> result = pythonBridgeService.performBackgroundAnalysis(List.of(), username);

        // 3. Assert: Verify it returns a graceful fallback response instead of throwing a Server Error
        assertNotNull(result, "Result should not be null even on failure");
        assertTrue(result.containsKey("selected_for_deep_analysis"), "Fallback map should contain 'selected_for_deep_analysis' key");
        assertTrue(((List<?>) result.get("selected_for_deep_analysis")).isEmpty(), "Fallback list should be empty");
    }
}
