package com.example.readinesstrackerbackend;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.readinesstrackerbackend.repository")
@ComponentScan(basePackages = "com.example.readinesstrackerbackend")
public class ReadinessTrackerBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReadinessTrackerBackendApplication.class, args);
    }
}

