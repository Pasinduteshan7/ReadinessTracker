# Integration Quick Reference

## Project Structure After Integration

```
ReadinessTracker/
├── readiness-tracker-backend/
│   ├── src/main/java/com/example/readinesstrackerbackend/
│   │   ├── entity/
│   │   │   ├── Job.java                    [NEW]
│   │   │   └── SkillDemand.java            [NEW]
│   │   ├── repository/
│   │   │   └── JobRepository.java          [NEW]
│   │   ├── service/
│   │   │   └── JobDemandService.java       [NEW]
│   │   └── controller/
│   │       └── JobDemandController.java    [NEW]
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   └── V6__create_jobs_table.sql   [NEW]
│   │   └── application.properties          [MODIFY - DB config]
│   └── build.gradle                        [MODIFY - dependencies]
│
├── project/
│   └── src/pages/
│       └── StudentDashboard.tsx            [MODIFY - add Industry Demand tab]
│
└── ReadinessTracker-pasan/  (Your current Python project)
    ├── job_demand_module.py                [NEW - Use this!]
    ├── job_scraper (1).py                  [EXISTING]
    ├── skill_extractor.py                  [EXISTING]
    ├── api.py                              [EXISTING - optional]
    └── requirements.txt                    [UPDATE - add mysql-connector-python]
```

## 3-Step Quick Start

### Step 1: Python Setup (5 minutes)

```bash
# 1. Install MySQL connector
pip install mysql-connector-python

# 2. Verify Spring Boot MySQL credentials
# Find them in: readiness-tracker-backend/src/main/resources/application.properties
# Example values:
# spring.datasource.url=jdbc:mysql://localhost:3306/readiness_tracker
# spring.datasource.username=root
# spring.datasource.password=20001890

# 3. Run the Python module
python job_demand_module.py
# This will auto-detect Spring Boot config and populate MySQL
```

### Step 2: Spring Boot Setup (10 minutes)

```bash
# 1. Copy 4 Java files to your backend:
# - Job.java → src/main/java/.../entity/
# - JobRepository.java → src/main/java/.../repository/
# - JobDemandService.java → src/main/java/.../service/
# - JobDemandController.java → src/main/java/.../controller/

# 2. Apply database migration (one of these):
# Option A: Copy V6__create_jobs_table.sql to src/main/resources/db/migration/
# Option B: Set spring.jpa.hibernate.ddl-auto=update in application.properties

# 3. Run backend
cd readiness-tracker-backend
gradle bootRun
```

### Step 3: React Frontend Setup (10 minutes)

**Update StudentDashboard.tsx with Industry Demand tab:**

```typescript
// Add state for job data
const [jobDemand, setJobDemand] = useState(null);

// Add fetch function
const fetchJobDemandData = async () => {
  const response = await backend.get("/api/job-demand/top-demanded-jobs");
  setJobDemand(response.data);
};

// Add new tab section (see INTEGRATION_GUIDE.md for full code)
// Renders top 5 jobs + languages + salary data
```

## API Endpoints Reference

| Endpoint                                                  | Method | Purpose                                     | Example Response                                                |
| --------------------------------------------------------- | ------ | ------------------------------------------- | --------------------------------------------------------------- |
| `/api/job-demand/top-demanded-jobs?limit=5`               | GET    | Top 5 job titles with count, salary, skills | `{total_jobs_analyzed: 18, top_5_demanded_jobs: [...]}`         |
| `/api/job-demand/job-salaries?limit=5`                    | GET    | Salary breakdown by job title               | `{salary_breakdown: [{"jobTitle": "...", "avgSalary": 65000}]}` |
| `/api/job-demand/top-languages?topJobs=5&topLanguages=10` | GET    | Top 10 programming languages                | `{jobsAnalyzed: 5, top10Languages: [...]}`                      |
| `/api/job-demand/top-skills?limit=15`                     | GET    | Overall top skills across all jobs          | `{top_15_skills: [{"skill": "Python", "count": 8}]}`            |
| `/api/job-demand/summary`                                 | GET    | Dashboard summary card                      | `{totalJobsAnalyzed: 18, uniqueCompanies: 5, ...}`              |
| `/api/job-demand/refresh`                                 | POST   | Trigger Python job collection               | `{status: "Collection triggered"}`                              |
| `/api/job-demand/health`                                  | GET    | Health check                                | `{status: "UP"}`                                                |

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
│              StudentDashboard (5174)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Industry Demand Tab                                 │   │
│  │  ├─ Top 5 Demanded Jobs                             │   │
│  │  ├─ Top 10 Programming Languages                    │   │
│  │  └─ Salary Breakdown by Job                         │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP Requests
               │
┌──────────────▼──────────────────────────────────────────────┐
│           Spring Boot Backend (8080)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  JobDemandController                                │   │
│  │  ├─ @GetMapping("/top-demanded-jobs")              │   │
│  │  ├─ @GetMapping("/job-salaries")                   │   │
│  │  ├─ @GetMapping("/top-languages")                  │   │
│  │  └─ @GetMapping("/summary")                        │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                            │
│  ┌──────────────▼──────────────────────────────────────┐   │
│  │  JobDemandService                                   │   │
│  │  ├─ getTopDemandedJobs()                            │   │
│  │  ├─ getJobSalaryBreakdown()                         │   │
│  │  ├─ getTopProgrammingLanguages()                    │   │
│  │  └─ getJobDemandSummary()                           │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                            │
│  ┌──────────────▼──────────────────────────────────────┐   │
│  │  JobRepository (JPA Queries)                        │   │
│  └──────────────┬──────────────────────────────────────┘   │
└──────────────┬─────────────────────────────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼─────────────────────────────────────────────┐
│         MySQL Database (3306)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  jobs_data (18+ records)                             │ │
│  │  ├─ job_id, company, job_title, location            │ │
│  │  ├─ job_type, experience_level, salary_range        │ │
│  │  ├─ detected_skills, skill_categories               │ │
│  │  └─ scraped_date, created_at, updated_at            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  skills_demand (aggregated skill counts)            │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↑
         │ Populates (every 6 hours)
         │
┌─────────┴────────────────────────────────────────────────┐
│    Python Job Scraper (Local or Server)                  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ job_demand_module.py                              │ │
│  │ ├─ collect_jobs_from_apis()                       │ │
│  │ │  (Remotive, RemoteOK, Arbeitnow)               │ │
│  │ ├─ enrich_jobs_with_skills()                      │ │
│  │ │  (spaCy skill extraction)                       │ │
│  │ └─ save_to_database()                             │ │
│  │    (MySQL INSERT)                                 │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Database Schema

### jobs_data Table

```
id              BIGINT PRIMARY KEY AUTO_INCREMENT
job_id          VARCHAR(255) UNIQUE
company         VARCHAR(255)
job_title       VARCHAR(255)
location        VARCHAR(255)
job_type        VARCHAR(50)              -- Remote, Hybrid, Onsite
experience_level VARCHAR(50)             -- Junior, Mid, Senior
salary_range    VARCHAR(255)             -- e.g., "$50k - $70k"
salary_min      INT
salary_max      INT
detected_skills LONGTEXT                 -- Comma-separated
skills_count    INT
skill_categories VARCHAR(1000)           -- Backend, Frontend, Cloud
scraped_date    TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()

INDEXES:
- idx_job_title (job_title)
- idx_salary (salary_min, salary_max)
- idx_scraped_date (scraped_date)
```

## Python to Spring Boot Integration Points

### 1. MySQL Configuration

**Source**: Spring Boot `application.properties`

```
spring.datasource.url=jdbc:mysql://localhost:3306/readiness_tracker
spring.datasource.username=root
spring.datasource.password=20001890
```

**Python Usage**:

```python
config = get_mysql_config_from_springboot()
collector = JobDemandCollector(mysql_config=config)
```

### 2. Data Flow

**Python**: Populates `jobs_data` table
**Spring Boot**: Reads from `jobs_data`, provides API
**React**: Calls Spring Boot API

### 3. Skill Categories (Sync Both)

Ensure Python `skill_extractor.py` and Spring Boot `PROGRAMMING_LANGUAGES` set match:

```python
# Python
LANGUAGES = {"Python", "Java", "JavaScript", ...}

# Spring Boot
private static final Set<String> PROGRAMMING_LANGUAGES = Set.of(
    "Python", "Java", "JavaScript", ...
);
```

## Common Issues & Fixes

| Issue                                  | Cause                  | Fix                                       |
| -------------------------------------- | ---------------------- | ----------------------------------------- |
| `ModuleNotFoundError: mysql.connector` | Package not installed  | `pip install mysql-connector-python`      |
| MySQL connection refused               | Database not running   | Start MySQL: `mysql.server start`         |
| CORS error from React                  | Origin not whitelisted | Update `@CrossOrigin(origins="...")`      |
| No skills detected                     | spaCy model missing    | `python -m spacy download en_core_web_sm` |
| Jobs not appearing in API              | Data not in MySQL      | Run: `python job_demand_module.py`        |
| "Table doesn't exist"                  | Schema not created     | Apply migration or enable auto-schema     |

## Testing Commands

```bash
# 1. Verify Python can collect jobs
python job_demand_module.py

# 2. Check MySQL has data
mysql -u root -p readiness_tracker
mysql> SELECT COUNT(*) FROM jobs_data;
mysql> SELECT job_title, COUNT(*) as count FROM jobs_data GROUP BY job_title ORDER BY count DESC LIMIT 5;

# 3. Test Spring Boot endpoints
curl http://localhost:8080/api/job-demand/health
curl http://localhost:8080/api/job-demand/summary
curl http://localhost:8080/api/job-demand/top-demanded-jobs

# 4. Test from React
fetch('http://localhost:8080/api/job-demand/top-demanded-jobs')
  .then(r => r.json())
  .then(d => console.log(d))
```

## Deployment Checklist

- [ ] MySQL database created with schema
- [ ] Python job_demand_module.py created and tested
- [ ] Spring Boot entities, repositories, controllers added
- [ ] CORS configuration updated for production URL
- [ ] Job data collected and populated in MySQL
- [ ] API endpoints tested with curl
- [ ] React StudentDashboard updated with Industry Demand tab
- [ ] Scheduled job collection set up (cron or Spring @Scheduled)
- [ ] Frontend tested with live data
- [ ] Error handling and logging verified

---

**Start here**: See `INTEGRATION_GUIDE.md` for detailed step-by-step instructions.
