#!/bin/bash
echo "=========================================="
echo "  LexAI Backend Startup"
echo "=========================================="
cd backend
source venv/bin/activate
echo "Starting FastAPI on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
