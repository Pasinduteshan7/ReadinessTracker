# GitHub Readiness AI Engine

Python-powered AI analysis engine for code quality and AI detection using Ollama LLMs.

## Features

- **Code Quality Analysis**: Analyze repositories using Mistral 7B model
- **AI Pattern Detection**: Detect AI-generated code using Phi 3B model
- **Neural Network Scoring**: Calculate final readiness scores
- **FastAPI Server**: REST API for backend integration
- **Ollama Integration**: Local LLM inference without external APIs

## Requirements

- Python 3.10+
- Ollama (running on localhost:11434)
- Mistral 7B or Phi models pulled in Ollama

## Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Ensure Ollama is running
ollama serve

# In another terminal, pull models
ollama pull mistral:7b
ollama pull phi
```

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure settings as needed:
- `OLLAMA_HOST`: Ollama server URL
- `API_PORT`: FastAPI server port (default: 8000)
- `MODEL_7B`: Large model for quality analysis (default: mistral:7b)
- `MODEL_3B`: Small model for AI detection (default: phi)

## Running

```bash
# Development
python main.py

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Analysis
- `POST /api/analyze/fetch-repos` - Fetch GitHub repositories
- `POST /api/analyze/quality` - Analyze code quality
- `POST /api/analyze/ai-detection` - Detect AI patterns

### Scoring
- `POST /api/score/neural-network` - Calculate final score
- `GET /api/score/health` - Health check

## Architecture

```
Frontend (React)
    ↓
Backend (Spring Boot - PythonBridgeService)
    ↓
AI Engine (FastAPI)
    ↓
Ollama (Local LLMs)
```

## Models

- **Mistral 7B**: Code quality analysis, documentation review, complexity assessment
- **Phi 3B**: Fast AI pattern detection, lightweight inference

## Models Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| Mistral 7B | 7B params | Moderate | High | Code quality analysis |
| Phi 3B | 3B params | Very fast | Medium | AI pattern detection |
