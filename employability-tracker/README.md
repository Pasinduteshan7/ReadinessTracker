# Employability Readiness Tracker

AI-powered system that analyzes LinkedIn/resume PDFs and predicts IT industry readiness.

## Features
- 📄 PDF parsing with section extraction
- 🎯 6-dimension readiness scoring (0-100)
- 🤖 Job category classification (8 IT roles)
- 💡 Gemini-powered RAG recommendations
- 🏆 Cohort ranking with percentile analysis

## Tech Stack
**Backend:** Python, FastAPI, SQLAlchemy, PyMuPDF, sentence-transformers, Gemini API
**Frontend:** React, Vite, Tailwind CSS, Recharts
**Database:** SQLite

## Setup
### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Add GEMINI_API_KEY to .env
uvicorn main:app --reload