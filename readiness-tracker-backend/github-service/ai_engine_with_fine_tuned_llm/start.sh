#!/bin/bash
# Start Fine-Tuned LLM Analyzer (Linux/Mac)

echo ""
echo "========================================"
echo "Fine-Tuned LLM Code Analyzer"
echo "========================================"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install requirements
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the app
echo ""
echo "Starting Fine-Tuned LLM Analyzer on port 8000..."
echo "API Docs available at: http://localhost:8000/docs"
echo ""

python main.py
