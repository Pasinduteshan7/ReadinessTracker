"""
Analysis API routes
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.models.schemas import AnalysisRequest, AnalysisResult
from src.services.supabase_client import supabase_client
from src.services.llm_analyzer import llm_analyzer
from src.services.github_analyzer import create_github_analyzer
from src.config.settings import settings
from src.utils.logger import setup_logger
import time
from datetime import datetime
import asyncio

logger = setup_logger(__name__)
router = APIRouter(prefix="/api/analyze", tags=["analysis"])

def _get_employability_tier(score: float) -> str:
    """Convert score to employability tier"""
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 50:
        return "Fair"
    else:
        return "Beginner"

def _get_recommended_level(score: float) -> str:
    """Get recommended career level"""
    if score >= 80:
        return "Senior"
    elif score >= 65:
        return "Mid"
    else:
        return "Junior"

@router.post("/complete")
async def analyze_complete(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Complete GitHub account analysis using fine-tuned LLM
    
    - Fast background search (2-3 seconds)
    - Intelligent repo selection
    - Deep LLM analysis (3-5 seconds per repo)
    - Store results in Supabase
    
    Returns: Analysis results with scores and employability assessment
    """
    
    start_time = time.time()
    
    logger.info(f"🚀 Starting analysis for {request.github_username}")
    
    try:
        # ===== STEP 1: Background Search =====
        logger.info("📊 Step 1: Background search...")
        
        github = create_github_analyzer(request.github_token)
        background = await github.background_search(request.github_username)
        
        # ===== STEP 2: Select Best Repos =====
        logger.info("🎯 Step 2: Selecting repositories...")
        
        selected_repos = await github.select_best_repos(
            all_repos=background["repos"],
            limit=settings.MAX_REPOS_PER_ANALYSIS,
            min_score=settings.MIN_REPO_BACKGROUND_SCORE
        )
        
        if not selected_repos:
            logger.warning(f"No qualified repos for {request.github_username}")
            return {
                "user_id": request.user_id,
                "github_username": request.github_username,
                "status": "no_qualified_repos",
                "message": "No repositories qualified for deep analysis"
            }
        
        # ===== STEP 3: Deep Analysis =====
        logger.info(f"🧠 Step 3: Deep analysis of {len(selected_repos)} repos...")
        
        deep_results = []
        
        for i, repo in enumerate(selected_repos, 1):
            try:
                logger.info(f"   Analyzing repo {i}/{len(selected_repos)}: {repo['name']}")
                
                # Fetch code
                code = await github.fetch_repo_code(
                    owner=request.github_username,
                    repo=repo["name"]
                )
                
                # Analyze with LLM
                llm_result = await llm_analyzer.analyze_repository_code(repo["name"], code)
                
                # Calculate overall repo score using weighted average
                code_q = llm_result.get("code_quality", 50)
                arch = llm_result.get("architecture", 50)
                docs = llm_result.get("documentation", 50)
                test = llm_result.get("testing", 50)
                best_p = llm_result.get("best_practices", 50)
                
                overall_repo_score = (
                    (code_q * 0.30) +
                    (arch * 0.25) +
                    (docs * 0.15) +
                    (test * 0.20) +
                    (best_p * 0.10)
                )
                
                deep_results.append({
                    "repo_name": repo["name"],
                    "repo_url": repo["url"],
                    "background_score": repo["background_score"],
                    "analysis": {
                        "code_quality": llm_result.get("code_quality", 50),
                        "architecture": llm_result.get("architecture", 50),
                        "documentation": llm_result.get("documentation", 50),
                        "testing": llm_result.get("testing", 50),
                        "best_practices": llm_result.get("best_practices", 50),
                        "overall_score": overall_repo_score,
                        "summary": llm_result.get("summary", ""),
                        "strengths": llm_result.get("strengths", []),
                        "improvements": llm_result.get("improvements", [])
                    }
                })
            
            except Exception as e:
                logger.error(f"Failed to analyze {repo['name']}: {e}")
                deep_results.append({
                    "repo_name": repo["name"],
                    "repo_url": repo["url"],
                    "error": str(e)
                })
        
        # ===== STEP 4: Calculate Scores =====
        logger.info("📈 Step 4: Calculating final scores...")
        
        # Calculate averages from deep analysis
        successful_results = [r for r in deep_results if "analysis" in r]
        
        if successful_results:
            code_quality = sum(r["analysis"]["code_quality"] for r in successful_results) / len(successful_results)
            architecture = sum(r["analysis"]["architecture"] for r in successful_results) / len(successful_results)
            documentation = sum(r["analysis"]["documentation"] for r in successful_results) / len(successful_results)
            testing = sum(r["analysis"]["testing"] for r in successful_results) / len(successful_results)
            best_practices = sum(r["analysis"]["best_practices"] for r in successful_results) / len(successful_results)
            
            # Overall score
            all_scores = [
                code_quality * 0.30,
                architecture * 0.25,
                documentation * 0.15,
                testing * 0.20,
                best_practices * 0.10
            ]
            overall_score = sum(all_scores)
        else:
            code_quality = architecture = documentation = testing = best_practices = 50
            overall_score = 50
        
        # Professional readiness and growth potential
        professional_readiness = overall_score * 0.95  # Slightly more conservative
        growth_potential = overall_score * 1.05
        
        # Time tracking
        analysis_duration = time.time() - start_time
        
        # ===== BUILD RESULT =====
        result = {
            "user_id": request.user_id,
            "github_username": request.github_username,
            "engine_version": settings.ENGINE_VERSION,
            "model_name": settings.LLM_MODEL_NAME,
            
            "deep_analysis_results": deep_results,
            
            "overall_score": overall_score,
            "code_quality_score": code_quality,
            "architecture_score": architecture,
            "documentation_score": documentation,
            "testing_score": testing,
            "best_practices_score": best_practices,
            
            "employability_percentile": overall_score,
            "employability_tier": _get_employability_tier(overall_score),
            "professional_readiness": professional_readiness,
            "growth_potential": growth_potential,
            "recommended_level": _get_recommended_level(overall_score),
            
            "background_analysis": background,
            "selected_repositories": [r["name"] for r in selected_repos],
            "selection_rationale": {
                "total_repos": background["total_repos"],
                "selected_count": len(selected_repos),
                "criteria": "Background score + recent activity + code quality"
            },
            
            "analysis_duration_seconds": analysis_duration,
            "status": "completed"
        }
        
        # ===== STORE IN SUPABASE =====
        logger.info("💾 Step 5: Storing results...")
        
        background_tasks.add_task(
            supabase_client.store_analysis_result,
            result
        )
        
        logger.info(f"✅ Analysis completed in {analysis_duration:.1f}s")
        logger.info(f"   Score: {overall_score:.1f} ({result['employability_tier']})")
        
        return result
    
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{github_username}")
async def get_latest_results(github_username: str):
    """Get latest analysis results for a GitHub user"""
    
    try:
        result = await supabase_client.get_latest_analysis(github_username)
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No analysis found for {github_username}"
            )
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{github_username}")
async def get_analysis_history(github_username: str, limit: int = 10):
    """Get analysis history for a GitHub user"""
    
    try:
        history = await supabase_client.get_user_history(github_username, limit)
        
        return {
            "github_username": github_username,
            "count": len(history),
            "history": history
        }
    
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    
    return {
        "status": "healthy",
        "service": "Fine-Tuned LLM Code Analyzer",
        "engine_version": settings.ENGINE_VERSION,
        "model": settings.LLM_MODEL_NAME,
        "provider": settings.LLM_PROVIDER,
        "port": settings.API_PORT,
        "timestamp": datetime.utcnow().isoformat()
    }
