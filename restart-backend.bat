@echo off
REM Restart Spring Boot Backend (Port 8080)
setlocal

echo ========================================================
echo   Restarting Spring Boot Backend (Port 8080)
echo ========================================================
echo.

echo [1/3] Stopping any process running on port 8080...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [2/3] Setting directory to readiness-tracker-backend...
cd /d "%~dp0readiness-tracker-backend"

echo [3/3] Loading .env variables and starting Spring Boot (Supabase connected)...
for /f "usebackq tokens=1* delims==" %%A in (".env") do if not "%%A"=="" set "%%A=%%B"

echo.
gradlew.bat bootRun

endlocal
