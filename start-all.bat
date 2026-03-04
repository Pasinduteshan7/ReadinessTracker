@echo off
REM GitHub Readiness Tracker - Complete Startup Script (Windows)
REM Starts all three components in separate terminal windows

echo.
echo ██████╗ ███████╗ █████╗ ██████╗ ██╗███╗   ██╗███████╗███████╗███████╗
echo ██╔══██╗██╔════╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝██╔════╝██╔════╝
echo ██████╔╝█████╗  ███████║██║  ██║██║██╔██╗ ██║█████╗  ███████╗███████╗
echo ██╔══██╗██╔══╝  ██╔══██║██║  ██║██║██║╚██╗██║██╔══╝  ╚════██║╚════██║
echo ██║  ██║███████╗██║  ██║██████╔╝██║██║ ╚████║███████╗███████║███████║
echo ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝
echo.
echo GitHub Readiness Tracker - Complete System Startup
echo Version 1.0.0
echo.

REM Check Prerequisites
echo 📋 Checking prerequisites...

REM Check Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java not found. Please install Java 17+
    pause
    exit /b 1
)
echo ✅ Java detected

REM Check Node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
echo ✅ Node.js detected

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.10+
    pause
    exit /b 1
)
echo ✅ Python detected

REM Check MySQL
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  MySQL not found. Please ensure MySQL is running
)

REM Check Ollama
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -ErrorAction Stop; Write-Host '✅ Ollama is running' } catch { Write-Host '❌ Ollama not running. Please start: ollama serve'; exit 1 }"

if %errorlevel% neq 0 (
    pause
    exit /b 1
)

echo.
echo 🚀 Starting all components...
echo.

REM Start AI Engine
echo 1️⃣  Starting AI Engine (Python/FastAPI on port 8000)...
start "AI Engine" cmd /k "cd d:\PROJECTS\group\Readiness tracker\ai-engine && start.bat"
timeout /t 3 /nobreak

REM Start Backend
echo 2️⃣  Starting Backend (Spring Boot on port 8080)...
start "Backend" cmd /k "cd d:\PROJECTS\group\Readiness tracker\readiness-tracker-backend && gradlew bootRun"
timeout /t 3 /nobreak

REM Start Frontend
echo 3️⃣  Starting Frontend (React on port 5173)...
start "Frontend" cmd /k "cd d:\PROJECTS\group\Readiness tracker\project && npm install && npm run dev"

echo.
echo ✅ All services starting...
echo.
echo 📊 Expected Services:
echo   - Ollama:     http://localhost:11434
echo   - AI Engine:  http://localhost:8000
echo   - Backend:    http://localhost:8080
echo   - Frontend:   http://localhost:5173
echo.
echo 🔍 Verification URLs:
echo   - AI Engine health:  curl http://localhost:8000/api/score/health
echo   - Backend health:    curl http://localhost:8080/actuator/health
echo   - Frontend:          http://localhost:5173
echo.
echo 📖 Full setup guide: SETUP_GUIDE.md
echo.
echo ⏳ Services are starting in separate windows...
echo ⏳ This may take 30-60 seconds for all components to be ready.
echo.
pause
