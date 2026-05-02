# ReadinessTracker Job Demand Integration Guide

## Overview

This guide shows how to connect the Python job scraper/API with your Spring Boot backend so the React frontend can display job demand data in the "Industry Demand" tab.

## Architecture

```
Python (Scraper/Module)
  └─ Collects jobs from public APIs
  └─ Enriches with skills via spaCy
  └─ Stores in MySQL database

      ↓ [Shared MySQL Database]

Spring Boot (Backend)
  └─ Reads job data from MySQL
  └─ Provides REST API endpoints
  └─ Connects to Frontend

      ↓ [HTTP API calls]

React (Frontend)
  └─ StudentDashboard
  └─ "Industry Demand" Tab
  └─ Displays job data visualization
```

## Step 1: Add MySQL Schema to Spring Boot

Create a new database migration file in `readiness-tracker-backend/src/main/resources/db/migration/`:

**File**: `V6__create_jobs_table.sql`

```sql
CREATE TABLE IF NOT EXISTS jobs_data (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_id VARCHAR(255) UNIQUE,
  company VARCHAR(255),
  job_title VARCHAR(255),
  location VARCHAR(255),
  job_type VARCHAR(50),
  experience_level VARCHAR(50),
  salary_range VARCHAR(255),
  salary_min INT,
  salary_max INT,
  detected_skills LONGTEXT,
  skills_count INT,
  skill_categories VARCHAR(1000),
  scraped_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_job_title (job_title),
  INDEX idx_salary (salary_min, salary_max),
  INDEX idx_scraped_date (scraped_date)
);

CREATE TABLE IF NOT EXISTS skills_demand (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  skill_name VARCHAR(255) UNIQUE,
  count INT,
  percentage DECIMAL(5,2),
  category VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_skill_name (skill_name),
  INDEX idx_count (count DESC)
);
```

### Alternative: Hibernate Auto-Schema (For Development)

If not using Flyway migrations, add to `application.properties`:

```properties
# Job demand tables
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

**Then create the entities** (see files below).

## Step 2: Add Entity Classes

Copy these files to `readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/entity/`:

### File 1: `Job.java`

[See Job.java file in this directory]

### File 2: `SkillDemand.java`

```java
package com.example.readinesstrackerbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "skills_demand", indexes = {
    @Index(name = "idx_skill_name", columnList = "skill_name"),
    @Index(name = "idx_count", columnList = "count DESC")
})
public class SkillDemand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 255)
    private String skillName;

    @Column
    private Integer count;

    @Column
    private Double percentage;

    @Column(length = 100)
    private String category;  // Language, Framework, Tool, etc.
}
```

## Step 3: Add Repository & Service

Copy these files:

### File 1: `JobRepository.java`

→ `readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/repository/`

[See JobRepository.java file in this directory]

### File 2: `JobDemandService.java`

→ `readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/service/`

[See JobDemandService.java file in this directory]

## Step 4: Add REST Controller

### File: `JobDemandController.java`

→ `readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/controller/`

[See JobDemandController.java file in this directory]

⚠️ **Important**: Update the `@CrossOrigin` origin to match your React frontend port:

```java
@CrossOrigin(origins = "http://localhost:5174")  // or your production URL
```

## Step 5: Update Spring Boot Dependencies

Ensure your `readiness-tracker-backend/build.gradle` has these dependencies:

```gradle
dependencies {
    // Web
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // Database
    implementation 'mysql:mysql-connector-java:8.0.33'

    // Lombok (for @Data annotation)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

## Step 6: Update Python Job Scraper for MySQL

### Option A: Use the New Module (Recommended)

Copy `job_demand_module.py` to your project root and use it:

```python
# In your Python scripts
from job_demand_module import JobDemandCollector, get_mysql_config_from_springboot

# Load config from Spring Boot
config = get_mysql_config_from_springboot()

# Create collector
collector = JobDemandCollector(mysql_config=config, csv_output=True)

# Run pipeline (collect → enrich → save to MySQL)
summary = collector.run_full_collection_pipeline()
```

### Option B: Modify Existing job_scraper.py

Add MySQL support to your existing `job_scraper.py`:

**1. Install dependency:**

```bash
pip install mysql-connector-python
```

**2. Add at top of job_scraper.py:**

```python
import mysql.connector
from mysql.connector import pooling

def store_jobs_in_mysql(df, mysql_config):
    """Store job data in MySQL database"""
    connection = mysql.connector.connect(**mysql_config)
    cursor = connection.cursor()

    for _, row in df.iterrows():
        query = """
            INSERT INTO jobs_data
            (job_id, company, job_title, location, job_type, experience_level,
             salary_range, salary_min, salary_max, detected_skills, skills_count,
             skill_categories, scraped_date)
            VALUES (%(job_id)s, %(company)s, %(job_title)s, %(location)s, %(job_type)s,
                    %(experience_level)s, %(salary_range)s, %(salary_min)s, %(salary_max)s,
                    %(detected_skills)s, %(skills_count)s, %(skill_categories)s, %(scraped_date)s)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        """
        cursor.execute(query, {
            'job_id': row.get('Job_ID'),
            'company': str(row.get('Company'))[:255],
            # ... map other fields
        })

    connection.commit()
    cursor.close()
    connection.close()
```

## Step 7: Test the Integration

### 1. Start Spring Boot Backend

```bash
cd readiness-tracker-backend
gradle bootRun
```

Verify it starts: `http://localhost:8080/api/job-demand/health`

### 2. Collect Job Data (Python)

```bash
python job_demand_module.py
# or
python job_scraper.py --auto
```

This will populate the MySQL database.

### 3. Test API Endpoints

From terminal or Postman:

```bash
# Test 1: Top demanded jobs
curl http://localhost:8080/api/job-demand/top-demanded-jobs

# Test 2: Salary breakdown
curl http://localhost:8080/api/job-demand/job-salaries

# Test 3: Top programming languages
curl http://localhost:8080/api/job-demand/top-languages

# Test 4: All top skills
curl http://localhost:8080/api/job-demand/top-skills

# Test 5: Summary
curl http://localhost:8080/api/job-demand/summary

# Test 6: Health check
curl http://localhost:8080/api/job-demand/health
```

### 4. Verify Responses

Expected response format (GET `/api/job-demand/top-demanded-jobs`):

```json
{
  "total_jobs_analyzed": 18,
  "top_5_demanded_jobs": [
    {
      "jobTitle": "Senior DevOps Engineer",
      "count": 2,
      "avgSalary": 65000,
      "topSkills": ["AWS", "Kubernetes", "Docker", "Python", "Go"]
    }
  ]
}
```

## Step 8: Connect React Frontend

Update `StudentDashboard.tsx` to call the new endpoints:

**File**: `project/src/pages/StudentDashboard.tsx`

```typescript
// Add hook to fetch job demand data
const fetchJobDemandData = async () => {
  try {
    // Fetch all endpoints in parallel
    const [jobsRes, salariesRes, languagesRes, summaryRes] = await Promise.all([
      backend.get("/api/job-demand/top-demanded-jobs"),
      backend.get("/api/job-demand/job-salaries"),
      backend.get("/api/job-demand/top-languages"),
      backend.get("/api/job-demand/summary"),
    ]);

    setJobDemand({
      topJobs: jobsRes.data.top_5_demanded_jobs,
      salaries: salariesRes.data.salary_breakdown,
      languages: languagesRes.data,
      summary: summaryRes.data,
    });
  } catch (error) {
    console.error("Failed to fetch job demand data:", error);
  }
};

// Call on tab selection
useEffect(() => {
  if (activeTab === "industry-demand") {
    fetchJobDemandData();
  }
}, [activeTab]);
```

**Add new tab in StudentDashboard:**

```typescript
{activeTab === 'industry-demand' && (
  <div className="space-y-6">
    {/* Top Demanded Jobs */}
    <div className="grid grid-cols-5 gap-4">
      {jobDemand.topJobs?.map((job, i) => (
        <div key={i} className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-purple-600">{job.jobTitle}</h3>
          <p>Demand: {job.count}</p>
          <p className="text-sm text-gray-600">Avg: ${job.avgSalary?.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-2">
            Skills: {job.topSkills?.slice(0, 3).join(', ')}
          </p>
        </div>
      ))}
    </div>

    {/* Top Languages */}
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Top Programming Languages</h2>
      <div className="grid grid-cols-5 gap-2">
        {jobDemand.languages?.top10Languages?.map((lang, i) => (
          <div key={i} className="bg-green-100 p-2 rounded text-center">
            <p className="font-semibold">{lang.skill}</p>
            <p className="text-xs text-gray-600">{lang.percentage}%</p>
          </div>
        ))}
      </div>
    </div>

    {/* Salary Breakdown */}
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Average Salary by Job</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left">Job Title</th>
            <th>Count</th>
            <th>Avg Salary</th>
          </tr>
        </thead>
        <tbody>
          {jobDemand.salaries?.map((job, i) => (
            <tr key={i} className="border-b">
              <td>{job.jobTitle}</td>
              <td className="text-center">{job.count}</td>
              <td>{job.salaryFormatted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
```

## Step 9: Set Up Scheduled Job Collection

### Option A: Python Cron Job (Every 6 hours)

**Linux/Mac**: Add to crontab:

```bash
0 */6 * * * cd /path/to/project && python job_demand_module.py
```

**Windows**: Use Task Scheduler:

```
Program: python.exe
Arguments: C:\path\to\job_demand_module.py
Schedule: Every 6 hours
```

### Option B: Spring Boot Scheduler

Add scheduled task to Spring Boot:

```java
@Component
public class JobDemandScheduler {

    @Scheduled(fixedDelay = 21600000)  // 6 hours
    public void refreshJobData() {
        // Call Python script via ProcessBuilder
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                "/path/to/job_demand_module.py"
            );
            pb.start();
            logger.info("Job collection scheduled task started");
        } catch (Exception e) {
            logger.error("Failed to trigger job collection", e);
        }
    }
}
```

## Troubleshooting

### Issue: "No module named 'mysql-connector-python'"

**Fix:**

```bash
pip install mysql-connector-python
```

### Issue: "CORS error when calling /api/job-demand endpoints from React"

**Fix in JobDemandController.java:**

```java
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:3000"})
```

### Issue: "No jobs returned from API"

**Check:**

1. Verify jobs_data table has data: `SELECT COUNT(*) FROM jobs_data;`
2. Test Python collector: `python job_demand_module.py`
3. Check Spring Boot logs for errors

### Issue: "Skills not detected"

**Check:**

1. Verify spaCy model installed: `python -m spacy download en_core_web_sm`
2. Check skill_extractor.py is in same directory
3. Verify job_description field populated in MySQL

## File Checklist

- [ ] Job.java copied to `readiness-tracker-backend/src/main/java/.../entity/`
- [ ] JobRepository.java copied to `readiness-tracker-backend/src/main/java/.../repository/`
- [ ] JobDemandService.java copied to `readiness-tracker-backend/src/main/java/.../service/`
- [ ] JobDemandController.java copied to `readiness-tracker-backend/src/main/java/.../controller/`
- [ ] MySQL migration applied or Hibernate auto-schema enabled
- [ ] Python job_demand_module.py ready in project root
- [ ] React StudentDashboard.tsx updated with job demand display
- [ ] Dependencies updated in build.gradle
- [ ] CORS configured correctly
- [ ] Job collection tested and data populated in MySQL

## Next Steps

1. ✅ Complete integration steps above
2. ✅ Test API endpoints return valid data
3. ✅ Display data in React frontend with charts/cards
4. ✅ Set up scheduled job collection
5. ✅ Deploy to production
6. Consider: ML model for trend prediction
7. Consider: Real-time updates via WebSocket

## Support

If you encounter issues:

1. Check Spring Boot logs: `gradle bootRun 2>&1 | tee logs.txt`
2. Check Python logs: `python job_demand_module.py 2>&1 | tee collection.log`
3. Verify MySQL has data: `mysql -u root -p readiness_tracker -e "SELECT COUNT(*) FROM jobs_data;"`
4. Test curl requests to confirm endpoints work before debugging React

Happy integrating! 🚀
