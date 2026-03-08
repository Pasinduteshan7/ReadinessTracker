"""
FastAPI routes for 4-phase algorithm evaluation pipeline
Provides endpoints for submitting code solutions for evaluation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import logging

from ...models.algorithm_evaluator import AlgorithmEvaluator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/algorithm", tags=["algorithm_evaluation"])

# Initialize the evaluator (singleton)
evaluator = AlgorithmEvaluator()


class TestResult(BaseModel):
    """Test case result"""
    passed: int = 0
    total: int = 0


class SubmissionRequest(BaseModel):
    """Algorithm submission for evaluation"""
    code: str
    problem_description: str
    language: str = "python"
    test_results: TestResult = TestResult()


class EvaluationResponse(BaseModel):
    """Evaluation result response"""
    final_score: float
    test_score: float
    llm_quality_score: float
    phase_scores: Dict[str, int]
    llm_statistics: Dict
    detailed_feedback: str


@router.post("/evaluate")
async def evaluate_submission(request: SubmissionRequest) -> Dict:
    """
    Evaluate an algorithm submission using 4-phase analysis
    
    Request:
    {
        "code": "def solution(nums):\n    return nums",
        "problem_description": "Reverse array...",
        "language": "python",
        "test_results": {
            "passed": 5,
            "total": 6
        }
    }
    
    Response:
    {
        "final_score": 82.5,
        "test_score": 83.3,
        "llm_quality_score": 82.0,
        "phase_scores": {
            "phase1_architecture": 85,
            "phase2_correctness": 83,
            "phase3_efficiency": 92,
            "phase4_reasoning": 75
        },
        "llm_statistics": {
            "median": 82.0,
            "mean": 83.75,
            "std_dev": 6.25,
            "confidence": 87.5
        },
        "detailed_feedback": "..."
    }
    """
    
    try:
        logger.info(f"New evaluation request - Language: {request.language}, Code length: {len(request.code)}")
        
        # Run evaluation
        result = evaluator.evaluate_submission(
            code=request.code,
            problem_description=request.problem_description,
            language=request.language,
            test_results={
                'passed': request.test_results.passed,
                'total': request.test_results.total
            }
        )
        
        # Generate detailed feedback
        feedback = evaluator.get_detailed_feedback(result)
        
        # Return response
        response = {
            "final_score": result['final_score'],
            "test_score": result['test_score'],
            "llm_quality_score": result['llm_quality_score'],
            "phase_scores": result['phase_scores'],
            "llm_statistics": result['llm_statistics'],
            "detailed_feedback": feedback,
            "weights": result['weights']
        }
        
        logger.info(f"Evaluation complete - Final Score: {result['final_score']}/100")
        
        return response
        
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@router.get("/health")
async def health_check() -> Dict:
    """Check if algorithm evaluation service is healthy"""
    
    return {
        "status": "healthy",
        "service": "Algorithm Evaluation Engine",
        "phases": 4,
        "models": [
            {"phase": 1, "model": "codellama:7b", "purpose": "Architecture Analysis"},
            {"phase": 2, "model": "qwen2.5-coder:3b", "purpose": "Correctness Analysis"},
            {"phase": 3, "model": "deepseek-coder:1.3b", "purpose": "Efficiency Analysis"},
            {"phase": 4, "model": "deepseek-r1:1.5b", "purpose": "Reasoning Analysis"}
        ],
        "scoring": "MEDIAN of 4 phase scores",
        "weights": {
            "test_cases": "40%",
            "llm_quality": "60%"
        }
    }
