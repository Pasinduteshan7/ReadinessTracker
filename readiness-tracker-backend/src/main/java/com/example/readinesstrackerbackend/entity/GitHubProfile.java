package com.example.readinesstrackerbackend.entity;
import java.time.LocalDateTime;
import com.example.readinesstrackerbackend.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.SqlTypes;
@Entity
@Table(name = "github_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GitHubProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    private Integer totalRepos;
    private Integer totalStars;
    private Integer totalForks;
    private Integer followersCount;
    private Double llmRepoQuality7b;
    private Double llmRepoQuality3b;
    private Double avgRepoQualityScore;
    private Double aiDetectionScore;
    private Double aiLikelihood;
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String aiSignals;
    @Column(columnDefinition = "TEXT")
    private String rawAnalysisData;
    private LocalDateTime analyzedAt;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
