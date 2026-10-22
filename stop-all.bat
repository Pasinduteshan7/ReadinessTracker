@echo off
REM GitHub Readiness Tracker - Complete Shutdown Script (Windows)
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"

pause
endlocal
