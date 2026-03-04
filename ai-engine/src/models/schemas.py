from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
class Repository(BaseModel):
    name: str
    url: str
    description: Optional[str] = None
    language: str
    stars: int = 0
    forks: int = 0
    code: str = ""
class RepositoryStats(BaseModel):
    total: int
    public: int
    private: int
    total_stars: int
    total_forks: int
    top_language: str
class RepoQualityAnalysis(BaseModel):
    repo_name: str
    code_quality_score: float
    complexity_score: float
    documentation_score: float
    testing_score: float
    maintainability_score: float
class AIDetectionSignals(BaseModel):
    repetitive_patterns: float
    unusual_commit_history: float
    low_variation_score: float
    generic_naming_patterns: float
class AIDetectionResult(BaseModel):
    repo_name: str
    ai_likelihood_score: float
    confidence: float
    signals: AIDetectionSignals
    warning_message: Optional[str]
class NeuralNetworkInput(BaseModel):
    repo_quality_scores: List[float]
    ai_penalty: float
    algorithm_score: float
class NeuralNetworkOutput(BaseModel):
    final_score: float
    components: Dict[str, float]
class AnalysisRequest(BaseModel):
    github_username: str
    user_id: int
class FetchReposRequest(BaseModel):
    username: str
class QualityAnalysisRequest(BaseModel):
    repositories: List[Repository]
class AIDetectionRequest(BaseModel):
    repositories: List[Repository]
class NeuralScoringRequest(BaseModel):
    quality_scores: List[float]
    ai_penalty: float
    algorithm_score: float
