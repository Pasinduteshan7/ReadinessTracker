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
@Table(name = "final_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinalScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Double githubScore;
    private Double repoQualityScore;
    private Double algorithmScore;
    private Double aiPenalty;
    private Double finalScore;

    private Double repoQuality7b;
    private Double repoQuality3b;
    private Double documentation;
    private Double security;
    private Double maintainability;
    @Column(name = "`rank`")
    private Integer rank;
    private Double percentile;
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String scoreBreakdown;
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(SqlTypes.JSON)
    private String dualModelBreakdown;
    private LocalDateTime calculatedAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
