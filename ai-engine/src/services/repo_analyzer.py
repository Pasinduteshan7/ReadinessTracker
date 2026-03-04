import logging
from typing import List, Dict, Any
from src.models.schemas import Repository, RepoQualityAnalysis
from src.utils.ollama_client import OllamaClient
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class RepositoryAnalyzer:
    @staticmethod
    def analyze_repository(repo: Repository) -> RepoQualityAnalysis:
        try:
            scores = ollama.analyze_code_quality(repo.code)
            return RepoQualityAnalysis(
                repo_name=repo.name,
                code_quality_score=scores.get("quality", 0.5),
                complexity_score=scores.get("complexity", 0.5),
                documentation_score=scores.get("documentation", 0.5),
                testing_score=scores.get("testing", 0.5),
                maintainability_score=scores.get("maintainability", 0.5)
            )
        except Exception as e:
            logger.error(f"Error analyzing repo {repo.name}: {str(e)}")
            return RepoQualityAnalysis(
                repo_name=repo.name,
                code_quality_score=0.5,
                complexity_score=0.5,
                documentation_score=0.5,
                testing_score=0.5,
                maintainability_score=0.5
            )
    @staticmethod
    def analyze_repositories(repositories: List[Repository]) -> List[RepoQualityAnalysis]:
        results = []
        for repo in repositories:
            analysis = RepositoryAnalyzer.analyze_repository(repo)
            results.append(analysis)
        return results
    @staticmethod
    def calculate_average_quality(analyses: List[RepoQualityAnalysis]) -> Dict[str, float]:
        if not analyses:
            return {}
        avg_quality = sum(a.code_quality_score for a in analyses) / len(analyses)
        avg_complexity = sum(a.complexity_score for a in analyses) / len(analyses)
        avg_documentation = sum(a.documentation_score for a in analyses) / len(analyses)
        avg_testing = sum(a.testing_score for a in analyses) / len(analyses)
        avg_maintainability = sum(a.maintainability_score for a in analyses) / len(analyses)
        return {
            "quality": avg_quality,
            "complexity": avg_complexity,
            "documentation": avg_documentation,
            "testing": avg_testing,
            "maintainability": avg_maintainability
        }
