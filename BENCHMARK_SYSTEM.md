# Benchmark System Documentation

## Overview

The Benchmark System provides employability percentage calculation and ranking for 800 computer engineering students across 4 batches (Years 1-4). It compares student scores against professional developer benchmarks to determine employment readiness (0-100%).

## Architecture

### Components

1. **Backend (Java Spring Boot)**
   - `BenchmarkMetric` Entity: Stores professional developer metrics
   - `BenchmarkPercentile` Entity: Stores percentile thresholds for scoring
   - `BenchmarkService`: Core logic for employability calculation
   - `BenchmarkController`: REST API endpoints
   - `BenchmarkInitializer`: Loads default benchmark data on startup

2. **Python AI Engine**
   - `benchmark_calculator.py`: Employability calculation module
   - Used in the 7-layer analysis pipeline for final score computation

3. **Database (PostgreSQL)**
   - `benchmark_metrics` table: Professional developer benchmarks
   - `benchmark_percentiles` table: Percentile thresholds

## Scoring Methodology

### Percentile-Based Mapping

Students are scored relative to professional developer benchmarks:

```
Raw Score → Percentile Bracket → Employability %

90th percentile+  →  100% employability (EXCELLENT - Top 10%)
75-90th percentile →  90% employability (VERY_GOOD - Top 25%)
50-75th percentile →  70% employability (GOOD - Top 50%)
25-50th percentile →  50% employability (ADEQUATE - Top 75%)
<25th percentile   →  30% employability (NEEDS_IMPROVEMENT - Bottom 25%)
```

### Score Categories

1. **REPO_QUALITY** (Weight: 40%)
   - Code quality, documentation, maintainability
   - Thresholds: 90+: 100%, 75-90: 90%, 50-75: 70%, 25-50: 50%, <25: 30%

2. **GITHUB_METRICS** (Weight: 30%)
   - Repository stars, forks, commits, activity
   - Thresholds: 90+: 95%, 75-90: 85%, 50-75: 65%, 25-50: 45%, <25: 25%

3. **ALGORITHM_SCORE** (Weight: 20%)
   - Algorithm challenge performance
   - Thresholds: 90+: 100%, 75-90: 88%, 50-75: 68%, 25-50: 48%, <25: 28%

4. **AI_DETECTION** (Weight: -10% penalty)
   - Negative score: Low AI detection = no penalty
   - High AI detection = major penalty

### Combined Employability Formula

```
Combined Employability = 
  (REPO_QUALITY × 0.40) +
  (GITHUB_METRICS × 0.30) +
  (ALGORITHM_SCORE × 0.20) -
  (AI_DETECTION × 0.10)
```

Clamped to [0, 100]

## 4-Batch Student Analysis

### Batch Structure
- **Batch 1 (Year 1)**: 200 students
- **Batch 2 (Year 2)**: 200 students  
- **Batch 3 (Year 3)**: 200 students
- **Batch 4 (Year 4)**: 200 students
- **Total**: 800 students

### Analysis Pipeline (7 Layers)

```
Layer 1: Background Analysis
    ↓ (GitHub API filtering, repository selection)
Layer 2: GitHub Metrics Analysis
    ↓ (Stars, forks, commits, languages)
Layer 3: AI-Generated Code Detection
    ↓ (Pattern, statistical, LLM analysis)
Layer 4: Repository Quality (6-Phase LLM)
    ├─ CodeLlama 7B (Architecture)
    ├─ Qwen 3B (Correctness)
    ├─ DeepSeek-Coder 1.3B (Efficiency)
    ├─ DeepSeek-R1 1.5B (Reasoning)
    ├─ DeepSeek-Coder 6.7B (Deep Analysis) ⭐
    └─ StarCoder2 7B (Security) ⭐
    ↓ (MEDIAN aggregation of 6 LLM scores)
Layer 5: Algorithm Challenge Evaluation
    ↓ (Randomized problems, anti-cheat)
Layer 6: Neural Network Combination
    ↓ (Score integration, feature engineering)
Layer 7: Benchmark Comparison
    ↓ (EMPLOYABILITY % CALCULATION)
Final Output: 0-100% employability score
```

### Ranking System

#### Per-Batch Rankings (1-200)
- Rank 1-10: TIER_1_HIGH (90%+ employability)
- Rank 11-50: TIER_2_VERY_GOOD (75-89% employability)
- Rank 51-150: TIER_3_GOOD (60-74% employability)
- Rank 151-180: TIER_4_ADEQUATE (40-59% employability)
- Rank 181-200: TIER_5_NEEDS_IMPROVEMENT (<40% employability)

#### Cross-Batch Overall Rankings (1-800)
- Top 80 students (Rank 1-80): TIER_1_HIGH
- Next 200 students (Rank 81-280): TIER_2_VERY_GOOD
- Next 420 students (Rank 281-700): TIER_3_GOOD
- Next 80 students (Rank 701-780): TIER_4_ADEQUATE
- Bottom 20 students (Rank 781-800): TIER_5_NEEDS_IMPROVEMENT

## API Endpoints

### Benchmark Management

```
GET    /api/benchmarks/statistics          # Get overall statistics
GET    /api/benchmarks/metrics             # Get all metrics
GET    /api/benchmarks/metrics/category/{cat}  # Get metrics by category
GET    /api/benchmarks/percentiles/active  # Get active percentiles
GET    /api/benchmarks/percentiles/{cat}   # Get percentile for category
POST   /api/benchmarks/calculate-employability  # Calculate employability
POST   /api/benchmarks/metrics/create      # Create new metric
POST   /api/benchmarks/percentiles/create  # Create new percentile
PUT    /api/benchmarks/metrics/{id}        # Update metric
```

### Example Employability Calculation

**Request:**
```bash
POST /api/benchmarks/calculate-employability
?scoreCategory=OVERALL
&rawScore=72.5
```

**Response:**
```json
{
  "scoreCategory": "OVERALL",
  "rawScore": 72.5,
  "employabilityPercentage": 70.0,
  "percentileRank": 71.5,
  "percentileCategory": "GOOD (60-74%)"
}
```

## Benchmark Metrics Reference

### Repository Metrics
| Metric | 90th %ile | 75th %ile | 50th %ile | 25th %ile |
|--------|-----------|-----------|-----------|-----------|
| Stars | 200+ | 100+ | 50+ | 20+ |
| Forks | 40+ | 25+ | 15+ | 5+ |
| Commits | 500+ | 300+ | 200+ | 100+ |

### Code Quality Metrics
| Metric | 90th %ile | 75th %ile | 50th %ile | 25th %ile |
|--------|-----------|-----------|-----------|-----------|
| Code Quality | 90+ | 80+ | 70+ | 50+ |
| Documentation | 90+ | 75+ | 60+ | 40+ |
| Test Coverage | 85+ | 70+ | 55+ | 30+ |
| Security | 90+ | 80+ | 65+ | 45+ |

### Activity Metrics
| Metric | 90th %ile | 75th %ile | 50th %ile | 25th %ile |
|--------|-----------|-----------|-----------|-----------|
| Commits/Month | 25+ | 18+ | 10+ | 5+ |
| Languages Used | 6+ | 4+ | 3+ | 2+ |
| Repositories | 35+ | 25+ | 15+ | 8+ |

## Database Schema

### benchmark_metrics
```sql
CREATE TABLE benchmark_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_category VARCHAR(100) NOT NULL,
    repository_stars INT,
    repository_forks INT,
    commit_count INT,
    code_quality_score DOUBLE,
    documentation_score DOUBLE,
    percentile_90_value DOUBLE,
    percentile_75_value DOUBLE,
    percentile_50_value DOUBLE,
    percentile_25_value DOUBLE,
    description VARCHAR(500),
    data_source VARCHAR(100),
    total_samples_analyzed INT,
    data_collection_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

### benchmark_percentiles
```sql
CREATE TABLE benchmark_percentiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    score_category VARCHAR(100) UNIQUE NOT NULL,
    percentile_90_threshold DOUBLE NOT NULL,
    percentile_75_threshold DOUBLE NOT NULL,
    percentile_50_threshold DOUBLE NOT NULL,
    percentile_25_threshold DOUBLE NOT NULL,
    employability_90_plus DOUBLE NOT NULL,
    employability_75_to_90 DOUBLE NOT NULL,
    employability_50_to_75 DOUBLE NOT NULL,
    employability_25_to_50 DOUBLE NOT NULL,
    employability_below_25 DOUBLE NOT NULL,
    sample_size INT NOT NULL,
    is_active BOOLEAN NOT NULL,
    description VARCHAR(500),
    calibration_notes VARCHAR(500),
    calibrated_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

## Performance Estimates

### Per-Student Analysis
- Background Analysis: 1-2 min
- GitHub Metrics: 30 sec
- AI Detection: 1-2 min
- LLM Analysis (6 sequential models): 4-6 min
- Algorithm Challenge: 2-3 min
- Benchmark Calculation: <30 sec
- **Total: 10-12 minutes per student**

### Batch Analysis
- Batch (200 students): 33-40 hours
- All 4 Batches: 130-160 hours (~6-7 days continuous)

### Hardware Constraints
- GPU: RTX 3050 4GB (sequential model loading required)
- CPU: i7-11th Generation
- RAM: 24GB
- Models Storage: ~17GB

## Implementation Integration

### Backend Integration
```java
// In ScoresController or FinalScoreService
@Autowired
private BenchmarkService benchmarkService;

public void finalizingStudentScores(FinalScore finalScore) {
    // Calculate employability percentage
    Double employability = benchmarkService.calculateEmployabilityPercentage(finalScore);
    finalScore.setEmployabilityPercentage(employability);
    
    // Set category descriptor
    String category = getEmployabilityCategory(employability);
    finalScore.setEmployabilityCategory(category);
    
    // Save updated score
    finalScoreRepository.save(finalScore);
}
```

### Python Integration
```python
from ai_engine.src.utils.benchmark_calculator import BenchmarkCalculator

calculator = BenchmarkCalculator()

# Calculate individual category employability
emp_pct, emp_cat = calculator.calculate_employability(
    category="REPO_QUALITY",
    raw_score=72.5
)

# Calculate combined employability
combined_emp, combined_cat = calculator.calculate_combined_employability(
    scores={
        "REPO_QUALITY": 78.0,
        "GITHUB_METRICS": 65.0,
        "ALGORITHM_SCORE": 82.0,
        "AI_DETECTION": 15.0
    }
)

# Generate comprehensive report
report = calculator.get_benchmark_report(
    student_scores={...}
)
```

## Workflow Summary

1. **Application Startup**
   - `BenchmarkInitializer` loads default benchmarks
   - Creates 8 benchmark metrics and 5 percentile categories
   - Marks percentiles as active/inactive

2. **Student Analysis (Per Batch)**
   - Run 7-layer analysis pipeline
   - Calculate individual scores for each category
   - Call Benchmark API to get employability %

3. **Ranking Generation**
   - Sort students by employability %
   - Generate per-batch rankings (1-200)
   - Generate overall rankings (1-800)
   - Assign employment tiers

4. **Results Reporting**
   - Display employability % and tier
   - Show percentile rank relative to peers
   - Provide feedback on improvement areas
   - Export batch-wise rankings

## Configuration Customization

To adjust employability thresholds, modify `BenchmarkInitializer`:

```java
// Example: Change OVERALL employability mapping
overallPercentile.setEmployability90Plus(98.0);     // Top 10%
overallPercentile.setEmployability75To90(88.0);     // Next 15%
overallPercentile.setEmployability50To75(68.0);     // Next 25%
overallPercentile.setEmployability25To50(48.0);     // Next 25%
overallPercentile.setEmployabilityBelow25(28.0);    // Bottom 25%
```

## Troubleshooting

### Issue: All students getting 100% employability
- **Cause**: Benchmark percentiles not loaded
- **Fix**: Check `BenchmarkInitializer` runs on startup

### Issue: Employability scores seem inconsistent
- **Cause**: Multiple active benchmark percentiles for same category
- **Fix**: Ensure `is_active=false` for old percentiles before creating new ones

### Issue: AI Engine not calculating employability
- **Cause**: `benchmark_calculator.py` not imported
- **Fix**: Verify import path and Python module is in correct directory

## Future Enhancements

1. **Dynamic Benchmark Calibration**
   - Recalibrate percentiles annually based on new cohort data
   - Implement dynamic percentile adjustment

2. **Advanced Metrics**
   - Line of code per project
   - Cyclomatic complexity
   - Maintainability index

3. **Personalized Benchmarks**
   - Compare within same year/batch
   - Compare to previous years
   - Compare to specific skillsets

4. **Predictive Analytics**
   - Predict employment outcomes based on benchmarks
   - Suggest skill improvement areas
