"""
Pydantic schemas — request/response models for FastAPI.
"""
from pydantic import BaseModel
from typing import Optional, Any


class StudentSummary(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    total_score: float
    level: str
    top_category: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class StudentDetail(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    profile: dict
    readiness: dict
    job_fit: dict
    recommendations: dict
    created_at: str


class AnalyzeResponse(BaseModel):
    student_id: int
    profile: dict
    readiness: dict
    job_fit: dict
    recommendations: dict


class CohortStats(BaseModel):
    total_students: int
    avg_score: float
    median_score: float
    top_score: float
    bottom_score: float
    score_distribution: dict     # {"0-40": n, "40-60": n, ...}
    category_distribution: dict  # {"AI/ML": n, "Web": n, ...}