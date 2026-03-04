import logging
from typing import List, Dict, Any
from src.models.schemas import Repository, AIDetectionResult, AIDetectionSignals
from src.utils.ollama_client import OllamaClient
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class AIDetector:
    @staticmethod
    def detect_ai_code(repo: Repository) -> AIDetectionResult:
        try:
            signals_data = ollama.detect_ai_patterns(repo.code)
            signals = AIDetectionSignals(
                repetitive_patterns=signals_data.get("repetitive_patterns", 0.2),
                unusual_commit_history=signals_data.get("unusual_history", 0.1),
                low_variation_score=signals_data.get("low_variation", 0.2),
                generic_naming_patterns=signals_data.get("generic_naming", 0.1)
            )
            ai_score = signals_data.get("ai_likelihood", 0.15)
            warning = None
            if ai_score > 0.7:
                warning = "HIGH: Code shows strong AI generation patterns"
            elif ai_score > 0.5:
                warning = "MEDIUM: Some AI patterns detected"
            return AIDetectionResult(
                repo_name=repo.name,
                ai_likelihood_score=ai_score,
                confidence=0.85,
                signals=signals,
                warning_message=warning
            )
        except Exception as e:
            logger.error(f"Error detecting AI in repo {repo.name}: {str(e)}")
            return AIDetectionResult(
                repo_name=repo.name,
                ai_likelihood_score=0.15,
                confidence=0.5,
                signals=AIDetectionSignals(
                    repetitive_patterns=0.2,
                    unusual_commit_history=0.1,
                    low_variation_score=0.2,
                    generic_naming_patterns=0.1
                ),
                warning_message=None
            )
    @staticmethod
    def detect_ai_in_repositories(repositories: List[Repository]) -> List[AIDetectionResult]:
        results = []
        for repo in repositories:
            detection = AIDetector.detect_ai_code(repo)
            results.append(detection)
        return results
    @staticmethod
    def calculate_average_ai_penalty(detections: List[AIDetectionResult]) -> float:
        if not detections:
            return 0.0
        total_score = sum(d.ai_likelihood_score for d in detections)
        return total_score / len(detections)
