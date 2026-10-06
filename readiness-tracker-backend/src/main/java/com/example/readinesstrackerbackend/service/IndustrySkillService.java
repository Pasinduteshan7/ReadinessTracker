package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.IndustrySkill;
import com.example.readinesstrackerbackend.repository.IndustrySkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class IndustrySkillService {

    private static final Logger log = LoggerFactory.getLogger(IndustrySkillService.class);

    @Autowired
    private IndustrySkillRepository industrySkillRepository;

    /**
     * Upsert logic: updates existing records by skillName (case-insensitive) or inserts new ones.
     *
     * @param skills list of skills to save/update
     * @return saved skills
     */
    @Transactional
    public List<IndustrySkill> saveAll(List<IndustrySkill> skills) {
        if (skills == null || skills.isEmpty()) {
            return Collections.emptyList();
        }

        List<IndustrySkill> savedList = new ArrayList<>();

        for (IndustrySkill incoming : skills) {
            if (incoming == null || incoming.getSkillName() == null || incoming.getSkillName().isBlank()) {
                continue;
            }

            String normalizedName = incoming.getSkillName().trim();
            Optional<IndustrySkill> existingOpt = industrySkillRepository.findBySkillNameIgnoreCase(normalizedName);

            IndustrySkill skillToSave;
            if (existingOpt.isPresent()) {
                skillToSave = existingOpt.get();
                skillToSave.setCategory(incoming.getCategory());
                skillToSave.setFrequencyCount(incoming.getFrequencyCount());
                skillToSave.setWeight(incoming.getWeight());
            } else {
                skillToSave = incoming;
                skillToSave.setId(null);
                skillToSave.setSkillName(normalizedName);
            }

            skillToSave.setLastUpdated(LocalDateTime.now());
            savedList.add(industrySkillRepository.saveAndFlush(skillToSave));
        }

        log.info("Successfully upserted {} industry skills", savedList.size());
        return savedList;
    }

    /**
     * Retrieves all industry skills ordered by weight descending.
     *
     * @return all skills ordered by weight desc
     */
    public List<IndustrySkill> getAllSkills() {
        return industrySkillRepository.findAllByOrderByWeightDesc();
    }

    /**
     * Retrieves top N industry skills by weight descending.
     *
     * @param n number of top skills to return
     * @return top N skills
     */
    public List<IndustrySkill> getTopSkills(int n) {
        if (n <= 0) {
            return Collections.emptyList();
        }
        return industrySkillRepository.findAllByOrderByWeightDesc()
                .stream()
                .limit(n)
                .toList();
    }
}
