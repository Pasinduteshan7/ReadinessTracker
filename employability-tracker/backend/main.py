"""
FastAPI backend — serves employability analysis API.
Run with: uvicorn main:app --reload
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pathlib import Path
import shutil

from app.database import init_db, get_db, Student
from app.schemas import AnalyzeResponse, StudentSummary, StudentDetail, CohortStats
from app.services.pdf_parser import extract_text, clean_text
from app.services.extractor import extract_profile
from app.services.scoring import compute_readiness
from app.services.category_classifier import job_fit_scores, top_job_matches
from app.services.rag_engine import generate_recommendations
from app.services.cohort import student_ranking, cohort_leaderboard


# ============================================================
# APP SETUP
# ============================================================

app = FastAPI(
    title="Employability Readiness Tracker API",
    description="Analyze student resumes and predict industry readiness.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174",
                   "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def on_startup():
    init_db()
    print("✅ Database ready.")


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {"message": "Employability Tracker API", "docs": "/docs"}


# ============================================================
# POST /api/analyze — main pipeline (with UPSERT)
# ============================================================

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    safe_name = file.filename.replace(" ", "_")
    pdf_path = UPLOAD_DIR / safe_name
    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # 1. Parse + extract
        raw = clean_text(extract_text(str(pdf_path)))
        profile = extract_profile(raw)

        # 2. Score
        readiness = compute_readiness(profile)

        # 3. Job fit
        job_fit = job_fit_scores(profile)
        top_cat = list(job_fit.keys())[0]

        # 4. RAG recommendations
        recommendations = generate_recommendations(profile, top_cat)

        # 5. UPSERT — check existing by email (or name)
        email = profile.get("contact", {}).get("email")
        name = profile.get("name")

        existing = None
        if email:
            existing = db.query(Student).filter(Student.email == email).first()
        if not existing and name and name != "Unknown":
            existing = db.query(Student).filter(Student.name == name).first()

        if existing:
            existing.name = name
            existing.email = email
            existing.linkedin = profile.get("contact", {}).get("linkedin")
            existing.github = profile.get("contact", {}).get("github")
            existing.pdf_filename = safe_name
            existing.profile_json = profile
            existing.readiness = readiness
            existing.job_fit = job_fit
            existing.recommendations = recommendations
            existing.total_score = readiness["total"]
            db.commit()
            db.refresh(existing)
            student = existing
        else:
            student = Student(
                name=name,
                email=email,
                linkedin=profile.get("contact", {}).get("linkedin"),
                github=profile.get("contact", {}).get("github"),
                pdf_filename=safe_name,
                profile_json=profile,
                readiness=readiness,
                job_fit=job_fit,
                recommendations=recommendations,
                total_score=readiness["total"],
            )
            db.add(student)
            db.commit()
            db.refresh(student)

        return {
            "student_id": student.id,
            "profile": profile,
            "readiness": readiness,
            "job_fit": job_fit,
            "recommendations": recommendations,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ============================================================
# GET /api/students
# ============================================================

@app.get("/api/students", response_model=list[StudentSummary])
def list_students(db: Session = Depends(get_db)):
    students = db.query(Student).order_by(desc(Student.total_score)).all()
    out = []
    for s in students:
        top_cat = None
        if s.job_fit:
            top_cat = list(s.job_fit.keys())[0] if s.job_fit else None
        out.append(StudentSummary(
            id=s.id,
            name=s.name,
            email=s.email,
            total_score=s.total_score or 0.0,
            level=s.readiness.get("level", "Unknown") if s.readiness else "Unknown",
            top_category=top_cat,
            created_at=s.created_at.isoformat() if s.created_at else "",
        ))
    return out


# ============================================================
# GET /api/students/{id}
# ============================================================

@app.get("/api/students/{student_id}", response_model=StudentDetail)
def get_student(student_id: int, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    return StudentDetail(
        id=s.id,
        name=s.name,
        email=s.email,
        linkedin=s.linkedin,
        github=s.github,
        profile=s.profile_json or {},
        readiness=s.readiness or {},
        job_fit=s.job_fit or {},
        recommendations=s.recommendations or {},
        created_at=s.created_at.isoformat() if s.created_at else "",
    )


# ============================================================
# GET /api/cohort-stats
# ============================================================

@app.get("/api/cohort-stats", response_model=CohortStats)
def cohort_stats(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    if not students:
        return CohortStats(
            total_students=0, avg_score=0, median_score=0,
            top_score=0, bottom_score=0,
            score_distribution={}, category_distribution={}
        )

    scores = sorted([s.total_score or 0.0 for s in students])
    n = len(scores)

    buckets = {"0-40": 0, "40-60": 0, "60-80": 0, "80-100": 0}
    for sc in scores:
        if sc < 40:   buckets["0-40"] += 1
        elif sc < 60: buckets["40-60"] += 1
        elif sc < 80: buckets["60-80"] += 1
        else:         buckets["80-100"] += 1

    cat_dist = {}
    for s in students:
        if s.job_fit:
            top = list(s.job_fit.keys())[0]
            cat_dist[top] = cat_dist.get(top, 0) + 1

    median = scores[n // 2] if n % 2 else (scores[n // 2 - 1] + scores[n // 2]) / 2

    return CohortStats(
        total_students=n,
        avg_score=round(sum(scores) / n, 2),
        median_score=round(median, 2),
        top_score=round(max(scores), 2),
        bottom_score=round(min(scores), 2),
        score_distribution=buckets,
        category_distribution=cat_dist,
    )


# ============================================================
# GET /api/leaderboard
# ============================================================

@app.get("/api/leaderboard")
def leaderboard(db: Session = Depends(get_db)):
    return cohort_leaderboard(db)


# ============================================================
# GET /api/students/{id}/ranking
# ============================================================

@app.get("/api/students/{student_id}/ranking")
def student_ranking_endpoint(student_id: int, db: Session = Depends(get_db)):
    result = student_ranking(student_id, db)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ============================================================
# DELETE /api/students/{id}
# ============================================================

@app.delete("/api/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(s)
    db.commit()
    return {"status": "deleted", "student_id": student_id}