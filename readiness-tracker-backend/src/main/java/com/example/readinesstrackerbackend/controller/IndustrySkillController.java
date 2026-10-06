package com.example.readinesstrackerbackend.controller;

import com.example.readinesstrackerbackend.entity.IndustrySkill;
import com.example.readinesstrackerbackend.service.IndustrySkillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/industry-skills")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class IndustrySkillController {

    private static final Logger log = LoggerFactory.getLogger(IndustrySkillController.class);

    @Autowired
    private IndustrySkillService industrySkillService;

    /**
     * Receives a JSON array of skills from the Python script and saves them to DB.
     * Public endpoint: does NOT require JWT authentication.
     *
     * @param skills list of skills to sync
     * @return list of saved/updated skills
     */
    @PostMapping("/sync")
    public ResponseEntity<List<IndustrySkill>> syncSkills(@RequestBody List<IndustrySkill> skills) {
        log.info("Received request to sync {} industry skills", skills != null ? skills.size() : 0);
        List<IndustrySkill> savedSkills = industrySkillService.saveAll(skills);
        return ResponseEntity.ok(savedSkills);
    }

    /**
     * Returns all skills ordered by weight descending.
     * Optionally supports limiting results with ?limit=N or ?top=N query parameter.
     *
     * @param limit optional limit for top skills
     * @param top optional top parameter as alternative
     * @return list of skills ordered by weight descending
     */
    @GetMapping
    public ResponseEntity<List<IndustrySkill>> getAllSkills(
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "top", required = false) Integer top) {
        Integer n = limit != null ? limit : top;
        if (n != null && n > 0) {
            return ResponseEntity.ok(industrySkillService.getTopSkills(n));
        }
        return ResponseEntity.ok(industrySkillService.getAllSkills());
    }

    /**
     * Returns top N skills ordered by weight descending.
     *
     * @param n number of skills to retrieve
     * @return list of top N skills
     */
    @GetMapping("/top")
    public ResponseEntity<List<IndustrySkill>> getTopSkills(
            @RequestParam(value = "n", defaultValue = "10") int n) {
        return ResponseEntity.ok(industrySkillService.getTopSkills(n));
    }
}
