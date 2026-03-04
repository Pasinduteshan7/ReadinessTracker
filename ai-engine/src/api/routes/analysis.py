import logging
from typing import List
from fastapi import APIRouter, HTTPException
from src.models.schemas import (
    FetchReposRequest, QualityAnalysisRequest, AIDetectionRequest,
    NeuralScoringRequest, Repository, RepoQualityAnalysis, AIDetectionResult
)
from src.services.repo_analyzer import RepositoryAnalyzer
from src.services.ai_detector import AIDetector
from src.services.neural_scorer import NeuralScorer
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analyze", tags=["Analysis"])
@router.post("/fetch-repos")
async def fetch_repositories(request: FetchReposRequest):
    try:
        logger.info(f"Fetching repos for user: {request.username}")
        return {
            "username": request.username,
            "status": "ready_for_analysis",
            "message": "Repositories fetched successfully"
        }
    except Exception as e:
        logger.error(f"Error fetching repositories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/quality")
async def analyze_quality(request: QualityAnalysisRequest):
    try:
        logger.info(f"Analyzing quality for {len(request.repositories)} repositories")
        analyses: List[RepoQualityAnalysis] = []
        for repo in request.repositories:
            analysis = RepositoryAnalyzer.analyze_repository(repo)
            analyses.append(analysis)
        avg_metrics = RepositoryAnalyzer.calculate_average_quality(analyses)
        return {
            "repositories": [dict(a) for a in analyses],
            "average_metrics": avg_metrics,
            "status": "completed"
        }
    except Exception as e:
        logger.error(f"Error analyzing quality: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/ai-detection")
async def detect_ai_patterns(request: AIDetectionRequest):
    try:
        logger.info(f"Detecting AI patterns in {len(request.repositories)} repositories")
        detections: List[AIDetectionResult] = []
        for repo in request.repositories:
            detection = AIDetector.detect_ai_code(repo)
            detections.append(detection)
        avg_penalty = AIDetector.calculate_average_ai_penalty(detections)
        return {
            "repositories": [dict(d) for d in detections],
            "average_ai_penalty": avg_penalty,
            "status": "completed"
        }
    except Exception as e:
        logger.error(f"Error detecting AI patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
