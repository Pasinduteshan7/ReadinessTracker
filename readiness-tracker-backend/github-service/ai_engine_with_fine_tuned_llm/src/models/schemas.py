"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class AnalysisRequest(BaseModel):
    """Request to analyze GitHub user"""
    github_username: str
    github_token: str
    user_id: Optional[str] = None
    max_repos: Optional[int] = 3

class RepositoryScores(BaseModel):
    """Scores for a single repository"""
    code_quality: float
    architecture: float
    documentation: float
    testing: float
    best_practices: float
    summary: str
    strengths: List[str]
    improvements: List[str]

class RepositoryAnalysis(BaseModel):
    """Analysis of single repository"""
    repo_name: str
    repo_url: str
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    scores: RepositoryScores
    overall_repo_score: float

class BackgroundAnalysis(BaseModel):
    """Background analysis of user's GitHub account"""
    github_username: str
    public_repos_count: int
    followers: int
    following: int
    account_created_at: Optional[str]
    last_activity: Optional[str]
    authenticity_score: float
    substance_score: float
    community_score: float
    activity_score: float
    diversity_score: float
    background_overall_score: float

class SelectionRationale(BaseModel):
    """Why certain repos were selected"""
    total_repos_found: int
    selected_repos_count: int
    selection_criteria: Dict[str, str]
    selected_repo_names: List[str]

class AnalysisResult(BaseModel):
    """Complete analysis result"""
    # Identifiers
    user_id: Optional[str] = None
    github_username: str
    
    # Engine metadata
    engine_version: str
    model_name: str
    
    # Analysis data
    background_analysis: Dict
    selected_repositories: List[str]
    selection_rationale: Dict
    deep_analysis_results: List[Dict]
    
    # Final scores
    overall_score: float
    code_quality_score: float
    architecture_score: float
    documentation_score: float
    testing_score: float
    best_practices_score: float
    
    # Employability metrics
    employability_percentile: float
    employability_tier: str
    professional_readiness: float
    growth_potential: float
    recommended_level: str
    
    # Metadata
    analysis_duration_seconds: float
    status: str
    error_message: Optional[str] = None
    created_at: datetime = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class ComparisonResponse(BaseModel):
    """Response for engine comparison"""
    github_username: str
    fine_tuned_result: Optional[Dict]
    created_at: Optional[datetime]
