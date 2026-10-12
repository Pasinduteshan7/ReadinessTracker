import os

base_dir = 'd:/PROJECTS/PERSONAL/group/EMPLOYABILITY READINESS TRACKER/Readiness tracker/readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/entity'

# Update AnalysisJob.java
path_analysis = os.path.join(base_dir, 'AnalysisJob.java')
with open(path_analysis, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import jakarta.persistence.OneToMany;' not in content:
    content = content.replace('import jakarta.persistence.ManyToOne;', 'import jakarta.persistence.ManyToOne;\nimport jakarta.persistence.OneToMany;\nimport jakarta.persistence.CascadeType;')
if 'import java.util.List;' not in content:
    content = content.replace('import java.time.LocalDateTime;', 'import java.time.LocalDateTime;\nimport java.util.List;\nimport java.util.ArrayList;')

new_fields = """    private Integer analyzedRepos;

    @Column(nullable = true)
    private String employabilityTier;
    
    @Column(nullable = true)
    private Double professionalReadiness;
    
    @Column(nullable = true)
    private Double growthPotential;
    
    @Column(nullable = true)
    private String recommendedLevel;
    
    @Column(nullable = true)
    private Integer totalStars;
    
    @Column(nullable = true)
    private Integer totalForks;
    
    @Column(nullable = true)
    private Integer tier1Count;
    
    @Column(nullable = true)
    private Integer tier2Count;
    
    @Column(nullable = true)
    private Integer tier3Count;
    
    @Column(nullable = true)
    private Double averageLanguagesCount;
    
    @OneToMany(mappedBy = "analysisJob", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepositoryAnalysis> repositories = new ArrayList<>();"""

content = content.replace('    private Integer analyzedRepos;', new_fields)

with open(path_analysis, 'w', encoding='utf-8') as f:
    f.write(content)


# Update RepositoryAnalysis.java
path_repo = os.path.join(base_dir, 'RepositoryAnalysis.java')
with open(path_repo, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace analysisId with analysisJob relation
content = content.replace(
    '    @Column(unique = true, nullable = false)\n    private String analysisId;',
    '    @ManyToOne\n    @JoinColumn(name = "analysis_job_id", nullable = false)\n    private AnalysisJob analysisJob;'
)

# Replace fields to match exact requirements
fields_replacement = """    @Column
    private String githubUrl;
    
    @Column
    private String repositoryName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column
    private Integer stars;
    
    @Column
    private Integer forks;
    
    @Column
    private String languages;
    
    @Column
    private String tier;
    
    @Column
    private Double overallScore;
    
    @Column
    private Double codeQualityScore;
    
    @Column
    private Double architectureScore;
    
    @Column
    private Double documentationScore;
    
    @Column
    private Double testingScore;
    
    @Column
    private Double bestPracticesScore;
    
    @Column(columnDefinition = "TEXT")
    private String qwenAnalysis;"""

# Identify the old block from githubUrl to recommendationsJson and replace it
import re
pattern = re.compile(r'    @Column\s+private String githubUrl;.*?private String recommendationsJson; // JSON array of recommendations', re.DOTALL)
content = re.sub(pattern, fields_replacement, content)

with open(path_repo, 'w', encoding='utf-8') as f:
    f.write(content)

print('Entities updated successfully')
