package com.example.readinesstrackerbackend.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.readinesstrackerbackend.entity.FinalScore;
@Repository
public interface FinalScoreRepository extends JpaRepository<FinalScore, Long> {
    Optional<FinalScore> findByStudentId(Long userId);
    Optional<FinalScore> findByStudent(com.example.readinesstrackerbackend.entity.Student student);
    @Query(value = "SELECT * FROM final_scores WHERE final_score IS NOT NULL ORDER BY final_score DESC", 
           nativeQuery = true)
    List<FinalScore> findLeaderboard(Pageable pageable);
}
