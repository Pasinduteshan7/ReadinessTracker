#!/bin/bash

# GitHub Readiness Tracker - Complete Startup Script (Linux/Mac)
# Starts all three components

echo ""
echo "██████╗ ███████╗ █████╗ ██████╗ ██╗███╗   ██╗███████╗███████╗███████╗"
echo "██╔══██╗██╔════╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝██╔════╝██╔════╝"
echo "██████╔╝█████╗  ███████║██║  ██║██║██╔██╗ ██║█████╗  ███████╗███████╗"
echo "██╔══██╗██╔══╝  ██╔══██║██║  ██║██║██║╚██╗██║██╔══╝  ╚════██║╚════██║"
echo "██║  ██║███████╗██║  ██║██████╔╝██║██║ ╚████║███████╗███████║███████║"
echo "╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝"
echo ""
echo "GitHub Readiness Tracker - Complete System Startup"
echo "Version 1.0.0"
echo ""

# Check Prerequisites
echo "📋 Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 17+"
    exit 1
fi
echo "✅ Java detected"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js detected"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.10+"
    exit 1
fi
echo "✅ Python detected"

if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Ollama not running. Please start: ollama serve"
    exit 1
fi
echo "✅ Ollama is running"

echo ""
echo "🚀 Starting all components..."
echo ""

# Setup base directory robustly
READINESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start AI Engine in new terminal
echo "1️⃣  Starting AI Engine (Python/FastAPI on port 8000)..."
open -a Terminal "$READINESS_DIR/readiness-tracker-backend/github-service/ai_engine_with_fine_tuned_llm/start.sh" &
sleep 2

# Start Backend
echo "2️⃣  Starting Backend (Spring Boot on port 8080)..."
cd "$READINESS_DIR/readiness-tracker-backend"
./gradlew bootRun &
BACKEND_PID=$!
sleep 3

# Start Frontend
echo "3️⃣  Starting Frontend (React on port 5173)..."
cd "$READINESS_DIR/project"
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services starting..."
echo ""
echo "📊 Expected Services:"
echo "   - Ollama:     http://localhost:11434"
echo "   - AI Engine:  http://localhost:8000"
echo "   - Backend:    http://localhost:8080"
echo "   - Frontend:   http://localhost:5173"
echo ""
echo "🔍 Verification URLs:"
echo "   - AI Engine health:  curl http://localhost:8000/api/score/health"
echo "   - Backend health:    curl http://localhost:8080/actuator/health"
echo "   - Frontend:          http://localhost:5173"
echo ""
echo "📖 Full setup guide: SETUP_GUIDE.md"
echo ""
echo "⏳ Services are starting..."
echo "⏳ This may take 30-60 seconds for all components to be ready."
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
