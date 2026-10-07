# 🧪 QA Testing Guide — Employability Readiness Tracker

This document covers **every testable feature** in your project, organized by module. For each module, you get:
- **What to test** (the test cases)
- **Why it matters** (what could go wrong)
- **Priority** (🔴 Critical / 🟡 Important / 🟢 Nice-to-have)

---

## Module 1: Authentication & Authorization
> Pages: `LoginPage`, `SignupPage`, `StudentSignupPage`, `AdminSignupPage`, `AdvisorSignupPage`
> Backend: `AdminController`, `StudentController`, `AdvisorController`
> Context: `AuthContext.tsx`

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1 | **Student signup — valid data** | Fill all fields correctly → Submit | Account created, redirected to Student Dashboard |
| 1.2 | **Student signup — duplicate email** | Sign up with an email that already exists | Error message: "Email already registered" |
| 1.3 | **Student signup — empty fields** | Leave required fields blank → Submit | Validation errors shown for each empty field |
| 1.4 | **Student signup — weak password** | Enter password < 6 chars | Error: "Password too short" |
| 1.5 | **Student login — valid credentials** | Enter correct email + password | Redirected to Student Dashboard |
| 1.6 | **Student login — wrong password** | Enter correct email + wrong password | Error: "Invalid credentials" |
| 1.7 | **Student login — non-existent user** | Enter an email that doesn't exist | Error: "User not found" |
| 1.8 | **Admin login — valid credentials** | Log in as admin | Redirected to Admin Dashboard |
| 1.9 | **Advisor login — valid credentials** | Log in as advisor | Redirected to Advisor Dashboard |
| 1.10 | **Role-based access — student visits admin page** | Log in as student, manually navigate to `/admin` | Blocked/redirected, cannot access admin features |
| 1.11 | **Role-based access — admin visits student page** | Log in as admin, navigate to student dashboard | Blocked/redirected appropriately |
| 1.12 | **Session expiry / JWT expiry** | Log in, wait for token to expire (or manually expire it) | User is logged out, redirected to login |
| 1.13 | **Logout** | Click logout button | Session cleared, redirected to login page |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.14 | **SQL Injection in login** | Enter `' OR '1'='1` as email/password | Login fails, no data breach |
| 1.15 | **XSS in signup fields** | Enter `<script>alert('xss')</script>` as name | Script is sanitized, not executed |
| 1.16 | **Password not visible in network tab** | Open browser DevTools → Network, submit login | Password is sent over HTTPS, not visible in plain text in response |

---

## Module 2: GitHub Analysis (Your AI Engine)
> Pages: `GitHubAnalysisTab`, `GitHubAnalysisPanel`, `AnalysisResults`
> Backend: `GitHubAnalysisController`, `GitHubAnalysisService`, `PythonBridgeService`
> Python: `ai_engine_with_fine_tuned_llm` (FastAPI + Ollama)

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | **Valid GitHub username analysis** | Enter a real GitHub username with public repos → Analyze | Analysis completes, scores displayed (0-100 for each category) |
| 2.2 | **Invalid GitHub username** | Enter `xyznonexistent12345` → Analyze | Error: "No public repositories found" or "User not found" |
| 2.3 | **Empty GitHub username** | Leave field blank → Analyze | Validation error, analysis doesn't start |
| 2.4 | **GitHub token validation** | Enter an invalid/expired token | Error message about invalid token |
| 2.5 | **Analysis progress tracking** | Start analysis, watch progress bar | Progress updates: 10% → 40% → 80% → 90% → 100% |
| 2.6 | **Analysis results display** | Complete an analysis | Shows: overall score, per-repo scores, tier, strengths, improvements |
| 2.7 | **Repo-specific scores visible** | Complete analysis, check each repo card | Each repo shows: code_quality, architecture, documentation, testing, best_practices |
| 2.8 | **Python AI Engine down** | Stop the Python server, trigger analysis from UI | Graceful error: "AI Engine unavailable", job marked as FAILED |
| 2.9 | **Ollama model not running** | Stop Ollama, trigger analysis | Graceful error handling, not a 500 crash |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.10 | **User with only forked repos** | Analyze a user who only has forks | System handles gracefully (may show low scores or "no original repos") |
| 2.11 | **User with 100+ repos** | Analyze a user with many repos | System selects top 5, doesn't crash or timeout |
| 2.12 | **Concurrent analysis requests** | Two users trigger analysis at the same time | Both complete without interfering with each other |
| 2.13 | **Re-analysis of same user** | Analyze the same user twice | Second analysis runs fresh (or uses cache if implemented) |
| 2.14 | **Score consistency** | Analyze the same user 3 times | Scores should be identical or very close (temperature = 0.0) |

---

## Module 3: Student Dashboard
> Pages: `StudentDashboard`
> Tabs: `OverviewTab`, `GitHubAnalysisTab`, `ModulesTab`, `ProfileTab`, `SocialMediaTab`, `IndustryDemandTab`

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1 | **Dashboard loads after login** | Log in as student | Dashboard renders with all tabs visible |
| 3.2 | **Overview tab shows correct data** | Navigate to Overview | Shows student's overall employability score, charts, metrics |
| 3.3 | **GitHub tab shows analysis results** | Navigate to GitHub Analysis tab | Shows latest analysis results or prompt to start one |
| 3.4 | **Profile tab shows student info** | Navigate to Profile | Correct name, email, GitHub username displayed |
| 3.5 | **New student with no data** | Log in as a brand new student | Dashboard shows empty states gracefully, not crashes |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.6 | **Tab switching** | Click between all tabs rapidly | No crashes, correct content loads each time |
| 3.7 | **Responsive design** | Resize browser to mobile width | Dashboard remains usable on small screens |

---

## Module 4: Admin Dashboard
> Pages: `AdminDashboard`
> Panels: `GitHubAnalysisPanel`, `BatchConfigurationPanel`, `BenchmarkPanel`, `ModulesPanel`, `IndustryDemandPanel`, `SocialMediaPanel`
> Backend: `AdminController`, `BatchConfigurationController`, `BenchmarkController`

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | **Admin can view all students** | Log in as admin, go to student list | All registered students are visible |
| 4.2 | **Admin can trigger analysis for a student** | Select a student → Trigger GitHub analysis | Analysis starts, progress is visible |
| 4.3 | **Batch analysis configuration** | Configure a batch run for multiple students | Batch job starts, progress cards shown |
| 4.4 | **Benchmark accounts management** | Add/view benchmark GitHub accounts | Accounts are saved and usable for benchmarking |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.5 | **Batch analysis — cancel mid-run** | Start a batch, then cancel | Running analyses stop gracefully |
| 4.6 | **Admin cannot modify their own role** | Try to change own admin privileges | Action blocked |

---

## Module 5: Algorithm Challenge & Cheating Detection
> Pages: `AlgorithmChallengePage`, `AdminCheatingDashboard`
> Backend: `ChallengeController`, `CheatingAdminController`
> Components: `SecureCodeEditor`
> Entities: `AlgorithmChallenge`, `ChallengeSubmission`, `SubmissionCheatingFlags`, `ProblemAssignment`

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.1 | **Student can view assigned challenge** | Log in as student → Navigate to challenge page | Challenge problem is displayed correctly |
| 5.2 | **Student can submit code** | Write code in editor → Submit | Submission recorded, feedback/score returned |
| 5.3 | **Code editor works** | Type code in SecureCodeEditor | Syntax highlighting works, code is preserved |
| 5.4 | **Cheating flags raised correctly** | Submit suspicious code (copy-paste pattern) | Cheating flags are recorded in `SubmissionCheatingFlags` |
| 5.5 | **Admin cheating dashboard shows flags** | Log in as admin → View cheating dashboard | Flagged submissions visible with details |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.6 | **Submit empty code** | Click submit with no code | Validation error, not a crash |
| 5.7 | **Submit after time limit** | Try to submit after challenge window closes | Submission rejected with clear message |
| 5.8 | **Multiple submissions** | Submit code, then submit again | System handles re-submissions (overwrite or reject based on rules) |

---

## Module 6: Leaderboard & Scores
> Backend: `LeaderboardController`, `ScoresController`
> Entity: `FinalScore`
> Component: `ScoresDisplay`

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.1 | **Leaderboard loads** | Navigate to leaderboard page | All students ranked by score, correct order |
| 6.2 | **Scores are accurate** | Compare displayed score with database | Scores match exactly |
| 6.3 | **Leaderboard updates after new analysis** | Run analysis for a student, check leaderboard | New score reflected immediately or after refresh |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.4 | **Tie-breaking** | Two students with identical scores | Both shown, consistent ordering |
| 6.5 | **Empty leaderboard** | No students have been analyzed yet | Shows empty state, not a crash |

---

## Module 7: Advisor Dashboard
> Pages: `AdvisorDashboard`, `AdvisorSignupPage`
> Backend: `AdvisorController`
> Entity: `Advisor`

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.1 | **Advisor can view assigned students** | Log in as advisor | List of assigned students is visible |
| 7.2 | **Advisor can view student analysis** | Click on a student | Student's GitHub analysis and scores are visible |

---

## Module 8: API & Integration Tests
> Backend: All Controllers
> Python: FastAPI endpoints

### 🔴 Critical Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.1 | **Java ↔ Python bridge works** | Trigger analysis from Java backend | Python engine receives request, processes, returns JSON |
| 8.2 | **API returns proper HTTP codes** | Call endpoints with valid/invalid data | 200 for success, 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server error |
| 8.3 | **CORS configuration** | Frontend makes API calls | No CORS errors in browser console |
| 8.4 | **Database connection** | Start the backend | Connects to PostgreSQL/Supabase without errors |

### 🟡 Important Tests

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.5 | **API rate limiting (GitHub)** | Trigger many analyses without a token | Graceful handling of GitHub 403 rate limit errors |
| 8.6 | **Large payload handling** | Analyze user with very large repos | No timeout, no memory crash |

---

## Summary: What to Test First (Priority Order)

| Priority | Module | Why |
|----------|--------|-----|
| 🔴 1st | **Authentication (Login/Signup)** | If auth is broken, nothing else works |
| 🔴 2nd | **GitHub Analysis Flow** | This is the core feature of your project |
| 🔴 3rd | **Role-Based Access** | Security — students shouldn't see admin pages |
| 🟡 4th | **Algorithm Challenge** | Key feature for evaluation |
| 🟡 5th | **Leaderboard & Scores** | Visible to everyone, must be accurate |
| 🟡 6th | **Admin & Advisor Dashboards** | Important but less user-facing |
| 🟢 7th | **Edge Cases & Error Handling** | Polish — makes the app professional |

---

## Total Test Cases: ~55

> [!TIP]
> You don't need to automate all of these. For a university project, **manual testing with screenshots** is perfectly acceptable. Create a spreadsheet with columns: Test ID, Test Case, Steps, Expected, Actual, Pass/Fail, Screenshot.
