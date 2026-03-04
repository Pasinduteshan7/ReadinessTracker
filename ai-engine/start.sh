#!/bin/bash

# GitHub Readiness AI Engine Startup Script (Linux/Mac)

echo "🚀 Starting GitHub Readiness AI Engine..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Error: Ollama is not running on localhost:11434"
    echo "Please start Ollama first:"
    echo "  ollama serve"
    exit 1
fi

echo "✅ Ollama is running"

# Check if models are available
echo "📦 Checking for required models..."

if ! ollama list | grep -q "mistral:7b"; then
    echo "⬇️  Pulling mistral:7b model..."
    ollama pull mistral:7b
fi

if ! ollama list | grep -q "phi"; then
    echo "⬇️  Pulling phi model..."
    ollama pull phi
fi

echo "✅ Models ready"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Start AI Engine
echo "🎯 Starting AI Engine on http://localhost:8000"
python main.py
