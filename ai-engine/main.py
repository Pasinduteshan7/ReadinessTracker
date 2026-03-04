import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings
from src.api.routes import analysis, score, intelligent_analysis
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)
app = FastAPI(
    title="GitHub Readiness AI Engine",
    description="LLM-powered code analysis and scoring engine",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analysis.router)
app.include_router(score.router)
app.include_router(intelligent_analysis.router)
@app.get("/")
async def root():
    return {
        "service": "GitHub Readiness AI Engine",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "basic_analysis": {
                "fetch_repos": "POST /api/analyze/fetch-repos",
                "quality": "POST /api/analyze/quality",
                "ai_detection": "POST /api/analyze/ai-detection"
            },
            "intelligent_workflow": {
                "select_repos": "POST /api/intelligent/select-repos",
                "background_analysis": "POST /api/intelligent/background-analysis",
                "dual_analysis": "POST /api/intelligent/dual-deep-analysis",
                "quad_analysis": "POST /api/intelligent/quad-deep-analysis",
                "neural_score": "POST /api/intelligent/neural-score",
                "complete": "POST /api/intelligent/complete-analysis"
            },
            "scoring": {
                "neural_network": "POST /api/score/neural-network",
                "health": "GET /api/score/health"
            }
        }
    }
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 AI Engine starting...")
    logger.info(f"Ollama Host: {settings.OLLAMA_HOST}")
    logger.info(f"\n📊 LLM Model Configuration (Option A):")
    logger.info(f"   🔹 Repo Quality (PRIMARY):   {settings.MODEL_QUALITY_PRIMARY}")
    logger.info(f"   🔹 Repo Quality (SECONDARY): {settings.MODEL_QUALITY_SECONDARY}")
    logger.info(f"   🔹 AI Detection:             {settings.MODEL_AI_DETECT}")
    logger.info(f"   🔹 Algorithm Analysis:       {settings.MODEL_ALGORITHM}")
    logger.info(f"   ✅ API running on {settings.API_HOST}:{settings.API_PORT}\n")
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 AI Engine shutting down...")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
