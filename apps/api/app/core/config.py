from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Verseora"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "insecure-secret-key-change-in-production-verseora-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./verseora.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Environment
    ENVIRONMENT: str = "development"
    
    # Security & Rate Limiting
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10
    RATE_LIMIT_DEFAULT_PER_MINUTE: int = 120
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

