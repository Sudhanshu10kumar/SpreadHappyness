from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.middleware import SecurityHeadersMiddleware
from app.api.v1.router import api_router
import app.models  # Ensure all models are registered

# Automatically create schema tables in SQLite development/test mode
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Verseora — Premium Creative Writing, Shayari, and Poetry Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Enforce security response headers
app.add_middleware(SecurityHeadersMiddleware)

# Enforce strict CORS allowlist
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
def health_check():
    """System liveness and readiness probe endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
def root():
    """Root endpoint welcoming API clients."""
    return {
        "message": "Welcome to Verseora API",
        "docs": "/docs",
        "health": "/health"
    }

