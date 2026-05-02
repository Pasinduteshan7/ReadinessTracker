package com.example.readinesstrackerbackend.service;

import com.example.readinesstrackerbackend.entity.Job;
import com.example.readinesstrackerbackend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobDemandService {

    @Autowired
    private JobRepository jobRepository;

    // Languages to filter for top languages endpoint
    private static final Set<String> PROGRAMMING_LANGUAGES = Set.of(
            "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
            "PHP", "Ruby", "Kotlin", "Swift", "Scala", "R", "Perl", "Lua", "Dart",
            "Bash", "Shell", "SQL", "MATLAB", "Objective-C");

    /**
     * Get top N most demanded job titles
     */
    public List<Map<String, Object>> getTopDemandedJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Job> topJobs = jobRepository.findAll().stream()
                .collect(Collectors.groupingBy(Job::getJobTitle, Collectors.toList()))
                .entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .limit(limit)
                .collect(Collectors.toList())
                .stream()
                .map(e -> {
                    List<Job> jobsForTitle = e.getValue();
                    Map<String, Object> result = new HashMap<>();
                    result.put("jobTitle", e.getKey());
                    result.put("count", jobsForTitle.size());
                    result.put("avgSalary", jobsForTitle.stream()
                            .filter(j -> j.getSalaryMin() != null)
                            .mapToInt(Job::getSalaryMin)
                            .average()
                            .orElse(0));

                    // Get top skills for this job title
                    List<String> topSkills = jobsForTitle.stream()
                            .flatMap(j -> {
                                if (j.getDetectedSkills() != null && !j.getDetectedSkills().isEmpty()) {
                                    return Arrays.stream(j.getSkillsArray())
                                            .map(String::trim)
                                            .filter(s -> !s.isEmpty());
                                }
                                return java.util.stream.Stream.empty();
                            })
                            .collect(Collectors.groupingBy(e2 -> e2, Collectors.counting()))
                            .entrySet().stream()
                            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                            .limit(10)
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());

                    result.put("topSkills", topSkills);
                    return result;
                })
                .collect(Collectors.toList());

        return topJobs;
    }

    /**
     * Get salary breakdown for top jobs
     */
    public List<Map<String, Object>> getJobSalaryBreakdown(int limit) {
        return jobRepository.findAll().stream()
                .collect(Collectors.groupingBy(Job::getJobTitle, Collectors.toList()))
                .entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .limit(limit)
                .map(e -> {
                    List<Job> jobsForTitle = e.getValue();
                    Map<String, Object> result = new HashMap<>();
                    result.put("jobTitle", e.getKey());
                    result.put("count", jobsForTitle.size());

                    List<Job> jobsWithSalary = jobsForTitle.stream()
                            .filter(j -> j.getSalaryMin() != null || j.getSalaryMax() != null)
                            .collect(Collectors.toList());

                    if (!jobsWithSalary.isEmpty()) {
                        double avgSalary = jobsWithSalary.stream()
                                .mapToDouble(j -> {
                                    if (j.getSalaryMin() != null && j.getSalaryMax() != null) {
                                        return (j.getSalaryMin() + j.getSalaryMax()) / 2.0;
                                    }
                                    return j.getSalaryMin() != null ? j.getSalaryMin() : j.getSalaryMax();
                                })
                                .average()
                                .orElse(0);
                        result.put("avgSalary", avgSalary);
                        result.put("salaryFormatted", formatSalary(avgSalary));
                    } else {
                        result.put("avgSalary", null);
                        result.put("salaryFormatted", "Not specified");
                    }

                    result.put("salaryCount", jobsWithSalary.size());
                    return result;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get top programming languages across top demanded jobs
     */
    public Map<String, Object> getTopProgrammingLanguages(int topJobs, int topLanguages) {
        List<Job> jobs = jobRepository.findAll().stream()
                .collect(Collectors.groupingBy(Job::getJobTitle, Collectors.toList()))
                .entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .limit(topJobs)
                .flatMap(e -> e.getValue().stream())
                .collect(Collectors.toList());

        // Extract and count languages
        Map<String, Long> languageCounts = jobs.stream()
                .flatMap(j -> {
                    if (j.getDetectedSkills() != null && !j.getDetectedSkills().isEmpty()) {
                        return Arrays.stream(j.getSkillsArray())
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .filter(PROGRAMMING_LANGUAGES::contains);
                    }
                    return java.util.stream.Stream.empty();
                })
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        List<Map<String, Object>> topLanguagesList = languageCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(topLanguages)
                .map(e -> {
                    Map<String, Object> lang = new HashMap<>();
                    lang.put("skill", e.getKey());
                    lang.put("count", e.getValue());
                    lang.put("percentage", String.format("%.1f", (e.getValue() * 100.0 / jobs.size())));
                    return lang;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("jobsAnalyzed", jobs.size());
        response.put("top" + topLanguages + "Languages", topLanguagesList);

        return response;
    }

    /**
     * Get overall skill demand across all jobs
     */
    public List<Map<String, Object>> getTopSkills(int limit) {
        Map<String, Long> skillCounts = jobRepository.findAll().stream()
                .flatMap(j -> {
                    if (j.getDetectedSkills() != null && !j.getDetectedSkills().isEmpty()) {
                        return Arrays.stream(j.getSkillsArray())
                                .map(String::trim)
                                .filter(s -> !s.isEmpty());
                    }
                    return java.util.stream.Stream.empty();
                })
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        return skillCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(e -> {
                    Map<String, Object> skill = new HashMap<>();
                    skill.put("skill", e.getKey());
                    skill.put("count", e.getValue());
                    return skill;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get complete summary for dashboard
     */
    public Map<String, Object> getJobDemandSummary() {
        List<Job> allJobs = jobRepository.findAll();
        List<Job> jobsWithSkills = allJobs.stream()
                .filter(j -> j.getDetectedSkills() != null && !j.getDetectedSkills().isEmpty())
                .collect(Collectors.toList());

        // Calculate salary statistics
        List<Job> jobsWithSalary = allJobs.stream()
                .filter(j -> j.getSalaryMin() != null || j.getSalaryMax() != null)
                .collect(Collectors.toList());

        double avgSalary = 0;
        int minSalary = Integer.MAX_VALUE;
        int maxSalary = 0;

        for (Job job : jobsWithSalary) {
            if (job.getSalaryMin() != null) {
                avgSalary += job.getSalaryMin();
                minSalary = Math.min(minSalary, job.getSalaryMin());
            }
            if (job.getSalaryMax() != null) {
                maxSalary = Math.max(maxSalary, job.getSalaryMax());
            }
        }

        if (!jobsWithSalary.isEmpty()) {
            avgSalary /= jobsWithSalary.size();
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalJobsAnalyzed", allJobs.size());
        summary.put("jobsWithSkillsData", jobsWithSkills.size());
        summary.put("uniqueCompanies", allJobs.stream().map(Job::getCompany).distinct().count());
        summary.put("uniqueLocations", allJobs.stream().map(Job::getLocation).distinct().count());
        summary.put("salaryBreakdown", Map.of(
                "low", minSalary == Integer.MAX_VALUE ? 0 : minSalary,
                "average", avgSalary,
                "high", maxSalary));
        summary.put("lastUpdated", "TODO: Get last scraped date");

        return summary;
    }

    /**
     * Helper method to format salary
     */
    private String formatSalary(double salary) {
        if (salary == 0)
            return "Not specified";
        return String.format("$%,.0f", salary);
    }
}
