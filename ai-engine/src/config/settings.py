import os
from dotenv import load_dotenv
load_dotenv()
class Settings:
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    MODEL_QUALITY_PRIMARY = "codellama:7b"
    MODEL_QUALITY_SECONDARY = "qwen2.5-coder:3b"
    MODEL_AI_DETECT = "deepseek-coder:1.3b"
    MODEL_ALGORITHM = "deepseek-r1:1.5b"
    MODEL_7B = MODEL_QUALITY_PRIMARY
    MODEL_3B = MODEL_AI_DETECT
    API_PORT = int(os.getenv("API_PORT", "8000"))
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
settings = Settings()
