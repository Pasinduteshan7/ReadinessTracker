@echo off
REM GitHub Readiness AI Engine Startup Script (Windows)

echo.
echo 🚀 Starting GitHub Readiness AI Engine...
echo.

REM Check if Ollama is running
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -ErrorAction Stop; Write-Host '✅ Ollama is running' } catch { Write-Host '❌ Error: Ollama is not running on localhost:11434'; Write-Host 'Please start Ollama first: ollama serve'; exit 1 }"

if %errorlevel% neq 0 exit /b %errorlevel%

REM Check if models are available
echo 📦 Checking for required models...

powershell -Command "if ((ollama list) -notmatch 'mistral:7b') { Write-Host '⬇️  Pulling mistral:7b model...'; ollama pull mistral:7b }"

powershell -Command "if ((ollama list) -notmatch 'phi') { Write-Host '⬇️  Pulling phi model...'; ollama pull phi }"

echo ✅ Models ready

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    copy .env.example .env
)

REM Start AI Engine
echo 🎯 Starting AI Engine on http://localhost:8000
python main.py

pause
