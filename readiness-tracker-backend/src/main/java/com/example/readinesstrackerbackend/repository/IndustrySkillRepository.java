package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.IndustrySkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndustrySkillRepository extends JpaRepository<IndustrySkill, Long> {

    Optional<IndustrySkill> findBySkillNameIgnoreCase(String skillName);

    List<IndustrySkill> findAllByOrderByWeightDesc();
}
