from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "ApplyFlow"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    APP_ENV: str = "development"
    
    # Must be provided through the environment (Render supplies a generated value).
    # There is deliberately no public, predictable development fallback.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/applyflow.db")
    
    # AI Configuration
    USE_MOCK_AI: bool = os.getenv("USE_MOCK_AI", "true").lower() in ("true", "1", "yes")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")

    # Transactional email (Brevo)
    BREVO_API_KEY: str = ""
    BREVO_SENDER_EMAIL: str = ""
    BREVO_SENDER_NAME: str = "ApplyFlow"
    FRONTEND_BASE_URL: str = "http://127.0.0.1:5173"
    EMAIL_VERIFICATION_TTL_MINUTES: int = 1440
    
    # Mock Jobs
    USE_MOCK_JOBS: bool = os.getenv("USE_MOCK_JOBS", "true").lower() in ("true", "1", "yes")
    # JSON array: [{"provider":"greenhouse","token":"company-board","company":"Company"}]
    JOB_BOARDS: str = "[]"
    # Set to IN to store India-only listings; ALL keeps additional markets available.
    JOB_COUNTRY: str = "ALL"
    
    # Upload storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_FILE_SIZE_MB: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
