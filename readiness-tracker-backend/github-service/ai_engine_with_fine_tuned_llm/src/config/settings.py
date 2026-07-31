"""
Configuration settings for Fine-Tuned LLM Analyzer
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings from environment variables"""
    
    # ===== APP SETTINGS =====
    APP_NAME = "Fine-Tuned LLM Code Analyzer"
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8000))
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # ===== LLM SETTINGS =====
    # Choose your LLM provider
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "together")  # together, openai, ollama, huggingface
    LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "meta-llama/Llama-2-7b-hf-fine-tuned")
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.0"))
    LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "2000"))
    LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "60"))
    
    # ===== GITHUB SETTINGS =====
    GITHUB_API_BASE = "https://api.github.com"
    GITHUB_TIMEOUT = int(os.getenv("GITHUB_TIMEOUT", "30"))
    
    # ===== SUPABASE SETTINGS =====
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    SUPABASE_TIMEOUT = int(os.getenv("SUPABASE_TIMEOUT", "30"))
    
    # ===== ENGINE IDENTITY =====
    ENGINE_VERSION = "fine_tuned_llm_v1"
    ENGINE_DESCRIPTION = "Single fine-tuned LLM for code analysis"
    
    # ===== ANALYSIS SETTINGS =====
    MAX_REPOS_PER_ANALYSIS = int(os.getenv("MAX_REPOS_PER_ANALYSIS", "3"))
    MIN_REPO_BACKGROUND_SCORE = float(os.getenv("MIN_REPO_BACKGROUND_SCORE", "40.0"))
    CODE_SNIPPET_MAX_LENGTH = int(os.getenv("CODE_SNIPPET_MAX_LENGTH", "10000"))
    
    # ===== CACHING =====
    CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "3600"))
    
    # ===== RETRY SETTINGS =====
    RETRY_ATTEMPTS = int(os.getenv("RETRY_ATTEMPTS", "3"))
    RETRY_DELAY_SECONDS = int(os.getenv("RETRY_DELAY_SECONDS", "2"))

settings = Settings()
