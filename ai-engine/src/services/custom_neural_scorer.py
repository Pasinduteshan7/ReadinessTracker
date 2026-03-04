import logging
from typing import List, Dict, Any
from src.config.settings import settings
logger = logging.getLogger(__name__)
class CustomNeuralScorer:
    REPO_QUALITY_7B_WEIGHT = 0.35
    REPO_QUALITY_3B_WEIGHT = 0.25
    AI_DETECTION_WEIGHT = 0.25
    DOCUMENTATION_WEIGHT = 0.08
    SECURITY_WEIGHT = 0.05
    EDGE_CASES_WEIGHT = 0.02
    @staticmethod
    def calculate_final_score(
        repo_quality_7b: float,
        repo_quality_3b: float,
        ai_detection_penalty: float,
        documentation: float = 0.5,
        security: float = 0.5,
        edge_cases: float = 0.0
    ) -> Dict[str, Any]:
        repo_quality_7b = max(0, min(1, repo_quality_7b))
        repo_quality_3b = max(0, min(1, repo_quality_3b))
        ai_detection_penalty = max(0, min(1, ai_detection_penalty))
        documentation = max(0, min(1, documentation))
        security = max(0, min(1, security))
        edge_cases = max(0, min(1, edge_cases))
        quality_7b_component = repo_quality_7b * CustomNeuralScorer.REPO_QUALITY_7B_WEIGHT
        quality_3b_component = repo_quality_3b * CustomNeuralScorer.REPO_QUALITY_3B_WEIGHT
        ai_penalty_component = ai_detection_penalty * CustomNeuralScorer.AI_DETECTION_WEIGHT
        doc_component = documentation * CustomNeuralScorer.DOCUMENTATION_WEIGHT
        sec_component = security * CustomNeuralScorer.SECURITY_WEIGHT
        edge_component = edge_cases * CustomNeuralScorer.EDGE_CASES_WEIGHT
        final_score = (
            quality_7b_component +
            quality_3b_component +
            - ai_penalty_component +
            doc_component +
            sec_component +
            edge_component
        )
        final_score = max(0, min(1, final_score))
        return {
            "final_score": final_score,
            "percentage": round(final_score * 100, 1),
            "components": {
                "repo_quality_7b": quality_7b_component,
                "repo_quality_3b": quality_3b_component,
                "ai_penalty": ai_penalty_component,
                "documentation": doc_component,
                "security": sec_component,
                "edge_cases": edge_component
            },
            "breakdown": {
                "repo_quality_7b_score": repo_quality_7b,
                "repo_quality_3b_score": repo_quality_3b,
                "ai_detection_penalty": ai_detection_penalty,
                "documentation_quality": documentation,
                "security_concerns": security,
                "edge_cases_score": edge_cases,
                "weights": {
                    "repo_quality_7b": CustomNeuralScorer.REPO_QUALITY_7B_WEIGHT,
                    "repo_quality_3b": CustomNeuralScorer.REPO_QUALITY_3B_WEIGHT,
                    "ai_detection": CustomNeuralScorer.AI_DETECTION_WEIGHT,
                    "documentation": CustomNeuralScorer.DOCUMENTATION_WEIGHT,
                    "security": CustomNeuralScorer.SECURITY_WEIGHT,
                    "edge_cases": CustomNeuralScorer.EDGE_CASES_WEIGHT,
                }
            },
            "models_used": {
                "quality_primary": "codellama:7b",
                "quality_secondary": "qwen2.5-coder:3b",
                "ai_detection": "deepseek-coder:1.3b"
            }
        }
    @staticmethod
    def calculate_percentile(score: float, all_scores: List[float]) -> float:
        if not all_scores:
            return 50.0
        count_below = sum(1 for s in all_scores if s < score)
        percentile = (count_below / len(all_scores)) * 100
        return percentile
