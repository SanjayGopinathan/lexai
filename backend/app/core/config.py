"""
Configuration management using Pydantic Settings
All values loaded from .env file
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────
    APP_NAME: str = "LexAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Security ─────────────────────────────────────────────────
    SECRET_KEY: str = "lexai-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── Database (PostgreSQL) ─────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/lexai_db"

    # ── AI APIs ──────────────────────────────────────────────────
    GROQ_API_KEY: str = ""           # Groq API key   # Optional fallback

    # ── CORS ─────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ]

    # ── File Upload ───────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
