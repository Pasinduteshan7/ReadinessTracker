import logging
import json
from src.models.schemas import AlgorithmAnalysisResult
from src.utils.ollama_client import OllamaClient
from src.config.settings import settings
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class AlgorithmAnalyzer:
    @staticmethod
    def analyze_algorithm(algorithm_code: str, language: str = "python") -> dict:
        prompt = f"""Analyze this {language} algorithm code and provide JSON scores (0-1):
{algorithm_code}

Return JSON: {{"time_complexity": 0.X, "space_complexity": 0.X, "clarity": 0.X, "error_handling": 0.X, "optimization": 0.X}}
Only JSON, no other text."""
        try:
            response = ollama.generate(prompt, model=settings.MODEL_ALGORITHM, temperature=0.3)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                scores = json.loads(json_str)
                algo_quality = (
                    float(scores.get("time_complexity", 0.5)) * 0.25 +
                    float(scores.get("space_complexity", 0.5)) * 0.25 +
                    float(scores.get("clarity", 0.5)) * 0.2 +
                    float(scores.get("error_handling", 0.5)) * 0.15 +
                    float(scores.get("optimization", 0.5)) * 0.15
                )
                return {
                    "algorithm_quality": float(algo_quality),
                    "time_complexity": float(scores.get("time_complexity", 0.5)),
                    "space_complexity": float(scores.get("space_complexity", 0.5)),
                    "clarity": float(scores.get("clarity", 0.5)),
                    "error_handling": float(scores.get("error_handling", 0.5)),
                    "optimization": float(scores.get("optimization", 0.5))
                }
        except Exception as e:
            logger.warning(f"Error analyzing algorithm: {str(e)}")
        return {
            "algorithm_quality": 0.5,
            "time_complexity": 0.5,
            "space_complexity": 0.5,
            "clarity": 0.5,
            "error_handling": 0.5,
            "optimization": 0.5
        }
