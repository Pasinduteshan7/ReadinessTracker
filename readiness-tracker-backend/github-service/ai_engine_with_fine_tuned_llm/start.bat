@echo off
REM Start Fine-Tuned LLM Analyzer (Windows)

echo.
echo ========================================
echo Fine-Tuned LLM Code Analyzer
echo ========================================
echo.

REM Check if venv exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install requirements
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Run the app
echo.
echo Starting Fine-Tuned LLM Analyzer on port 8000...
echo API Docs available at: http://localhost:8000/docs
echo.

python main.py

pause
