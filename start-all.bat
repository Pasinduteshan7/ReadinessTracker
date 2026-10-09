@echo off
REM GitHub Readiness Tracker - Complete Startup Script (Windows)

setlocal

echo.
echo ========================================
echo   GitHub Readiness Tracker - Startup
echo ========================================
echo.

REM === Check Prerequisites ===
echo Checking prerequisites...

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Java not found. Please install Java 17+
    pause
    exit /b 1
)
echo [OK] Java detected

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js detected

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)
echo [OK] Python detected

REM === Optional: Ollama check ===
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -UseBasicParsing -ErrorAction Stop; Write-Host '[OK] Ollama running' } catch { Write-Host '[--] Ollama not running (optional)' }"

echo.
echo Starting all components...
echo.

REM === 1. AI Engine (Python/FastAPI on port 8000) ===
echo [1/5] Starting AI Engine (Python/FastAPI on port 8000)...
start "AI Engine" cmd /k "cd /d "%~dp0readiness-tracker-backend\github-service\ai_engine_with_fine_tuned_llm" && start.bat"
timeout /t 5 /nobreak >nul

REM === 2. Backend (Spring Boot on port 8080) ===
echo [2/5] Starting Backend (Spring Boot on port 8080)...
start "Backend" cmd /k "cd /d "%~dp0readiness-tracker-backend" && gradlew bootRun"
timeout /t 5 /nobreak >nul

REM === 3. Frontend (React on port 5173) ===
echo [3/5] Starting Frontend (React on port 5173)...
start "Frontend" cmd /k "cd /d "%~dp0project" && npm run dev"
timeout /t 3 /nobreak >nul

REM === 4. Employability Backend (FastAPI on port 8001) ===
echo [4/5] Starting Employability Backend (FastAPI on port 8001)...
start "Employability Backend" cmd /k "cd /d "%~dp0employability-tracker\backend" && venv\Scripts\activate && uvicorn main:app --reload --port 8001"
timeout /t 5 /nobreak >nul

REM === 5. Employability Frontend (React on port 5174) ===
echo [5/5] Starting Employability Frontend (React on port 5174)...
start "Employability Frontend" cmd /k "cd /d "%~dp0employability-tracker\frontend" && npm run dev -- --port 5174"

echo.
echo ========================================
echo   All services starting...
echo ========================================
echo.
echo Expected Services:
echo   - AI Engine:              http://localhost:8000
echo   - Backend (Spring):       http://localhost:8080
echo   - Frontend (Main):        http://localhost:5173
echo   - Employability Backend:  http://localhost:8001/docs
echo   - Employability Frontend: http://localhost:5174
echo.
echo Services are starting in separate windows.
echo.
pause
endlocal