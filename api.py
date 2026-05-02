"""
api.py  –  Flask REST API for Industry Demand Analysis
Serves analyzed job/skill data to the React frontend (Industry Demand tab)

Run:
    pip install flask flask-cors pandas
    python api.py
    
API will be available at: http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import re
from collections import Counter
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

CSV_FILE = Path("jobs_data.csv")
CSV_FALLBACK_FILE = Path("jobs_data_fallback.csv")

# ---------------------------------------------------------------------------
# Helper: load and parse CSV
# ---------------------------------------------------------------------------

def load_jobs() -> pd.DataFrame | None:
    csv_path = CSV_FILE if CSV_FILE.exists() else CSV_FALLBACK_FILE
    if not csv_path.exists():
        return None
    df = pd.read_csv(csv_path)
    df["Detected_Skills"] = df["Detected_Skills"].fillna("")
    return df


def get_all_skills(df: pd.DataFrame) -> Counter:
    all_skills: list[str] = []
    for skills_str in df["Detected_Skills"]:
        if skills_str.strip():
            all_skills.extend([s.strip() for s in skills_str.split(",") if s.strip()])
    return Counter(all_skills)


def extract_salary_value(salary_str: str) -> float | None:
    """Extract numeric salary value from string like '$120k', '€50k-€60k', etc."""
    if not salary_str or salary_str == "Not specified":
        return None
    # Try to find numbers with k/K suffix or plain numbers
    match = re.search(r'([\d]+(?:[.,]\d+)?)\s*k', salary_str, re.IGNORECASE)
    if match:
        return float(match.group(1).replace(',', '')) * 1000
    # Try to find plain numbers
    match = re.search(r'([\d]+(?:[.,]\d+)?)', salary_str)
    if match:
        return float(match.group(1).replace(',', ''))
    return None


LANGUAGE_SKILLS = {
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
    "PHP", "Ruby", "Kotlin", "Swift", "Scala", "R", "Perl", "Lua", "Dart",
    "Bash", "Shell", "SQL", "MATLAB", "Objective-C"
}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/api/industry/top-skills", methods=["GET"])
def top_skills():
    """Return top N most in-demand skills across all scraped jobs."""
    n   = int(request.args.get("n", 15))
    df  = load_jobs()
    if df is None:
        return jsonify({"error": "No jobs data found. Run job_scraper.py first."}), 404

    counts = get_all_skills(df)
    top    = [{"skill": s, "count": c, "demand_score": round(c / len(df) * 100, 1)}
              for s, c in counts.most_common(n)]
    return jsonify({"total_jobs": len(df), "top_skills": top})


@app.route("/api/industry/skill-categories", methods=["GET"])
def skill_categories():
    """Return skill demand grouped by category."""
    df = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    # Merge all Skill_Categories JSON blobs
    category_counts: dict[str, Counter] = {}
    for raw in df.get("Skill_Categories", pd.Series(dtype=str)).fillna("{}"):
        try:
            cats = json.loads(raw)
        except Exception:
            continue
        for cat, skills in cats.items():
            if cat not in category_counts:
                category_counts[cat] = Counter()
            for s in skills:
                category_counts[cat][s] += 1

    result = {
        cat: [{"skill": s, "count": c} for s, c in counter.most_common()]
        for cat, counter in category_counts.items()
    }
    return jsonify(result)


@app.route("/api/industry/skill-gap", methods=["GET"])
def skill_gap():
    """
    Compare a student's skills against industry demand.
    Query param: student_skills=Python,React,Docker (comma-separated)
    """
    raw            = request.args.get("student_skills", "")
    student_skills = {s.strip() for s in raw.split(",") if s.strip()}

    df = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    counts     = get_all_skills(df)
    top_skills = {s for s, _ in counts.most_common(30)}

    matched   = sorted(top_skills & student_skills)
    missing   = sorted(top_skills - student_skills)
    extra     = sorted(student_skills - top_skills)

    match_pct = round(len(matched) / len(top_skills) * 100, 1) if top_skills else 0

    return jsonify({
        "match_percentage": match_pct,
        "matched_skills":   matched,
        "missing_skills":   missing[:10],   # top 10 gaps
        "extra_skills":     extra,
        "readiness_label":  (
            "High"   if match_pct >= 60 else
            "Medium" if match_pct >= 35 else
            "Low"
        ),
    })


@app.route("/api/industry/summary", methods=["GET"])
def summary():
    """High-level summary for the dashboard Overview card."""
    df = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    counts   = get_all_skills(df)
    top5     = [s for s, _ in counts.most_common(5)]
    avg_skills = df["Skills_Count"].mean()

    return jsonify({
        "total_jobs_analyzed": len(df),
        "unique_skills_found": len(counts),
        "average_skills_per_job": round(avg_skills, 1),
        "top_5_trending_skills": top5,
        "last_updated": df["Scraped_Date"].max() if "Scraped_Date" in df else "N/A",
    })


@app.route("/api/industry/jobs", methods=["GET"])
def list_jobs():
    """Return paginated list of scraped jobs."""
    page  = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    df    = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    start = (page - 1) * limit
    end   = start + limit
    rows  = df.iloc[start:end][["Job_ID", "Company", "Job_Title", "Detected_Skills", "Scraped_Date"]]
    return jsonify({
        "total":    len(df),
        "page":     page,
        "limit":    limit,
        "jobs":     rows.to_dict(orient="records"),
    })


@app.route("/api/industry/top-demanded-jobs", methods=["GET"])
def top_demanded_jobs():
    """Return top 5 most demanded job titles in IT field with avg salary and top skills."""
    df = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    # Get top 5 job titles by frequency
    job_counts = df["Job_Title"].value_counts().head(5)
    top_jobs = []

    for job_title, count in job_counts.items():
        job_df = df[df["Job_Title"] == job_title]

        # Calculate average salary
        salaries = [extract_salary_value(s) for s in job_df["Salary_Range"] if s]
        salaries = [s for s in salaries if s is not None]
        avg_salary = round(sum(salaries) / len(salaries), 0) if salaries else None

        # Get top skills for this job
        job_skills = []
        for skills_str in job_df["Detected_Skills"]:
            if skills_str.strip():
                job_skills.extend([s.strip() for s in skills_str.split(",") if s.strip()])
        skills_counter = Counter(job_skills)
        top_skills_for_job = [s for s, _ in skills_counter.most_common(10)]

        top_jobs.append({
            "job_title": job_title,
            "count": int(count),
            "avg_salary": avg_salary,
            "avg_salary_formatted": f"${avg_salary:,.0f}" if avg_salary else "Not specified",
            "top_skills": top_skills_for_job,
        })

    return jsonify({
        "total_jobs_analyzed": len(df),
        "top_5_demanded_jobs": top_jobs,
    })


@app.route("/api/industry/job-salaries", methods=["GET"])
def job_salaries():
    """Return average salary breakdown by job title."""
    df = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    job_counts = df["Job_Title"].value_counts().head(5)
    salary_breakdown = []

    for job_title, count in job_counts.items():
        job_df = df[df["Job_Title"] == job_title]
        salaries = [extract_salary_value(s) for s in job_df["Salary_Range"] if s]
        salaries = [s for s in salaries if s is not None]
        avg_salary = round(sum(salaries) / len(salaries), 0) if salaries else None

        salary_breakdown.append({
            "job_title": job_title,
            "count": int(count),
            "avg_salary": avg_salary,
            "salary_formatted": f"${avg_salary:,.0f}" if avg_salary else "Not specified",
            "salary_count": len(salaries),
        })

    return jsonify({
        "salary_breakdown": salary_breakdown,
    })


@app.route("/api/industry/top-languages", methods=["GET"])
def top_languages():
    """Return top 10 programming languages across top 5 demanded jobs."""
    df = load_jobs()
    if df is None:
        return jsonify({"error": "No data"}), 404

    # Filter to top 5 job titles
    job_counts = df["Job_Title"].value_counts().head(5)
    top_job_titles = set(job_counts.index)
    filtered_df = df[df["Job_Title"].isin(top_job_titles)]

    # Extract all skills from these filtered jobs
    all_skills = []
    for skills_str in filtered_df["Detected_Skills"]:
        if skills_str.strip():
            all_skills.extend([s.strip() for s in skills_str.split(",") if s.strip()])

    language_only = [skill for skill in all_skills if skill in LANGUAGE_SKILLS]
    skills_counter = Counter(language_only)
    top_10_skills = [
        {"skill": s, "count": c, "percentage": round(c / len(filtered_df) * 100, 1)}
        for s, c in skills_counter.most_common(10)
    ]

    return jsonify({
        "jobs_analyzed": int(len(filtered_df)),
        "top_10_languages": top_10_skills,
    })


@app.route("/health", methods=["GET"])
def health():
    df = load_jobs()
    return jsonify({
        "status": "ok",
        "jobs_in_db": len(df) if df is not None else 0,
        "csv_exists": CSV_FILE.exists() or CSV_FALLBACK_FILE.exists(),
    })


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("\n🚀  Industry Demand API running at http://localhost:5000")
    print("   Endpoints:")
    print("   GET /api/industry/top-skills?n=15")
    print("   GET /api/industry/skill-categories")
    print("   GET /api/industry/top-demanded-jobs   ← Top 5 jobs with salary & skills")
    print("   GET /api/industry/job-salaries         ← Average salary by job")
    print("   GET /api/industry/top-languages        ← Top 10 programming languages")
    print("   GET /api/industry/skill-gap?student_skills=Python,React")
    print("   GET /api/industry/summary")
    print("   GET /api/industry/jobs?page=1&limit=20")
    print("   GET /health\n")
    app.run(debug=True, port=5000)
