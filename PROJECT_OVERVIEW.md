# Employability Readiness Tracker - Complete System Overview

## Executive Summary
This is a **multi-dimensional student employability assessment system** that combines GitHub analysis, algorithm challenges, academic records, social media presence, and industry demand metrics into a comprehensive readiness score.

---

## 1. READINESS SCORE FORMULA & DIMENSIONS

### Current Implementation Status: ✅ IMPLEMENTED

The system uses **Adaptive Scoring with Scope-Based Weights** - different project types have different evaluation criteria.

#### **Scoring Dimensions & Weights by Project Scope:**

| Project Scope | Efficiency | Architecture | Security | Correctness |
|---------------|-----------|--------------|----------|------------|
| **DevOps** | 35% | 30% | 25% | 10% |
| **ML/AI** | 15% | 30% | 20% | **35%** |
| **Software Engineering** | 15% | 25% | 25% | **35%** |
| **Cybersecurity** | 10% | 20% | **40%** | 30% |
| **Communication** | **35%** | 20% | 15% | 30% |

**Implementation File:** `ReadinessScoreWeights.java` (Backend)

#### **How it Works:**
1. **Project Scope Detection** → Auto-detect project type (AI models analyze repo)
2. **Apply Scope-Specific Weights** → Match project to correct weight formula
3. **Calculate Scores** → Use weighted average of dimension scores
4. **Generate Recommendations** → Suggest improvements per scope

---

## 2. OVERALL READINESS COMPONENTS (6-Part System)

### A. GitHub Analysis (35% of Score)
**Status:** ✅ FULLY IMPLEMENTED

**What it measures:**
- Code Quality (CodeLlama 7B model: 35% weight)
- Architecture Analysis (Qwen 2.5-Coder 3B: 25% weight)
- Security Assessment (5% weight)
- Documentation Quality (8% weight)
- AI Detection Penalty (25% weight - prevents cheating)

**Key Metrics:**
- Repository stars, forks, followers
- Commit frequency & consistency
- Pull requests & code review count
- Test coverage & maintainability
- Language diversity

**Components:**
- `GitHubAnalysisTab.tsx` - Frontend UI
- `GitHubAnalysisService.java` - Backend orchestration
- Python AI Engine with 6 LLM models

---

### B. Algorithm Challenges (20% of Score)
**Status:** ✅ IMPLEMENTED

**What it measures:**
- Problem-solving ability
- Code correctness
- Algorithm optimization
- Implementation speed

**Challenge Types:**
1. **LeetCode-Style Problems** - Data structures, algorithms
2. **Real-World Problems** - System design, optimization
3. **Time-Limited Contests** - Competitive programming simulation
4. **Custom Department Problems** - Institution-specific challenges

**Technology:**
- Secure Code Editor with syntax highlighting
- Automated test case validation
- Cheat detection system
- Real-time scoring

**Files:**
- `AlgorithmChallengePage.tsx` - Frontend
- `ChallengeService.java` - Backend
- `AntiCheatService.java` - Plagiarism detection

---

### C. Academic Records (15% of Score)
**Status:** 🟡 PARTIAL (Integrated, Score Calculation Pending)

**What it measures:**
- Current GPA
- Module progress & completion
- Course performance
- Academic standing

**Current Implementation:**
- Student profile stores: GPA, current year, registration number
- ModulesTab displays: 5 core modules (Data Structures, Web Dev, ML, Databases, Cloud)
- Module progress tracking: percentage completion & status

**Data Fields:**
```
- registration_number (student ID)
- current_year (year level)
- current_gpa (overall GPA)
- academic_score (calculated from modules)
```

**⚠️ TODO:** 
- Integrate with department's student records database
- Implement actual GPA conversion to score
- Add module-level performance tracking

---

### D. Social Media Presence (10% of Score)
**Status:** ✅ UI READY (Backend Integration Pending)

**Platforms Monitored:**
1. **LinkedIn** - Professional presence, endorsements, recommendations
2. **Facebook** - Community engagement (optional)

**Current UI:**
- `SocialMediaTab.tsx` displays LinkedIn & Facebook profile links
- Placeholder for profile completeness calculation
- Recommendations: professional photo, complete bio, endorsements

**What it measures:**
- Profile completeness (%)
- Endorsements & recommendations count
- Network size & quality
- Activity & engagement level
- Industry connections

**⚠️ TODO:**
```
- LinkedIn API integration to fetch endorsements
- Calculate profile completeness score
- Analyze recommendation quality
- Track engagement metrics
```

---

### E. Industry Demand Matching (12% of Score)
**Status:** ⚠️ UI READY (Logic Pending)

**Current UI:**
- `IndustryDemandTab.tsx` shows skill demand analysis
- Listed skills: Python, JavaScript/React, AWS/GCP, Data Analysis, DevOps
- Placeholder: "Not calculated yet"

**What it measures:**
- Skills match vs market demand
- Industry readiness score
- Trending technologies coverage
- Salary potential estimate
- Job market openness for skills

**Data Sources (Proposed):**
- LinkedIn job postings
- Indeed.com analytics
- Glassdoor data
- GitHub trending repositories
- LeetCode trending topics

**⚠️ TODO:**
```
- Scrape job portal requirements (LinkedIn, Indeed, etc.)
- Calculate demand score per skill
- Create skill-to-job mapping matrix
- Generate skill gap recommendations
```

---

### F. Peer Ranking & Benchmarking (8% of Score)
**Status:** ✅ INFRASTRUCTURE READY

**Current Implementation:**
- **Batch Calibration System** - Compares students within their class batch
- **Professional Benchmarks** - Compares against top 5 alumni standards
- **Blended Approach** - Merges batch + professional for fairness

**How Ranking Works:**

```
Phase 1: Student Analysis
├─ Analyze all students in batch (e.g., Year 2: 196 students)
├─ Calculate GitHub + Algorithm + Academic scores
└─ Store in final_scores table

Phase 2: Professional Baseline
├─ Analyze 5 successful alumni (engineers, managers)
├─ Extract benchmark metrics
└─ Calculate percentile thresholds (90%, 75%, 50%, 25%)

Phase 3: Blended Ranking
├─ Create composite benchmark (avg of 5 professionals + batch top-5)
├─ Rank all students within batch
├─ Assign percentile: 90+ (Excellent), 75-90 (Good), etc.
└─ Calculate employability percentage (30-100%)
```

**Percentile Mapping:**
- **90+ percentile** → 95% employability (Ready for industry)
- **75-90 percentile** → 85% employability (Good potential)
- **50-75 percentile** → 70% employability (Average readiness)
- **25-50 percentile** → 50% employability (Needs improvement)
- **Below 25** → 30% employability (Significant gaps)

**Database Tables:**
- `batch_calibration_benchmarks` - Batch-specific benchmarks
- `benchmark_percentiles` - Professional baselines
- `final_scores` - Student scores + percentiles + rankings

---

## 3. JOB PORTAL MONITORING

**Status:** 📋 PLANNED

### Proposed Job Portals to Monitor:

#### **Global Platforms:**
- ✅ LinkedIn (implementation ready)



### Implementation Plan:
```
1. Web scraping for job requirements
2. NLP analysis to extract required skills
3. Create skill demand heatmap
4. Track demand trends over time
5. Calculate skill gap for each student
6. Personalized job recommendations
```

---

## 4. TECHNOLOGY STACK

### **DECIDED & IMPLEMENTED:**

#### **Frontend:**
- ✅ **React 18.3.1** (TypeScript)
- ✅ **Tailwind CSS** (styling)
- ✅ **Vite** (build tool)
- ✅ **Lucide Icons** (UI components)
- **Runs on:** `localhost:5173`

#### **Backend:**
- ✅ **Spring Boot 4.0.1** (Java 21)
- ✅ **PostgreSQL 17.6** (Supabase Cloud)
- ✅ **Hibernate 7.2.0** (JPA/ORM)
- ✅ **Spring Data, Spring Web, Spring Security**
- **Runs on:** `localhost:8080`

#### **AI/ML Engine:**
- ✅ **Python FastAPI** (async API)
- ✅ **Ollama** (local LLM server: `localhost:11434`)
- ✅ **Multiple LLM Models:**
  - CodeLlama 7B (code analysis)
  - Qwen 2.5-Coder 3B (architecture review)
  - DeepSeek-Coder (various sizes)
  - StarCoder2 7B (code generation understanding)
- **Runs on:** `localhost:8000`

#### **Database:**
- ✅ **PostgreSQL 17.6** (primary)


#### **Build Tools:**
- ✅ **Gradle** (Java backend)
- ✅ **npm/Node** (Frontend)
- ✅ **Python venv** (AI engine)

---

## 5. ACADEMIC DATABASE INTEGRATION

**Status:** 🟡 PARTIALLY INTEGRATED

### Current Integration:
```typescript
// Student Profile Data
interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber: string    // ← Student ID
  currentYear: string            // ← Year level
  currentGpa: number             // ← GPA (but not validated yet)
  githubUsername?: string
  linkedinUrl?: string
  facebookUrl?: string
}
```

### Current Limitations:
1. **Manual Entry** - Students enter GPA manually during signup
2. **No Validation** - No verification against university records
3. **No Real-Time Sync** - GPA is static, not updated from registrar
4. **No Module Integration** - Module data is hardcoded, not from academic system

### Integration Options:

#### **Option A: Department Database Connection (RECOMMENDED)**
```sql
-- Connect to department's student management system
-- Map fields:
registrationNumber → student_id
currentYear → year_level
currentGpa → cumulative_gpa
```

**Requirements:**
- Database credentials from department
- Schema mapping documentation
- Real-time sync frequency (daily/weekly)

#### **Option B: CSV Upload (Simple)**
```
Admin uploads annual student roster CSV:
batch_year, registration_number, student_name, current_gpa, year_level
```

#### **Option C: Hybrid**
```
CSV upload + manual profile entry + periodic sync
```

---

## 6. RANKING PRIVACY & VISIBILITY

**Status:** 🟡 CONFIGURABLE (Admin Can Set)

### Current Architecture:

#### **Privacy Options Available:**

1. **Fully Anonymous (Option 1)**
   ```
   Students see: Rankings, percentiles, NOT student names
   Advisors see: Student names + rankings + scores
   Admin sees: Everything
   ```

2. **Opt-In Named (Option 2)**
   ```
   Students see: Rankings (names visible ONLY if student opts-in)
   Students check: "Make my rank visible to peers"
   Non-opt-in students see: Anonymous position "#15 of 196"
   ```

3. **Fully Visible (Option 3)**
   ```
   Students see: Full rankings with names & scores
   Public leaderboard model
   ```

4. **Role-Based (Hybrid - CURRENT)**
   ```
   Students: Only see own rank & anonymous peer stats
   Advisors: See all students in their cohort + rankings
   Admin: See everything
   ```

### Current Implementation:
- **Default:** Students see only own score + batch percentile
- **AllStudentsTab.tsx** shows peers but ranking is limited
- Admin can view full rankings in `AdminDashboard.tsx`

### Recommendation:
✅ **Opt-In Named** - Students control visibility, encourages engagement

---

## 7. DASHBOARD FEATURES & UI COMPONENTS

### **Student Dashboard** (7 Tabs)

| Tab | Component | Status | Features |
|-----|-----------|--------|----------|
| **Overview** | `OverviewTab.tsx` | ✅ | Summary stats, trend chart |
| **My Profile** | `ProfileTab.tsx` | ✅ | Student info, GPA, details |
| **All Students** | `AllStudentsTab.tsx` | ✅ | Peer comparison, anonymized ranking |
| **GitHub Analysis** | `GitHubAnalysisTab.tsx` | ✅ | Repo analysis, token mgmt, results display |
| **Social Media** | `SocialMediaTab.tsx` | ⚠️ | LinkedIn/Facebook links (not scoring yet) |
| **Modules** | `ModulesTab.tsx` | ⚠️ | Module progress chart (no scoring) |
| **Industry Demand** | `IndustryDemandTab.tsx` | ⚠️ | Skill demand visualization (no data) |

### **Admin Dashboard** (2 Sections)

| Section | Component | Status | Features |
|---------|-----------|--------|----------|
| **Overview** | System stats | ✅ | Students, advisors, admins count |
| **Batch Management** | `BatchConfigurationPanel.tsx` | ✅ | Batch config, progress tracking, trigger analysis |

**Batch Admin Features:**
- Set target students per batch
- Configure auto-start or manual trigger
- Set delay before analysis (24h+)
- View analysis progress & timeline
- See batch completion status

#### **Batch Management Cards** (`BatchProgressCard.tsx`)
- Registration progress bar
- Current status (PENDING, READY, ANALYZING, COMPLETE)
- Auto-start toggle & delay configuration
- Analysis start/stop controls
- Timeline display (started at, completed at)

### **Advisor Dashboard** (Proposed)
- View assigned students only
- Access individual student reports
- Track progress over semesters
- Provide feedback on weak areas

---

## 8. SEQUENCE DIAGRAMS

### **A. GitHub Analysis Flow**
```
Student → Frontend UI → Enter GitHub username & token
                    ↓
                [1] POST /api/github/analyze
                    ↓
         Backend GitHubAnalysisService
         ├─ [2] Fetch repos from GitHub API
         ├─ [3] Send to Python AI Engine (async)
         ├─ [4] Python runs 6-phase analysis:
         │   ├ Phase 1: Background analysis
         │   ├ Phase 2: Deep analysis (CodeLlama + Qwen)
         │   ├ Phase 3: Neural scoring
         │   ├ Phase 4: AI detection
         │   └ Phase 5-6: Recommendations
         ├─ [5] Save results to DB
         └─ [6] Return jobId to frontend
         
Frontend →  [7] GET /api/github/results (polling every 3s)
         ←  [8] Return results when complete
         
Student ←  [9] Display analysis with scores
```

### **B. Batch Analysis Flow**
```
Admin → Click "Start Analysis" on Batch
         ↓
     [1] POST /api/admin/batch-config/{year}/start-analysis
         ↓
  Backend BatchAnalysisScheduler
  ├─ [2] Get all students in batch
  ├─ [3] For each student:
  │   ├─ Analyze GitHub (if username provided)
  │   ├─ Fetch algorithm scores
  │   ├─ Get academic GPA
  │   └─ Calculate final score
  ├─ [4] Store all results in final_scores
  ├─ [5] Calculate batch percentiles
  ├─ [6] Update batch_calibration_benchmarks
  └─ [7] Mark batch as COMPLETE
  
Frontend → [8] Polling /api/admin/batch-config/all
         ← [9] Progress updates in real-time
         
Admin ←  [10] View final rankings & statistics
```

### **C. Peer Ranking Flow**
```
[Phase 1: Individual Scoring]
Student GitHub repos → AI Analysis → Individual Score
Algorithm challenges → Automated grading → Algorithm Score
Academic records → GPA conversion → Academic Score
                    ↓
            Individual Total Score

[Phase 2: Professional Baseline]
5 Alumni → GitHub analysis → Professional benchmarks
         → Calculate percentiles (90%, 75%, 50%, 25%)

[Phase 3: Blended Ranking]
All batch scores + Professional benchmarks
         ↓
  Sort & rank students (1 to N)
         ↓
  Assign percentile for each student
         ↓
  Map percentile to employability (30-100%)
         ↓
  Store in batch_calibration_benchmarks
```

---

## 9. WIREFRAMES & MOCKUPS

### A. Student Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│  ReadinessTracker | Student Dashboard          Logout   │
├─────────────────────────────────────────────────────────┤
│ Overview │ Profile │ Peers │ GitHub │ Social │ Modules │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Overall Score   │  │  Your Rank in Batch         │  │
│  │      78/100     │  │  #12 of 196 (Top 6%)        │  │
│  │  ████░░░░░░░    │  │  Employability: 85%         │  │
│  └─────────────────┘  └─────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Score Breakdown                                     │  │
│  │ • GitHub Analysis:        75/100 (35%)             │  │
│  │ • Algorithm Challenges:   82/100 (20%)             │  │
│  │ • Academic GPA:           3.8/4.0 (15%)            │  │
│  │ • Social Presence:        70/100 (10%)             │  │
│  │ • Industry Match:         88/100 (12%)             │  │
│  │ • Peer Comparison:        Avg in batch (8%)        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  GitHub Analysis Tab:                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🔗 GitHub Username: [_____________]                │  │
│  │ 🔑 Token:          [Token Saved ✓]                 │  │
│  │ [Analyze] [Update Token]                            │  │
│  │                                                     │  │
│  │ Recent Analysis Result:                             │  │
│  │ Repository: awesome-ai-project                      │  │
│  │ Overall Score: 78.5/100                             │  │
│  │ Code Quality:     ████░ 80                          │  │
│  │ Architecture:     ███░░ 75                          │  │
│  │ Security:        ███░░░ 65                          │  │
│  │ Documentation:    ████░ 78                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### B. Admin Batch Management
```
┌─────────────────────────────────────────────────────────┐
│  ReadinessTracker | Admin Dashboard                      │
├─────────────────────────────────────────────────────────┤
│ Overview │ Batch Management                              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  System Stats:                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ 800        │ │ 45         │ │ 3.7        │          │
│  │ Students   │ │ Advisors   │ │ Avg GPA    │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                           │
│  Batch Management:                                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Year 1 Batch                    ★ Ready            │ │
│  │ 156 / 200 students (78%)                            │ │
│  │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░                │ │
│  │ Auto-Start: ✓ Enabled | Delay: Immediate           │ │
│  │ [Start Analysis] [Configure]                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Year 2 Batch                 ⟳ Analyzing           │ │
│  │ 196 / 196 students (100%)                           │ │
│  │ ████████████████████████████████░░                  │ │
│  │ Started: 2024-03-15 10:30:00                        │ │
│  │ Progress: 45% - Analyzing Algorithm challenges     │ │
│  │ [Stop] [View Details]                               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Year 3 Batch                    ✓ Complete         │ │
│  │ 190 / 190 students (100%)                           │ │
│  │ ████████████████████████████████████████            │ │
│  │ Completed: 2024-03-15 14:22:00                      │ │
│  │ Top Student: Rank #1 (89.5/100)                     │ │
│  │ [Export Results] [View Rankings]                    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### C. Ranking Visualization
```
┌─────────────────────────────────────────────────────────┐
│ Your Rank & Percentile Position                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Overall Score Percentile (Batch: Year 2)                │
│ ──────────────────────────────────────────────────────  │
│ 90+% │ 75-90% │ 50-75% │ 25-50% │ Below 25             │
│      │        │        │   ↑    │                      │
│      │        │        │  You   │                      │
│      │        │        │        │                      │
│ Excellent│ Good │ Average │Needs Work│ Below Par       │
│ 95%      │ 85%  │  70%    │  50%  │  30%                │
│          │      │         │       │                    │
│ 19 students│ 48  │  89     │  34   │  6                │
│                                                           │
│  Your Position: 54th out of 196 (27.5 percentile)       │
│  Employability Rating: 50% (Needs Improvement)          │
│                                                           │
│  Recommendations to Improve:                            │
│  ✓ Complete 2 more algorithm challenges                 │
│  ✓ Improve code documentation (currently 65%)           │
│  ✓ Add security best practices to GitHub projects       │
│  ✓ Get LinkedIn endorsements in Python (5 needed)       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 10. IMPLEMENTATION ROADMAP

### **Phase 1: Current (✅ DONE)**
- [x] GitHub analysis with AI models
- [x] Algorithm challenge system
- [x] Batch configuration & management
- [x] Student profiles & peers view
- [x] Peer ranking infrastructure

### **Phase 2: Next (🔴 READY TO START)**
- [ ] Academic database integration
- [ ] Social media scoring (LinkedIn endorsements)
- [ ] Industry demand tracking (job portal scraping)
- [ ] Module progress scoring
- [ ] Enhanced recommendations

### **Phase 3: Future**
- [ ] Advisor feedback system
- [ ] Internship tracking
- [ ] Soft skills assessment
- [ ] Career path recommendations
- [ ] Mobile app
- [ ] API for external integrations

---

## 11. KEY FILES REFERENCE

### **Frontend (React/TypeScript)**
```
project/src/
├── pages/
│   ├── StudentDashboard.tsx          ← Main student UI
│   ├── AdminDashboard.tsx            ← Admin UI
│   ├── AlgorithmChallengePage.tsx    ← Challenge editor
│   └── LoginPage.tsx / SignupPage.tsx
├── components/
│   ├── dashboard/
│   │   ├── OverviewTab.tsx
│   │   ├── GitHubAnalysisTab.tsx     ← GitHub scoring
│   │   ├── SocialMediaTab.tsx        ← LinkedIn/Facebook
│   │   ├── ModulesTab.tsx            ← Academic modules
│   │   ├── IndustryDemandTab.tsx    ← Job market
│   │   ├── AllStudentsTab.tsx        ← Peer ranking
│   │   └── ProfileTab.tsx
│   ├── admin/
│   │   ├── BatchConfigurationPanel.tsx
│   │   ├── BatchProgressCard.tsx
│   │   └── BatchConfigModal.tsx
│   ├── AnalysisResults.tsx           ← GitHub results display
│   └── ScoresDisplay.tsx             ← Score breakdown
└── services/ → API calls
```

### **Backend (Spring Boot/Java)**
```
readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/
├── service/
│   ├── ReadinessScoreWeights.java   ← Scoring weights
│   ├── ReadinessScoreCalculator.java ← Score calculation
│   ├── GitHubAnalysisService.java    ← GitHub logic
│   ├── BatchAnalysisScheduler.java   ← Batch processing
│   ├── ChallengeService.java         ← Algorithm challenges
│   ├── BenchmarkService.java         ← Ranking logic
│   └── AntiCheatService.java         ← Cheat detection
├── entity/
│   ├── Student.java
│   ├── FinalScore.java               ← Student scores
│   ├── BatchCalibrationBenchmark.java ← Batch rankings
│   ├── AnalysisJob.java              ← GitHub analysis jobs
│   └── AlgorithmChallenge.java
└── controller/
    ├── StudentController.java
    ├── AdminController.java
    └── AnalysisController.java
```

### **Python AI Engine**
```
ai-engine-githubanalyzer/
├── main.py                           ← FastAPI app
├── src/
│   ├── config/
│   │   └── algorithm_prompts.py      ← LLM prompts
│   ├── services/
│   │   ├── quad_analyzer.py          ← 6-phase analysis
│   │   └── benchmark_calculator.py   ← Benchmark logic
│   ├── api/
│   │   └── routes/
│   │       ├── intelligent_analysis.py
│   │       └── algorithm_evaluation.py
│   └── utils/
│       ├── ollama_client.py          ← LLM interface
│       └── github_benchmark_analyzer.py
```

---

## 12. SAFETY & RISK MANAGEMENT REQUIREMENTS

### **Potential Harms & Loss Scenarios**

#### **1. DATA PRIVACY & SECURITY RISKS** 🔒
**Potential Loss/Harm:**
- Student personal data exposure (names, emails, GPAs, GitHub profiles)
- Unauthorized access to academic records
- Social media account information compromise

**Current Safeguards:**
- ✅ PostgreSQL running on Supabase Cloud (encrypted at rest)
- ✅ Spring Security framework integrated
- ✅ Role-based access control (Students/Advisors/Admin)

**❌ GAPS - Actions Needed:**
- [ ] No encryption for sensitive fields (GPA, scores)
- [ ] GitHub tokens stored in plain text (security risk)
- [ ] No audit logging of data access
- [ ] No rate limiting on API endpoints
- [ ] Password requirements not enforced

---

#### **2. ALGORITHMIC BIAS & DISCRIMINATION RISKS** ⚖️
**Potential Loss/Harm:**
- AI models may discriminate against certain student profiles (language bias, socioeconomic)
- Unfair ranking based on biased training data
- Psychological harm to students ranked low due to algorithmic error
- Reputational damage to institution

**Current Safeguards:**
- ✅ Blended ranking (professional + peer benchmarks)
- ✅ Multiple LLM models (reduces single-model bias)
- ✅ Transparent scoring breakdown shown to students

**❌ GAPS - Actions Needed:**
- [ ] No bias audit of AI models
- [ ] No fairness testing for ranking algorithm
- [ ] No appeal/dispute mechanism for scores
- [ ] No monitoring for disparate impact by demographics

---

#### **3. DATA INTEGRITY & CHEATING RISKS** 🚨
**Potential Loss/Harm:**
- Students manipulate GPA data or GitHub repos
- Plagiarism in algorithm challenges
- False employability scores given to employers
- Institutional credibility damage

**Current Safeguards:**
- ✅ AntiCheatService implemented (AI detection)
- ✅ GitHub analysis auto-detection of AI-written code (25% penalty)
- ✅ Read-only access to final scores (admin-locked)

**❌ GAPS - Actions Needed:**
- [ ] No verification of student identity during challenges
- [ ] No proctoring for algorithm contests
- [ ] No timestamp validation on GitHub commits
- [ ] No detection of bought/copied algorithm solutions

---

#### **4. ACCOUNT SECURITY RISKS** 🔑
**Potential Loss/Harm:**
- GitHub token interception (currently stored in sessionStorage/localStorage)
- Account hijacking (weak password policies)
- Unauthorized score modification
- Data breach from exposed credentials

**Current Safeguards:**
- ✅ GitHub token persistence implemented (localStorage)
- ✅ Token validation endpoint created
- ✅ Role-based permissions (admin-only score changes)

**❌ GAPS - Actions Needed:**
- [ ] No 2FA/MFA support
- [ ] GitHub tokens sent in HTTP headers (should use OAuth2)
- [ ] No session timeout enforcement
- [ ] No brute-force protection on login

---

#### **5. PSYCHOLOGICAL & EMOTIONAL HARM RISKS** 💔
**Potential Loss/Harm:**
- Mental health issues from public ranking visibility
- Self-esteem damage from low scores
- Anxiety during algorithm challenges
- Pressure to manipulate data

**Current Safeguards:**
- ✅ Anonymous ranking option available
- ✅ Opt-in visibility model proposed
- ✅ Personalized recommendations (supportive)

**❌ GAPS - Actions Needed:**
- [ ] No counseling resources provided
- [ ] No score appeal/revision mechanism
- [ ] No mental health warning system for low scores
- [ ] No option to hide scores from advisors

---

#### **6. EXTERNAL DATA EXPOSURE RISKS** 📊
**Potential Loss/Harm:**
- LinkedIn profile data breach (if API integrated)
- Job portal scraping violates ToS
- Social media account information misuse
- GDPR/Privacy law violations

**Current Safeguards:**
- ✅ Optional LinkedIn/Facebook linking (not forced)
- ✅ Private profile data encryption

**❌ GAPS - Actions Needed:**
- [ ] No API terms-of-service compliance check
- [ ] No GDPR consent mechanism
- [ ] No data retention policy
- [ ] No right-to-deletion implemented

---

### **REGULATORY COMPLIANCE REQUIREMENTS**

#### **Applicable Regulations:**
1. **GDPR (EU)** - If any EU students involved
   - Requires explicit consent for data processing
   - Right to access personal data
   - Right to erasure ("right to be forgotten")
   - Data Protection Impact Assessment (DPIA) needed

2. **FERPA (USA)** - If US affiliated students
   - Protects student educational records
   - Requires written consent for data sharing
   - Audit trail required for record access

3. **PDPA (Sri Lanka)** - Local Privacy Act
   - Consent required for personal data processing
   - Data must be adequate, relevant, not excessive
   - Security measures required

4. **Higher Education Institution Policies**
   - Department approval for data collection
   - Student handbook disclosure
   - Faculty ethics review

---

## 13. SECURITY REQUIREMENTS SPECIFICATION (BULLET POINTS)

### **AUTHENTICATION & PASSWORD SECURITY**
- ✅ Password hashing with **bcrypt (cost factor 12)** or **Argon2id**
- ✅ Password complexity: min 12 chars, uppercase, lowercase, numbers, special chars
- ✅ Prevent common passwords (password123, qwerty, admin, etc.)
- ✅ Prevent password reuse (last 5 passwords)
- ❌ Multi-Factor Authentication (MFA): Mandatory for admins/advisors, optional for students
- ❌ TOTP support (Google Authenticator, Authy)
- ❌ Backup email verification codes

---

### **DATA TRANSMISSION & ENCRYPTION**
- ✅ **TLS 1.2 or higher (TLS 1.3 preferred)** for all data transmission
- ✅ Enforce HTTPS everywhere (no HTTP fallback)
- ✅ Set `Strict-Transport-Security` header (min 90 days)
- ❌ **AES-256 encryption at-rest** for: GPA, scores, GitHub tokens, social media profiles
- ❌ Implement certificate pinning for mobile (future)
- ❌ Annual SSL/TLS certificate audit

---

### **ACCESS CONTROL & DATA ISOLATION**
- ✅ **Role-Based Access Control (RBAC):**
  - **Students:** View only own scores, profile, anonymized peer stats
  - **Advisors:** View assigned students + scores, cannot modify scores
  - **Admins:** Access all data, modify scores with justification
- ✅ Field-level security (filter queries by user_id/batch_id)
- ✅ API returns 403 Forbidden for unauthorized access attempts
- ❌ Batch-level isolation (admin scoped to assigned batch only)

---

### **INPUT VALIDATION & INJECTION PROTECTION**
- ❌ **SQL Injection Prevention:** Use parameterized queries (@Query @Param), no string concatenation
- ❌ **XSS Prevention:** Sanitize inputs, add Content Security Policy (CSP) headers
- ❌ **Input Validation:** Use @Valid, @NotNull, @Size, @Pattern annotations
  - Validate email (RFC 5322)
  - Validate GitHub username (alphanumeric + hyphens only)
  - Validate GPA range (0.0-4.0)
  - Validate age (16+)
- ❌ **File Upload Validation:** Max 10MB, allowed formats (PDF, JPG, PNG), malware scan

---

### **SESSION MANAGEMENT & TIMEOUT**
- ❌ **Session expiration after 30 minutes of inactivity**
- ❌ Session fixation protection (new ID after login)
- ❌ HttpOnly and Secure flags on cookies
- ❌ SameSite=Strict cookie attribute
- ❌ Clear session/JWT tokens on logout
- ❌ Cannot reuse expired tokens

---

### **AUDIT LOGGING & MONITORING**
- ❌ **Log ALL administrative actions:** login attempts, score changes, data exports, role changes, deletions
- ❌ Log fields: timestamp, user_id, user_role, action, resource_id, old_value, new_value, ip_address, user_agent, status, reason
- ❌ **7-year retention** for audit logs (FERPA/regulatory compliance)
- ❌ Immutable logs (encryption, prevent deletion/modification)
- ❌ Hash verification for log integrity
- ❌ **Real-time alerts** for: brute force (>5 failed logins/15min), unusual exports, bulk modifications

---

### **API SECURITY**
- ❌ **Rate limiting:** 100 req/min per authenticated user, 10 req/min per IP (unauthenticated)
- ❌ Return 429 Too Many Requests when exceeded
- ❌ **CORS hardening:** Allow only frontend domain (not wildcard), whitelist methods/headers
- ✅ API authentication required (Spring Security)
- ❌ Exception: /auth/login, /auth/signup endpoints
- ❌ **API versioning:** All endpoints with /api/v1/ prefix
- ❌ Deprecation policy: 6-month notice before removing endpoints

---

### **THIRD-PARTY INTEGRATION SECURITY**
- ❌ **GitHub OAuth2:** Use OAuth2 (not personal tokens), implement PKCE flow
- ❌ Minimize OAuth scopes (request only needed permissions)
- ❌ Encrypt and rotate tokens regularly
- ❌ **LinkedIn API:** Comply with Terms of Service, implement data minimization
- ❌ Store LinkedIn data securely, add opt-out mechanism
- ❌ Annual compliance audit for LinkedIn
- ❌ **Job Portal Scraping:** Comply with ToS, respect robots.txt
- ❌ Implement rate limiting for scrapers
- ❌ Prefer official APIs over scraping

---

### **DATA PRIVACY & GDPR COMPLIANCE**
- ❌ **Consent Management:** Explicit user consent for data processing (personal data, GitHub, LinkedIn, job portals)
- ❌ Store consent records with timestamp
- ❌ Allow users to withdraw consent anytime
- ❌ **Right to Access:** Download personal data in JSON/CSV (profile, scores, analysis) within 30 days
- ❌ **Right to Deletion:** User can delete account + personal data (keep audit logs for compliance)
- ❌ **Data Retention Policy:**
  - Active students: Indefinite (or until deletion)
  - Graduated students: 7 years (FERPA)
  - Failed login attempts: 90 days
  - Audit logs: 7 years

---

## 14. SAFETY FEATURES - IMPLEMENTATION QUEUE (Phase 2-3)

### **HIGH PRIORITY - TO IMPLEMENT IMMEDIATELY:**

| # | Security Feature | Risk Mitigates | Effort | Timeline |
|---|---|---|---|---|
| 1️⃣ | **Password Hashing (bcrypt)** | Account compromise | 1 sprint | Week 1 |
| 2️⃣ | **Session Timeout (30 mins)** | Unauthorized access | 1 sprint | Week 1 |
| 3️⃣ | **Audit Logging System** | Non-compliance, liability | 2 sprints | Week 2-3 |
| 4️⃣ | **Input Validation & SQL Injection** | Data breach, injection | 2 sprints | Week 2-3 |
| 5️⃣ | **Sensitive Data Encryption (AES-256)** | Data at-rest exposure | 2 sprints | Week 3-4 |

### **MEDIUM PRIORITY - Q2 2024:**

| # | Security Feature | Risk Mitigates | Effort | Timeline |
|---|---|---|---|---|
| 6️⃣ | **Two-Factor Authentication (2FA)** | Account hijacking | 2 sprints | May |
| 7️⃣ | **Rate Limiting & DDoS Protection** | Service abuse | 1 sprint | May |
| 8️⃣ | **GDPR Consent & Data Access** | Legal violations | 2 sprints | June |
| 9️⃣ | **Score Appeals Mechanism** | Fairness, liability | 2 sprints | June |
| 🔟 | **Bias Audit Dashboard** | Discrimination lawsuits | 3 sprints | July |

---

## 12. NEXT STEPS FOR TEAM

### **High Priority (This Sprint)**
1. ✅ Fix GitHub token persistence (DONE)
2. ✅ Optimize database updates (DONE)
3. 🔴 **Integrate department's academic database**
4. 🔴 **Implement job portal monitoring (Indeed, LinkedIn)**
5. 🔴 **Connect LinkedIn API for social scoring**
6. 🔴 **CRITICAL: Implement data encryption (Feature 1)**
7. 🔴 **CRITICAL: Add audit logging system (Feature 2)**

### **Medium Priority**
1. Implement industry demand scoring algorithm
2. Complete module-level academic scoring
3. Add advisor dashboard
4. Create exportable reports

### **Documentation Needed**
1. ✅ This overview document (COMPLETED)
2. API endpoint documentation (Swagger/OpenAPI)
3. Database schema diagram
4. Architecture decision records (ADRs)
5. Deployment & setup guide

---

## Summary Table

| Component | Status | Score Weight | Data Source | Files |
|-----------|--------|--------------|-------------|-------|
| **GitHub Analysis** | ✅ Working | 35% | GitHub API + AI models | `GitHubAnalysisTab.tsx`, `GitHubAnalysisService.java` |
| **Algorithm Challenges** | ✅ Working | 20% | Code submissions + auto-grading | `AlgorithmChallengePage.tsx`, `ChallengeService.java` |
| **Academic Records** | 🟡 Partial | 15% | Manual entry (needs DB integration) | `ProfileTab.tsx`, `Student.java` |
| **Social Media** | ⚠️ UI Only | 10% | LinkedIn (needs API) | `SocialMediaTab.tsx` |
| **Industry Demand** | ⚠️ UI Only | 12% | Job portals (needs scraping) | `IndustryDemandTab.tsx` |
| **Peer Ranking** | ✅ Working | 8% | Batch benchmarks + calculation | `BatchConfiguration`, `BenchmarkService.java` |
| **Privacy Control** | ✅ Implemented | — | Role-based (configurable) | Multiple components |
| **Batch Management** | ✅ Working | — | Admin portal | `BatchConfigurationPanel.tsx` |

This is the **complete system architecture**. All pieces are in place; the remaining work is integration with external data sources (academic DB, job portals, LinkedIn API).

