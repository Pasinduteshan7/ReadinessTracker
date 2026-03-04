import logging
from typing import List, Dict, Tuple
from src.models.schemas import Repository, RepoQualityAnalysis
from src.services.repo_analyzer import RepositoryAnalyzer
from src.utils.ollama_client import OllamaClient
from src.config.settings import settings
import json
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class DualAnalyzer:
    @staticmethod
    def analyze_with_codellama(repo: Repository) -> Dict[str, float]:
        prompt = f
        try:
            response = ollama.generate(prompt, model=settings.MODEL_QUALITY_PRIMARY, temperature=0.5)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                scores = json.loads(json_str)
                return {
                    "model": "codellama:7b",
                    "quality": float(scores.get("quality", 0.5)),
                    "architecture": float(scores.get("architecture", 0.5)),
                    "documentation": float(scores.get("documentation", 0.5)),
                    "error_handling": float(scores.get("error_handling", 0.5)),
                    "testing": float(scores.get("testing", 0.5))
                }
        except Exception as e:
            logger.warning(f"CodeLlama analysis error: {str(e)}")
        return {
            "model": "codellama:7b",
            "quality": 0.5,
            "architecture": 0.5,
            "documentation": 0.5,
            "error_handling": 0.5,
            "testing": 0.5
        }
    @staticmethod
    def analyze_with_qwen(repo: Repository) -> Dict[str, float]:
        prompt = f
        try:
            response = ollama.generate(prompt, model=settings.MODEL_QUALITY_SECONDARY, temperature=0.5)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                scores = json.loads(json_str)
                return {
                    "model": "qwen2.5-coder:3b",
                    "readability": float(scores.get("readability", 0.5)),
                    "performance": float(scores.get("performance", 0.5)),
                    "maintainability": float(scores.get("maintainability", 0.5)),
                    "security": float(scores.get("security", 0.5)),
                    "standards": float(scores.get("standards", 0.5))
                }
        except Exception as e:
            logger.warning(f"Qwen analysis error: {str(e)}")
        return {
            "model": "qwen2.5-coder:3b",
            "readability": 0.5,
            "performance": 0.5,
            "maintainability": 0.5,
            "security": 0.5,
            "standards": 0.5
        }
    @staticmethod
    def analyze_repository_with_model(repo: Repository, model_type: str) -> Dict[str, float]:
        if model_type == "codellama":
            return DualAnalyzer.analyze_with_codellama(repo)
        elif model_type == "qwen":
            return DualAnalyzer.analyze_with_qwen(repo)
        return {}
    @staticmethod
    def analyze_repositories_deep(repositories: List[Repository]) -> List[Dict[str, any]]:
        if not repositories:
            return []
        logger.info(f"🔴 PHASE 1: Analyzing {len(repositories)} repos with CodeLlama:7b...")
        codellama_results = {}
        for i, repo in enumerate(repositories, 1):
            logger.info(f"  [{i}/{len(repositories)}] CodeLlama analyzing: {repo.name}")
            codellama_scores = DualAnalyzer.analyze_with_codellama(repo)
            codellama_results[repo.name] = codellama_scores
        logger.info(f"🟢 PHASE 2: Analyzing {len(repositories)} repos with Qwen:3b...")
        qwen_results = {}
        for i, repo in enumerate(repositories, 1):
            logger.info(f"  [{i}/{len(repositories)}] Qwen analyzing: {repo.name}")
            qwen_scores = DualAnalyzer.analyze_with_qwen(repo)
            qwen_results[repo.name] = qwen_scores
        results = []
        for repo in repositories:
            codellama_scores = codellama_results.get(repo.name, {})
            qwen_scores = qwen_results.get(repo.name, {})
            def calc_overall(model1_scores: Dict, model2_scores: Dict) -> float:
                values_m1 = [v for k, v in model1_scores.items() if k != "model" and isinstance(v, (int, float))]
                values_m2 = [v for k, v in model2_scores.items() if k != "model" and isinstance(v, (int, float))]
                avg_m1 = sum(values_m1) / len(values_m1) if values_m1 else 0.5
                avg_m2 = sum(values_m2) / len(values_m2) if values_m2 else 0.5
                return (avg_m1 + avg_m2) / 2
            overall_quality = calc_overall(codellama_scores, qwen_scores)
            results.append({
                "repo_name": repo.name,
                "overall_quality": overall_quality,
                "codellama": codellama_scores,
                "qwen": qwen_scores,
                "combined": {
                    "quality_avg": (
                        (codellama_scores.get("quality", 0.5) + qwen_scores.get("readability", 0.5)) / 2
                    ),
                    "architecture_quality": codellama_scores.get("architecture", 0.5),
                    "performance": qwen_scores.get("performance", 0.5),
                    "documentation": codellama_scores.get("documentation", 0.5),
                    "security": qwen_scores.get("security", 0.5),
                    "maintainability": qwen_scores.get("maintainability", 0.5),
                }
            })
        logger.info(f"✅ Analysis complete: {len(results)} repos analyzed")
        return results
    @staticmethod
    def calculate_combined_repo_quality(analyses: List[Dict[str, any]]) -> Dict[str, float]:
        if not analyses:
            return {}
        quality_avg = sum(a["overall_quality"] for a in analyses) / len(analyses)
        architecture_avg = sum(a["combined"]["architecture_quality"] for a in analyses) / len(analyses)
        performance_avg = sum(a["combined"]["performance"] for a in analyses) / len(analyses)
        documentation_avg = sum(a["combined"]["documentation"] for a in analyses) / len(analyses)
        security_avg = sum(a["combined"]["security"] for a in analyses) / len(analyses)
        maintainability_avg = sum(a["combined"]["maintainability"] for a in analyses) / len(analyses)
        return {
            "repo_quality_overall": quality_avg,
            "repo_quality_7b": architecture_avg,
            "repo_quality_3b": performance_avg,
            "documentation": documentation_avg,
            "security": security_avg,
            "maintainability": maintainability_avg,
            "repos_analyzed": len(analyses)
        }
