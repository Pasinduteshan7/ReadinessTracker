package com.example.readinesstrackerbackend.repository;

import com.example.readinesstrackerbackend.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Find by unique job ID
    Optional<Job> findByJobId(String jobId);

    // Find jobs by title (for top demanded jobs)
    @Query("SELECT j.jobTitle, COUNT(j) as count, AVG(j.salaryMin) as avgSalaryMin, " +
            "AVG(j.salaryMax) as avgSalaryMax FROM Job j GROUP BY j.jobTitle ORDER BY count DESC")
    List<Object[]> findTopDemandedJobTitles(Pageable pageable);

    // Find jobs by company
    List<Job> findByCompanyContainingIgnoreCase(String company);

    // Find jobs by location
    List<Job> findByLocationContainingIgnoreCase(String location);

    // Find jobs by job type
    List<Job> findByJobType(String jobType);

    // Find jobs by experience level
    List<Job> findByExperienceLevel(String experienceLevel);

    // Find jobs with salary data
    @Query("SELECT j FROM Job j WHERE j.salaryMin IS NOT NULL OR j.salaryMax IS NOT NULL")
    List<Job> findJobsWithSalaryData();

    // Find jobs by skill
    @Query("SELECT j FROM Job j WHERE j.detectedSkills LIKE CONCAT('%', :skill, '%')")
    List<Job> findJobsBySkill(@Param("skill") String skill);

    // Get salary statistics
    @Query("SELECT AVG(j.salaryMin) as avgMin, AVG(j.salaryMax) as avgMax, " +
            "MIN(j.salaryMin) as minSalary, MAX(j.salaryMax) as maxSalary FROM Job j")
    Object getSalaryStatistics();

    // Find distinct skills (for skill demand analysis)
    @Query(value = "SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(detected_skills, ',', numbers.n), ',', -1)) " +
            "as skill FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers, "
            +
            "jobs_data WHERE CHAR_LENGTH(detected_skills)-CHAR_LENGTH(REPLACE(detected_skills, ',', ''))+1 >= numbers.n", nativeQuery = true)
    List<String> findDistinctSkills();

    // Count total jobs analyzed
    @Query("SELECT COUNT(j) FROM Job j")
    Long countTotalJobs();

    // Count jobs with skills data
    @Query("SELECT COUNT(j) FROM Job j WHERE j.detectedSkills IS NOT NULL AND j.detectedSkills != ''")
    Long countJobsWithSkills();

    // Get all skills distribution
    @Query(value = "SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(detected_skills, ',', numbers.n), ',', -1)) as skill, "
            +
            "COUNT(*) as count FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers, "
            +
            "jobs_data WHERE CHAR_LENGTH(detected_skills)-CHAR_LENGTH(REPLACE(detected_skills, ',', ''))+1 >= numbers.n "
            +
            "GROUP BY skill ORDER BY count DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> getSkillDemand(@Param("limit") int limit);
}
