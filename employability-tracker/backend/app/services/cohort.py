"""
Cohort Ranking — percentile + rank calculations against all analyzed students.
"""
import numpy as np
from sqlalchemy.orm import Session
from app.database import Student


def _percentile(value: float, all_values: list[float]) -> float:
    """What % of the cohort is BELOW this value."""
    if not all_values:
        return 0.0
    arr = np.array(all_values)
    return round(float((arr < value).mean() * 100), 1)


def student_ranking(student_id: int, db: Session) -> dict:
    """
    Returns percentile + rank + dimension-wise breakdown for one student.
    """
    all_students = db.query(Student).all()
    if not all_students:
        return {"error": "No students in cohort"}

    target = next((s for s in all_students if s.id == student_id), None)
    if not target:
        return {"error": f"Student {student_id} not found"}

    # ---- Overall score ranking ----
    all_scores = [s.total_score or 0.0 for s in all_students]
    my_score = target.total_score or 0.0
    rank = sorted(all_scores, reverse=True).index(my_score) + 1

    result = {
        "student_id": student_id,
        "name": target.name,
        "total_score": my_score,
        "rank": rank,
        "cohort_size": len(all_students),
        "overall_percentile": _percentile(my_score, all_scores),
        "cohort_avg": round(float(np.mean(all_scores)), 2),
        "dimension_percentile": {},
        "dimension_vs_avg": {},
    }

    # ---- Dimension-wise percentile ----
    dims = ["skills", "projects", "certifications",
            "experience", "education", "extras"]

    my_breakdown = (target.readiness or {}).get("breakdown", {})

    for dim in dims:
        all_dim_values = [
            (s.readiness or {}).get("breakdown", {}).get(dim, 0.0)
            for s in all_students
        ]
        my_val = my_breakdown.get(dim, 0.0)

        result["dimension_percentile"][dim] = _percentile(my_val, all_dim_values)
        avg = float(np.mean(all_dim_values)) if all_dim_values else 0.0
        result["dimension_vs_avg"][dim] = {
            "student": round(my_val, 2),
            "cohort_avg": round(avg, 2),
            "delta": round(my_val - avg, 2),
        }

    return result


def cohort_leaderboard(db: Session, limit: int = 50) -> list[dict]:
    """Sorted leaderboard of all students."""
    students = (db.query(Student)
                .order_by(Student.total_score.desc())
                .limit(limit).all())
    return [
        {
            "rank": i + 1,
            "id": s.id,
            "name": s.name,
            "total_score": s.total_score or 0.0,
            "level": (s.readiness or {}).get("level", "Unknown"),
            "top_category": (list(s.job_fit.keys())[0]
                             if s.job_fit else None),
        }
        for i, s in enumerate(students)
    ]


# ============================================================
# CLI TEST
# ============================================================

if __name__ == "__main__":
    import json
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        leaderboard = cohort_leaderboard(db)
        print("\n🏆 COHORT LEADERBOARD")
        print("=" * 60)
        for row in leaderboard:
            print(f"  #{row['rank']}  {row['name']:25s}  "
                  f"{row['total_score']:5.2f}  {row['level']}")

        print("\n📊 PERCENTILE DETAIL (first student)")
        if leaderboard:
            detail = student_ranking(leaderboard[0]["id"], db)
            print(json.dumps(detail, indent=2, ensure_ascii=False))
    finally:
        db.close()