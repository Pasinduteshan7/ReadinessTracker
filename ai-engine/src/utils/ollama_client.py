import requests
import json
import logging
from typing import List, Dict, Any
from src.config.settings import settings
logger = logging.getLogger(__name__)
class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_HOST
        self.model_quality_primary = settings.MODEL_QUALITY_PRIMARY
        self.model_quality_secondary = settings.MODEL_QUALITY_SECONDARY
        self.model_ai_detect = settings.MODEL_AI_DETECT
        self.model_algorithm = settings.MODEL_ALGORITHM
        self.model_7b = self.model_quality_primary
        self.model_3b = self.model_ai_detect
    def generate(self, prompt: str, model: str = None, temperature: float = 0.7) -> str:
        if model is None:
            model = self.model_7b
        try:
            url = f"{self.base_url}/api/generate"
            payload = {
                "model": model,
                "prompt": prompt,
                "temperature": temperature,
                "stream": False
            }
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama API error: {str(e)}")
            raise Exception(f"Failed to connect to Ollama: {str(e)}")
    def analyze_code_quality(self, code: str) -> Dict[str, float]:
        prompt = f
        try:
            response = self.generate(prompt, model=self.model_quality_primary)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                scores = json.loads(json_str)
                return {
                    "quality": float(scores.get("quality", 0.5)),
                    "complexity": float(scores.get("complexity", 0.5)),
                    "documentation": float(scores.get("documentation", 0.5)),
                    "testing": float(scores.get("testing", 0.5)),
                    "maintainability": float(scores.get("maintainability", 0.5))
                }
        except Exception as e:
            logger.warning(f"Error analyzing code quality: {str(e)}")
        return {
            "quality": 0.5,
            "complexity": 0.5,
            "documentation": 0.5,
            "testing": 0.5,
            "maintainability": 0.5
        }
    def detect_ai_patterns(self, code: str) -> Dict[str, Any]:
        prompt = f
        try:
            response = self.generate(prompt, model=self.model_ai_detect, temperature=0.3)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                result = json.loads(json_str)
                return {
                    "repetitive_patterns": float(result.get("repetitive_patterns", 0.3)),
                    "unusual_history": float(result.get("unusual_history", 0.2)),
                    "low_variation": float(result.get("low_variation", 0.3)),
                    "generic_naming": float(result.get("generic_naming", 0.2)),
                    "ai_likelihood": float(result.get("ai_likelihood", 0.25))
                }
        except Exception as e:
            logger.warning(f"Error detecting AI patterns: {str(e)}")
        return {
            "repetitive_patterns": 0.2,
            "unusual_history": 0.1,
            "low_variation": 0.2,
            "generic_naming": 0.1,
            "ai_likelihood": 0.15
        }
    def calculate_neural_score(self, quality_avg: float, ai_penalty: float, algorithm_score: float) -> float:
        prompt = f
        try:
            response = self.generate(prompt, model=self.model_algorithm, temperature=0.1)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                result = json.loads(json_str)
                return float(result.get("final_score", 0.5))
        except Exception as e:
            logger.warning(f"Error calculating neural score: {str(e)}")
        return (quality_avg * 0.4) + (algorithm_score * 0.3) - (ai_penalty * 0.3)
