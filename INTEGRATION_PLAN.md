# Integration Plan: Job Scraper with ReadinessTracker

## Architecture Decision: Microservices with Shared Database

```
React Frontend (port 5174)
    ↓
Spring Boot Backend (port 8080)
    ├─→ StudentDashboard endpoints
    ├─→ New: Job Demand API endpoints
    └─→ MySQL Database (shared with Python)
        ↑
Python Job Scraper (port 5000)
    ├─→ collect_public_api_jobs()
    ├─→ store_in_mysql()
    └─→ Rest API (optional, for direct access)
```

## Integration Steps

### Phase 1: Python Layer - Add MySQL Support

**Files to Modify:**

- `job_scraper.py` - Add MySQL storage alongside CSV
- `config.json` - Add database credentials

**New Dependency:**

```
python-mysql-connector
```

**Change:**

```python
# Instead of CSV-only
jobs_data.to_csv('jobs_data.csv')

# Add MySQL persistence
store_jobs_in_mysql(jobs_data, mysql_config)
```

### Phase 2: Spring Boot Layer - Add Job Data Endpoints

**New Entities:**

- `Job.java` (JPA entity for jobs_data table)
- `Skill.java` (JPA entity for skills table)

**New Controllers:**

- `JobDemandController.java` - Endpoints for Industry Demand tab

**Endpoints to Create:**

```
GET /api/job-demand/top-demanded-jobs
GET /api/job-demand/job-salaries
GET /api/job-demand/top-languages
GET /api/job-demand/skills
GET /api/job-demand/summary
```

### Phase 3: React Layer - Consume Job Data

**Components to Modify/Create:**

- `StudentDashboard.tsx` - Add "Industry Demand" tab integration
- `JobDemandPanel.tsx` - New component to display job data

**Implementation:**

```typescript
// Call Spring Boot endpoints instead of Python
const response = await backend.get("/api/job-demand/top-demanded-jobs");
```

## Database Schema

### jobs_data Table

```sql
CREATE TABLE jobs_data (
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
```

### skills_demand Table

```sql
CREATE TABLE skills_demand (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  skill_name VARCHAR(255) UNIQUE,
  count INT,
  percentage DECIMAL(5,2),
  category VARCHAR(100),
  last_updated TIMESTAMP,
  INDEX idx_skill_name (skill_name),
  INDEX idx_count (count DESC)
);
```

## Benefits of This Approach

✅ **Separation of Concerns**: Python handles collection, Spring Boot handles serving
✅ **Single Source of Truth**: All data in MySQL, accessible by multiple services
✅ **Frontend Simplification**: React only calls Spring Boot API (one endpoint)
✅ **Scalability**: Can add more data sources or Python jobs without changing backend API
✅ **Scheduling**: Python job can run on cron/scheduler, Spring Boot always serves fresh data
✅ **Consistency**: Schema validation at database level

## Next Steps

1. Create MySQL schema in Spring Boot migrations
2. Modify Python scraper to connect to MySQL
3. Add Spring Boot Job/JobDemand entities and repositories
4. Create REST endpoints in JobDemandController
5. Update React StudentDashboard to call new endpoints
6. Test full integration end-to-end
