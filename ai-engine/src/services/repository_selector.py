import logging
import json
from typing import List, Dict, Any
from src.models.schemas import Repository
from src.utils.ollama_client import OllamaClient
from src.config.settings import settings
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class RepositorySelector:
    @staticmethod
    def select_best_repositories(repositories: List[Repository], limit: int = 5) -> List[Repository]:
        if len(repositories) <= limit:
            logger.info(f"Only {len(repositories)} repos, analyzing all")
            return repositories
        repos_summary = "\n".join([
            f"{i+1}. {repo.name} ({repo.language}, {repo.stars} stars, {repo.forks} forks)"
            for i, repo in enumerate(repositories)
        ])
        prompt = f"""Select top {limit} repositories for deep analysis:
{repos_summary}

Return JSON: {{"selected_indices": [0, 1, ...], "reason": "Your selection reason"}}
Only JSON."""
        try:
            response = ollama.generate(prompt, model=settings.MODEL_QUALITY_SECONDARY, temperature=0.5)
            logger.info(f"Qwen selection response: {response[:200]}...")
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                result = json.loads(json_str)
                selected_indices = result.get("selected_indices", [])
                reason = result.get("reason", "")
                logger.info(f"Selected repos: {selected_indices} - {reason}")
                selected = []
                for idx in selected_indices:
                    if 0 <= idx < len(repositories):
                        selected.append(repositories[idx])
                if selected:
                    logger.info(f"✅ Selected {len(selected)} repos for deep analysis")
                    return selected[:limit]
        except Exception as e:
            logger.warning(f"Error selecting repositories: {str(e)}")
        logger.info("Falling back to star-count selection")
        sorted_repos = sorted(repositories, key=lambda r: r.stars, reverse=True)
        return sorted_repos[:limit]
    @staticmethod
    def get_selection_reason(repositories: List[Repository], selected: List[Repository]) -> str:
        total = len(repositories)
        selected_count = len(selected)
        total_stars = sum(r.stars for r in selected)
        languages = set(r.language for r in selected)
        return (f"Selected {selected_count}/{total} repos for deep analysis. "
                f"Total stars: {total_stars}, Languages: {', '.join(languages)}")
