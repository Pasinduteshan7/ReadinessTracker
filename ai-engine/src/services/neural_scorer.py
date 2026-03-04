import logging
from typing import List, Dict, Any
from src.utils.ollama_client import OllamaClient
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class NeuralScorer:
    QUALITY_WEIGHT = 0.4
    ALGORITHM_WEIGHT = 0.3
    AI_PENALTY_WEIGHT = 0.3
    @staticmethod
    def calculate_final_score(
        quality_scores: List[float],
        ai_penalty: float,
        algorithm_score: float
    ) -> Dict[str, float]:
        if not quality_scores:
            return {
                "final_score": 0.5,
                "quality_component": 0.0,
                "algorithm_component": 0.0,
                "ai_penalty_component": 0.0
            }
        avg_quality = sum(quality_scores) / len(quality_scores)
        avg_quality = max(0, min(1, avg_quality))
        algorithm_score = max(0, min(1, algorithm_score))
        ai_penalty = max(0, min(1, ai_penalty))
        quality_component = avg_quality * NeuralScorer.QUALITY_WEIGHT
        algorithm_component = algorithm_score * NeuralScorer.ALGORITHM_WEIGHT
        ai_penalty_component = ai_penalty * NeuralScorer.AI_PENALTY_WEIGHT
        final_score = quality_component + algorithm_component - ai_penalty_component
        final_score = max(0, min(1, final_score))
        return {
            "final_score": final_score,
            "quality_component": quality_component,
            "algorithm_component": algorithm_component,
            "ai_penalty_component": ai_penalty_component,
            "breakdown": {
                "quality": avg_quality,
                "algorithm": algorithm_score,
                "ai_penalty": ai_penalty,
                "weights": {
                    "quality": NeuralScorer.QUALITY_WEIGHT,
                    "algorithm": NeuralScorer.ALGORITHM_WEIGHT,
                    "ai_penalty": NeuralScorer.AI_PENALTY_WEIGHT
                }
            }
        }
    @staticmethod
    def calculate_percentile(score: float, all_scores: List[float]) -> float:
        if not all_scores:
            return 50.0
        count_below = sum(1 for s in all_scores if s < score)
        percentile = (count_below / len(all_scores)) * 100
        return percentile
    @staticmethod
    def score_with_llm(
        quality_avg: float,
        ai_penalty: float,
        algorithm_score: float
    ) -> float:
        try:
            return ollama.calculate_neural_score(quality_avg, ai_penalty, algorithm_score)
        except Exception as e:
            logger.warning(f"Error calculating score with LLM: {str(e)}, using default formula")
            return (quality_avg * 0.4) + (algorithm_score * 0.3) - (ai_penalty * 0.3)
