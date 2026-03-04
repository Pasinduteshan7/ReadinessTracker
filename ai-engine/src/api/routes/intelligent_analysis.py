import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from src.models.schemas import Repository
from src.services.repository_selector import RepositorySelector
from src.services.dual_analyzer import DualAnalyzer
from src.services.quad_analyzer import QuadAnalyzer
from src.services.custom_neural_scorer import CustomNeuralScorer
from src.services.background_analyzer import BackgroundAnalyzer
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/intelligent", tags=["Intelligent Analysis"])
@router.post("/select-repos")
async def select_best_repositories(
    repositories: List[Dict[str, Any]],
    limit: int = 5
):
    try:
        if not repositories:
            raise HTTPException(status_code=400, detail="No repositories provided")
        if limit < 1:
            raise HTTPException(status_code=400, detail="Limit must be >= 1")
        logger.info(f"Selecting top {limit} repositories from {len(repositories)} total")
        repo_objects = [
            Repository(
                name=r.get("name", "unknown"),
                url=r.get("url", ""),
                description=r.get("description", ""),
                language=r.get("language", "unknown"),
                stars=r.get("stars", 0),
                forks=r.get("forks", 0),
                code=r.get("code", "")
            )
            for r in repositories
        ]
        selected = RepositorySelector.select_best_repositories(repo_objects, limit=limit)
        return {
            "total_repositories": len(repositories),
            "selected_count": len(selected),
            "selected_repositories": [
                {
                    "name": r.name,
                    "url": r.url,
                    "language": r.language,
                    "stars": r.stars
                }
                for r in selected
            ],
            "status": "completed",
            "model_used": "qwen2.5-coder:3b"
        }
    except Exception as e:
        logger.error(f"Error selecting repositories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/dual-deep-analysis")
async def dual_deep_analysis(repositories: List[Dict[str, Any]], username: str = None):
    try:
        if not repositories:
            raise HTTPException(status_code=400, detail="No repositories provided")
        logger.info(f"Starting dual deep analysis for {len(repositories)} repositories (username: {username})")
        repo_objects = [
            Repository(
                name=r.get("name", "unknown"),
                url=r.get("url", ""),
                description=r.get("description", ""),
                language=r.get("language", "unknown"),
                stars=r.get("stars", 0),
                forks=r.get("forks", 0),
                code=r.get("code", "")
            )
            for r in repositories
        ]
        analyses = DualAnalyzer.analyze_repositories_deep(repo_objects)
        combined_metrics = DualAnalyzer.calculate_combined_repo_quality(analyses)
        if username:
            logger.info(f"Saving analysis results to backend for {username}...")
            try:
                import requests
                results_data = {
                    "username": username,
                    "overallScore": combined_metrics.get("repo_quality_7b", 0.0) * 100,
                    "codeQualityScore": combined_metrics.get("repo_quality_7b", 0.0),
                    "architectureScore": combined_metrics.get("repo_quality_3b", 0.0),
                    "documentationScore": combined_metrics.get("documentation", 0.0),
                    "testingScore": combined_metrics.get("security", 0.0),
                    "totalRepositories": len(repositories),
                    "analyzedRepositories": len(repositories),
                    "tier1Count": 2,
                    "tier2Count": 8,
                    "tier3Count": 1
                }
                backend_url = "http://localhost:8080/api/github/save-results"
                response = requests.post(
                    backend_url,
                    json=results_data,
                    timeout=10
                )
                if response.status_code == 200:
                    logger.info(f"✅ Successfully saved results to backend for {username}")
                else:
                    logger.warning(f"⚠️ Backend returned status {response.status_code}: {response.text}")
            except Exception as save_err:
                logger.error(f"❌ Failed to save results to backend: {str(save_err)}")
        return {
            "repositories_analyzed": len(analyses),
            "detailed_analysis": analyses,
            "combined_metrics": combined_metrics,
            "status": "completed",
            "models_used": ["codellama:7b", "qwen2.5-coder:3b"],
            "analysis_mode": "sequential_rtx3050"
        }
    except Exception as e:
        logger.error(f"Error in dual deep analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/quad-deep-analysis")
async def quad_deep_analysis(repositories: List[Dict[str, Any]], username: str = None):
    try:
        if not repositories:
            raise HTTPException(status_code=400, detail="No repositories provided")
        logger.info(f"Starting QUAD deep analysis for {len(repositories)} repositories (username: {username})")
        repo_objects = [
            Repository(
                name=r.get("name", "unknown"),
                url=r.get("url", ""),
                description=r.get("description", ""),
                language=r.get("language", "unknown"),
                stars=r.get("stars", 0),
                forks=r.get("forks", 0),
                code=r.get("code", "")
            )
            for r in repositories
        ]
        analyses = QuadAnalyzer.analyze_repositories_quad(repo_objects)
        combined_metrics = QuadAnalyzer.calculate_median_quality(analyses)
        if username:
            logger.info(f"Saving QUAD analysis results to backend for {username}...")
            try:
                import requests
                results_data = {
                    "username": username,
                    "overallScore": combined_metrics.get("repo_quality_overall", 0.5) * 100,
                    "codeQualityScore": combined_metrics.get("repo_quality_7b", 0.5),
                    "architectureScore": combined_metrics.get("repo_quality_3b", 0.5),
                    "documentationScore": combined_metrics.get("documentation", 0.5),
                    "testingScore": combined_metrics.get("security", 0.5),
                    "totalRepositories": len(repositories),
                    "analyzedRepositories": len(repositories),
                    "tier1Count": 2,
                    "tier2Count": 8,
                    "tier3Count": 1,
                    "analysisMethod": "quad_median",
                    "modelCount": 4
                }
                backend_url = "http://localhost:8080/api/github/save-results"
                response = requests.post(
                    backend_url,
                    json=results_data,
                    timeout=10
                )
                if response.status_code == 200:
                    logger.info(f"✅ Successfully saved QUAD analysis results to backend for {username}")
                else:
                    logger.warning(f"⚠️ Backend returned status {response.status_code}: {response.text}")
            except Exception as save_err:
                logger.error(f"❌ Failed to save QUAD results to backend: {str(save_err)}")
        return {
            "repositories_analyzed": len(analyses),
            "detailed_analysis": analyses,
            "combined_metrics": combined_metrics,
            "status": "completed",
            "models_used": ["qwen2.5-coder:3b", "deepseek-coder:6.7b", "codellama:7b", "starcoder2:7b"],
            "scoring_method": "median",
            "analysis_mode": "sequential_quad_rtx3050"
        }
    except Exception as e:
        logger.error(f"Error in quad deep analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/background-analysis")
async def background_analysis(
    repositories: List[Dict[str, Any]],
    username: str,
    max_repos: int = 10
):
    try:
        if not repositories:
            raise HTTPException(status_code=400, detail="No repositories provided")
        if not username:
            raise HTTPException(status_code=400, detail="GitHub username required")
        logger.info(f"📊 Starting background analysis for {username}")
        repo_objects = [
            Repository(
                name=r.get("name", "unknown"),
                url=r.get("url", ""),
                description=r.get("description", ""),
                language=r.get("language", "unknown"),
                stars=r.get("stars", 0),
                forks=r.get("forks", 0),
                code=r.get("code", "")
            )
            for r in repositories
        ]
        ranked_repos = BackgroundAnalyzer.rank_repositories(repo_objects, username)
        best_repos = BackgroundAnalyzer.select_best_repos(ranked_repos, max_repos)
        best_repos_data = []
        for best in best_repos:
            original = next((r for r in repositories if r.get("name") == best["name"]), {})
            best_repos_data.append({
                **original,
                "background_score": best["background_score"],
                "tier": best["tier"],
                "commits": best["commits"]
            })
        return {
            "phase": "PHASE 0: Background Analysis",
            "github_username": username,
            "total_repos_analyzed": len(ranked_repos),
            "ranked_repos": ranked_repos,
            "selected_for_deep_analysis": best_repos_data,
            "summary": {
                "tier_1_count": len([r for r in ranked_repos if "TIER 1" in r["tier"]]),
                "tier_2_count": len([r for r in ranked_repos if "TIER 2" in r["tier"]]),
                "tier_3_count": len([r for r in ranked_repos if "TIER 3" in r["tier"]]),
                "skip_count": len([r for r in ranked_repos if r["tier"] == "SKIP"]),
                "selected_count": len(best_repos_data)
            },
            "next_step": "Send selected repos to /api/intelligent/dual-deep-analysis",
            "status": "completed"
        }
    except Exception as e:
        logger.error(f"Error in background analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/neural-score")
async def calculate_neural_score(
    repo_quality_7b: float,
    repo_quality_3b: float,
    ai_detection_penalty: float,
    documentation: float = 0.5,
    security: float = 0.5,
    edge_cases: float = 0.0
):
    try:
        logger.info("Calculating neural network score")
        result = CustomNeuralScorer.calculate_final_score(
            repo_quality_7b=repo_quality_7b,
            repo_quality_3b=repo_quality_3b,
            ai_detection_penalty=ai_detection_penalty,
            documentation=documentation,
            security=security,
            edge_cases=edge_cases
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating neural score: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/complete-analysis")
async def complete_intelligent_analysis(
    all_repositories: List[Dict[str, Any]],
    username: str,
    limit: int = 5,
    user_id: int = None
):
    try:
        logger.info(f"Starting complete intelligent analysis for {username} with {len(all_repositories)} repositories")
        logger.info(f"[Step 1/3] Selecting top {limit} repositories...")
        repo_objects = [
            Repository(
                name=r.get("name", "unknown"),
                url=r.get("url", ""),
                description=r.get("description", ""),
                language=r.get("language", "unknown"),
                stars=r.get("stars", 0),
                forks=r.get("forks", 0),
                code=r.get("code", "")
            )
            for r in all_repositories
        ]
        selected_repos = RepositorySelector.select_best_repositories(repo_objects, limit=limit)
        logger.info("[Step 2/3] Running QUAD deep analysis (4 models with MEDIAN scoring)...")
        analyses = QuadAnalyzer.analyze_repositories_quad(selected_repos)
        combined_metrics = QuadAnalyzer.calculate_median_quality(analyses)
        logger.info("[Step 3/3] Calculating neural network final score...")
        neural_score = CustomNeuralScorer.calculate_final_score(
            repo_quality_7b=combined_metrics.get("repo_quality_7b", 0.5),
            repo_quality_3b=combined_metrics.get("repo_quality_3b", 0.5),
            ai_detection_penalty=0.1,
            documentation=combined_metrics.get("documentation", 0.5),
            security=combined_metrics.get("security", 0.5),
            edge_cases=0.0
        )
        logger.info(f"[Step 4/4] Saving analysis results to backend for {username}...")
        try:
            import requests
            tier1_count = 0
            tier2_count = 0
            tier3_count = 0
            results_data = {
                "username": username,
                "overallScore": neural_score["percentage"],
                "codeQualityScore": combined_metrics.get("repo_quality_7b", 0.0),
                "architectureScore": combined_metrics.get("repo_quality_3b", 0.0),
                "documentationScore": combined_metrics.get("documentation", 0.0),
                "testingScore": combined_metrics.get("security", 0.0),
                "totalRepositories": len(all_repositories),
                "analyzedRepositories": len(selected_repos),
                "tier1Count": tier1_count,
                "tier2Count": tier2_count,
                "tier3Count": tier3_count
            }
            backend_url = "http://localhost:8080/api/github/save-results"
            response = requests.post(
                backend_url,
                json=results_data,
                timeout=10
            )
            if response.status_code == 200:
                logger.info(f"✅ Successfully saved results to backend for {username}")
            else:
                logger.warning(f"⚠️ Backend returned status {response.status_code}: {response.text}")
        except Exception as save_err:
            logger.error(f"❌ Failed to save results to backend: {str(save_err)}")
        return {
            "status": "completed",
            "workflow": "select_repos → quad_analysis(4-model) → neural_score → save_to_backend",
            "step_1_repo_selection": {
                "total_repositories": len(all_repositories),
                "selected_count": len(selected_repos),
                "selected_repos": [
                    {"name": r.name, "url": r.url, "language": r.language, "stars": r.stars}
                    for r in selected_repos
                ],
                "model_used": "qwen2.5-coder:3b"
            },
            "step_2_deep_analysis": {
                "repositories_analyzed": len(analyses),
                "detailed_analysis": analyses,
                "combined_metrics": combined_metrics,
                "models_used": ["qwen2.5-coder:3b", "deepseek-coder:6.7b", "codellama:7b", "starcoder2:7b"],
                "scoring_method": "median",
                "analysis_mode": "sequential_quad_rtx3050"
            },
            "step_3_neural_score": neural_score,
            "final_score": neural_score["final_score"],
            "final_score_percentage": neural_score["percentage"]
        }
    except Exception as e:
        logger.error(f"Error in complete intelligent analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
