@echo off
echo ==========================================
echo   LexAI Backend Startup
echo ==========================================
cd backend
call venv\Scripts\activate
echo Starting FastAPI server on http://localhost:8000
echo API docs at http://localhost:8000/api/docs
echo Press Ctrl+C to stop
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
