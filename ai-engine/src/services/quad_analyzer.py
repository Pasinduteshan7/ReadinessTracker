import logging
import json
import time
import statistics
from typing import List, Dict
from src.models.schemas import Repository
from src.utils.ollama_client import OllamaClient
from src.config.settings import settings
logger = logging.getLogger(__name__)
ollama = OllamaClient()
class QuadAnalyzer:
    MODELS = {
        "qwen2.5-coder:3b": {
            "size": "3B",
            "focus": "readability, performance, maintainability",
            "name": "qwen2.5-coder:3b"
        },
        "codellama:7b": {
            "size": "7B",
            "focus": "quality, architecture, documentation",
            "name": "codellama:7b"
        },
        "deepseek-coder:6.7b": {
            "size": "6.7B",
            "focus": "code patterns, efficiency, best practices",
            "name": "deepseek-coder:6.7b"
        },
        "starcoder2:7b": {
            "size": "7B",
            "focus": "code structure, conventions, completeness",
            "name": "starcoder2:7b"
        }
    }
    @staticmethod
    def unload_model(model_name: str) -> None:
        try:
            logger.info(f"🔄 Unloading {model_name} from GPU...")
            ollama.generate("", model=model_name, keep_alive=0)
            time.sleep(0.5)
        except Exception as e:
            logger.warning(f"Could not unload {model_name}: {str(e)}")
    @staticmethod
    def analyze_with_qwen(repo: Repository) -> Dict[str, float]:
        prompt = f"""Analyze repository for readability, performance, maintainability:
Repo: {repo.name}
URL: {repo.url}

Return JSON: {{"readability": 0.X, "performance": 0.X, "maintainability": 0.X, "standards": 0.X, "extensibility": 0.X}}
Only JSON."""
        try:
            response = ollama.generate(prompt, model="qwen2.5-coder:3b", temperature=0.5)
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
                    "standards": float(scores.get("standards", 0.5)),
                    "extensibility": float(scores.get("extensibility", 0.5))
                }
        except Exception as e:
            logger.warning(f"Qwen analysis error: {str(e)}")
        return {
            "model": "qwen2.5-coder:3b",
            "readability": 0.5,
            "performance": 0.5,
            "maintainability": 0.5,
            "standards": 0.5,
            "extensibility": 0.5
        }
    @staticmethod
    def analyze_with_codellama(repo: Repository) -> Dict[str, float]:
        prompt = f"""Analyze repository for quality, architecture, documentation:
Repo: {repo.name}
URL: {repo.url}

Return JSON: {{"quality": 0.X, "architecture": 0.X, "documentation": 0.X, "error_handling": 0.X, "testing": 0.X}}
Only JSON."""
        try:
            response = ollama.generate(prompt, model="codellama:7b", temperature=0.5)
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
    def analyze_with_deepseek(repo: Repository) -> Dict[str, float]:
        prompt = f"""Analyze repository for patterns, efficiency, best practices:
Repo: {repo.name}
URL: {repo.url}

Return JSON: {{"patterns": 0.X, "efficiency": 0.X, "modularity": 0.X, "robustness": 0.X, "clarity": 0.X}}
Only JSON."""
        try:
            response = ollama.generate(prompt, model="deepseek-coder:6.7b", temperature=0.5)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                scores = json.loads(json_str)
                return {
                    "model": "deepseek-coder:6.7b",
                    "patterns": float(scores.get("patterns", 0.5)),
                    "efficiency": float(scores.get("efficiency", 0.5)),
                    "modularity": float(scores.get("modularity", 0.5)),
                    "robustness": float(scores.get("robustness", 0.5)),
                    "clarity": float(scores.get("clarity", 0.5))
                }
        except Exception as e:
            logger.warning(f"DeepSeek analysis error: {str(e)}")
        return {
            "model": "deepseek-coder:6.7b",
            "patterns": 0.5,
            "efficiency": 0.5,
            "modularity": 0.5,
            "robustness": 0.5,
            "clarity": 0.5
        }
    @staticmethod
    def analyze_with_starcoder(repo: Repository) -> Dict[str, float]:
        prompt = f"""Analyze repository for structure, consistency, completeness:
Repo: {repo.name}
URL: {repo.url}

Return JSON: {{"structure": 0.X, "consistency": 0.X, "completeness": 0.X, "complexity": 0.X, "production": 0.X}}
Only JSON."""
        try:
            response = ollama.generate(prompt, model="starcoder2:7b", temperature=0.5)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                scores = json.loads(json_str)
                return {
                    "model": "starcoder2:7b",
                    "structure": float(scores.get("structure", 0.5)),
                    "consistency": float(scores.get("consistency", 0.5)),
                    "completeness": float(scores.get("completeness", 0.5)),
                    "complexity": float(scores.get("complexity", 0.5)),
                    "production": float(scores.get("production", 0.5))
                }
        except Exception as e:
            logger.warning(f"StarCoder2 analysis error: {str(e)}")
        return {
            "model": "starcoder2:7b",
            "structure": 0.5,
            "consistency": 0.5,
            "completeness": 0.5,
            "complexity": 0.5,
            "production": 0.5
        }
    @staticmethod
    def analyze_repositories_quad(repositories: List[Repository]) -> List[Dict]:
        if not repositories:
            return []
        logger.info(f"🚀 QUAD ANALYSIS: {len(repositories)} repos × 4 models (MEDIAN scoring)")
        logger.info(f"📊 Models: qwen2.5-coder:3b → deepseek-coder:6.7b → codellama:7b → starcoder2:7b")
        start_time = time.time()
        all_repo_analyses = {repo.name: {"scores_by_model": []} for repo in repositories}
        model_times = {}
        logger.info("📍 PHASE 1/4: Analyzing with qwen2.5-coder:3b...")
        phase_start = time.time()
        for i, repo in enumerate(repositories, 1):
            logger.info(f"  [{i}/{len(repositories)}] qwen → {repo.name}")
            scores = QuadAnalyzer.analyze_with_qwen(repo)
            all_repo_analyses[repo.name]["scores_by_model"].append(scores)
        model_times["qwen2.5-coder:3b"] = time.time() - phase_start
        QuadAnalyzer.unload_model("qwen2.5-coder:3b")
        logger.info(f"✅ Qwen phase complete ({model_times['qwen2.5-coder:3b']:.1f}s)")
        logger.info("📍 PHASE 2/4: Analyzing with deepseek-coder:6.7b...")
        phase_start = time.time()
        for i, repo in enumerate(repositories, 1):
            logger.info(f"  [{i}/{len(repositories)}] deepseek → {repo.name}")
            scores = QuadAnalyzer.analyze_with_deepseek(repo)
            all_repo_analyses[repo.name]["scores_by_model"].append(scores)
        model_times["deepseek-coder:6.7b"] = time.time() - phase_start
        QuadAnalyzer.unload_model("deepseek-coder:6.7b")
        logger.info(f"✅ DeepSeek phase complete ({model_times['deepseek-coder:6.7b']:.1f}s)")
        logger.info("📍 PHASE 3/4: Analyzing with codellama:7b...")
        phase_start = time.time()
        for i, repo in enumerate(repositories, 1):
            logger.info(f"  [{i}/{len(repositories)}] codellama → {repo.name}")
            scores = QuadAnalyzer.analyze_with_codellama(repo)
            all_repo_analyses[repo.name]["scores_by_model"].append(scores)
        model_times["codellama:7b"] = time.time() - phase_start
        QuadAnalyzer.unload_model("codellama:7b")
        logger.info(f"✅ CodeLlama phase complete ({model_times['codellama:7b']:.1f}s)")
        logger.info("📍 PHASE 4/4: Analyzing with starcoder2:7b...")
        phase_start = time.time()
        for i, repo in enumerate(repositories, 1):
            logger.info(f"  [{i}/{len(repositories)}] starcoder → {repo.name}")
            scores = QuadAnalyzer.analyze_with_starcoder(repo)
            all_repo_analyses[repo.name]["scores_by_model"].append(scores)
        model_times["starcoder2:7b"] = time.time() - phase_start
        QuadAnalyzer.unload_model("starcoder2:7b")
        logger.info(f"✅ StarCoder2 phase complete ({model_times['starcoder2:7b']:.1f}s)")
        total_time = time.time() - start_time
        logger.info(f"⏱️ TOTAL ANALYSIS TIME: {total_time:.1f}s ({total_time/len(repositories):.1f}s per repo)")
        logger.info("📊 Calculating MEDIAN scores...")
        results = []
        for repo in repositories:
            analyses = all_repo_analyses[repo.name]["scores_by_model"]
            score_dimensions = {}
            for analysis in analyses:
                for key, value in analysis.items():
                    if key != "model" and isinstance(value, (int, float)):
                        if key not in score_dimensions:
                            score_dimensions[key] = []
                        score_dimensions[key].append(value)
            median_scores = {}
            median_values = []
            for dimension, values in score_dimensions.items():
                if values:
                    median_val = statistics.median(values)
                    median_scores[dimension] = median_val
                    median_values.append(median_val)
            overall_median = statistics.median(median_values) if median_values else 0.5
            results.append({
                "repo_name": repo.name,
                "model_scores": analyses,
                "median_scores": median_scores,
                "overall_quality_median": overall_median,
                "analysis_count": len(analyses)
            })
        logger.info(f"✅ QUAD-ANALYSIS COMPLETE: {len(results)} repos analyzed with 4 models each")
        logger.info(f"📈 Model times: {json.dumps({k: f'{v:.1f}s' for k, v in model_times.items()})}")
        return results
    @staticmethod
    def calculate_median_quality(analyses: List[Dict]) -> Dict[str, float]:
        if not analyses:
            return {}
        dimension_values = {}
        overall_values = []
        for analysis in analyses:
            overall_values.append(analysis["overall_quality_median"])
            for dim, score in analysis["median_scores"].items():
                if dim not in dimension_values:
                    dimension_values[dim] = []
                dimension_values[dim].append(score)
        medians = {}
        for dim, values in dimension_values.items():
            medians[dim] = statistics.median(values) if values else 0.5
        overall_median = statistics.median(overall_values) if overall_values else 0.5
        return {
            "repo_quality_overall": overall_median,
            "repo_quality_7b": medians.get("quality", medians.get("clarity", 0.5)),
            "repo_quality_3b": medians.get("readability", medians.get("structure", 0.5)),
            "documentation": medians.get("documentation", 0.5),
            "security": medians.get("robustness", 0.5),
            "maintainability": medians.get("maintainability", 0.5),
            "repos_analyzed": len(analyses),
            "analysis_method": "quad_median",
            "model_count": 4
        }
