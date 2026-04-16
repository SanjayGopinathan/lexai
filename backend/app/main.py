"""
LexAI - AI-Powered Legal Platform
FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.routes import auth, qa, moot, document, cases, student

app = FastAPI(
    title="LexAI API",
    description="AI-Powered Legal Intelligence Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── ROUTES ────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Authentication"])
app.include_router(qa.router,       prefix="/api/qa",       tags=["Legal Q&A"])
app.include_router(moot.router,     prefix="/api/moot",     tags=["Moot Court"])
app.include_router(document.router, prefix="/api/document", tags=["Document Scanner"])
app.include_router(cases.router,    prefix="/api/cases",    tags=["Case Law"])
app.include_router(student.router,  prefix="/api/student",  tags=["Student Dashboard"])

# ── STARTUP ───────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✅ LexAI API started successfully")
    print(f"📖 Docs: http://localhost:8000/api/docs")

@app.get("/")
async def root():
    return {"message": "LexAI API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
