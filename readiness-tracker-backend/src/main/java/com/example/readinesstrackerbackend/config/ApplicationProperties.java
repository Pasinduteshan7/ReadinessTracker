package com.example.readinesstrackerbackend.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;
@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class ApplicationProperties {
    private Ai ai = new Ai();
    @Data
    public static class Ai {
        private Engine engine = new Engine();
        @Data
        public static class Engine {
            private String url = "http://localhost:8000";
            private Integer timeout = 60000;
            private Integer maxRetries = 3;
        }
    }
}
