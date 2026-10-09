@echo off
echo ========================================
echo   Employability Tracker Startup
echo ========================================

echo.
echo [1/3] Starting FastAPI backend on port 8001...
cd /d "%~dp0backend"
start "Employability Backend" cmd /k "venv\Scripts\activate && uvicorn main:app --reload --port 8001"

timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting React frontend on port 5174...
cd /d "%~dp0frontend"
start "Employability Frontend" cmd /k "npm run dev -- --port 5174"

echo.
echo [3/3] Waiting for services to start...
timeout /t 8 /nobreak >nul

echo.
echo Opening http://localhost:5174/ in browser...
start http://localhost:5174/

echo.
echo ========================================
echo   Services running!
echo   Backend: http://localhost:8001/docs
echo   Frontend: http://localhost:5174/
echo ========================================
pause