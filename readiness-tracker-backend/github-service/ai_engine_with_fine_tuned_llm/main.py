"""
Main entry point for Fine-Tuned LLM Analyzer
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import analysis
from src.config.settings import settings
from src.utils.logger import setup_logger
import logging

# Setup logger
logging.basicConfig(level=settings.LOG_LEVEL)
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Fine-Tuned LLM Code Analyzer",
    description="Code analysis using single fine-tuned LLM model",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(analysis.router)

@app.get("/")
async def root():
    """Root endpoint - service info"""
    return {
        "service": "Fine-Tuned LLM Code Analyzer",
        "status": "online ✅",
        "engine_version": settings.ENGINE_VERSION,
        "model": settings.LLM_MODEL_NAME,
        "provider": settings.LLM_PROVIDER,
        "port": settings.API_PORT,
        "endpoints": {
            "analyze": "POST /api/analyze/complete",
            "results": "GET /api/analyze/results/{github_username}",
            "history": "GET /api/analyze/history/{github_username}",
            "health": "GET /api/analyze/health",
            "docs": "/docs"
        }
    }

@app.on_event("startup")
async def startup_event():
    """Startup event"""
    logger.info("=" * 70)
    logger.info("🚀 Fine-Tuned LLM Code Analyzer Starting Up")
    logger.info("=" * 70)
    logger.info(f"Service: {settings.APP_NAME}")
    logger.info(f"Host: {settings.API_HOST}:{settings.API_PORT}")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")
    logger.info(f"Model: {settings.LLM_MODEL_NAME}")
    logger.info(f"Engine Version: {settings.ENGINE_VERSION}")
    logger.info(f"Supabase: {'Configured ✅' if settings.SUPABASE_URL else 'Not configured ⚠️'}")
    logger.info("=" * 70)

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event"""
    logger.info("🛑 Fine-Tuned LLM Code Analyzer shutting down...")

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.API_HOST}:{settings.API_PORT}")
    
    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
