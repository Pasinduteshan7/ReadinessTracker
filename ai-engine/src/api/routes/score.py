import logging
from typing import List
from fastapi import APIRouter, HTTPException
from src.models.schemas import NeuralScoringRequest
from src.services.neural_scorer import NeuralScorer
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/score", tags=["Scoring"])
@router.post("/neural-network")
async def calculate_neural_score(request: NeuralScoringRequest):
    try:
        logger.info("Calculating neural network score")
        result = NeuralScorer.calculate_final_score(
            quality_scores=request.quality_scores,
            ai_penalty=request.ai_penalty,
            algorithm_score=request.algorithm_score
        )
        return {
            "final_score": result["final_score"],
            "components": {
                "quality": result["quality_component"],
                "algorithm": result["algorithm_component"],
                "ai_penalty": result["ai_penalty_component"]
            },
            "breakdown": result["breakdown"],
            "status": "completed"
        }
    except Exception as e:
        logger.error(f"Error calculating neural score: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Engine",
        "version": "1.0.0"
    }
