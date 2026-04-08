from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Video Reverse Search"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # Database - SQLite for HF Spaces, PostgreSQL for Docker
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./videosearch.db")
    DATABASE_URL_SYNC: str = os.environ.get("DATABASE_URL_SYNC", "sqlite:///./videosearch.db")

    # Redis / Celery - optional for HF Spaces
    REDIS_URL: str = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")

    # Storage
    STORAGE_BASE: str = "/data"
    FRAMES_DIR: str = "/data/frames"
    FEATURES_DIR: str = "/data/features"
    INDEX_DIR: str = "/data/index"
    VIDEOS_DIR: str = "/data/videos"

    # YouTube
    YT_MAX_DURATION: int = 3600
    YT_FORMAT: str = "bestvideo[ext=mp4]+bestaudio[ext=m44]/best[ext=mp4]/best"

    # ML
    MODEL_NAME: str = "resnet50"
    FRAME_INTERVAL: int = 60
    SIMILARITY_THRESHOLD: float = 0.5
    TOP_K_RESULTS: int = 10
    FAISS_INDEX_DIM: int = 2048

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 30

    # Authentication
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "change-this-secret-key-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))

    # Email
    EMAIL_PROVIDER: str = os.environ.get("EMAIL_PROVIDER", "mock")  # mock | resend | smtp
    RESEND_API_KEY: str = os.environ.get("RESEND_API_KEY", "")

    # SMTP settings
    SMTP_HOST: str = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER: str = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD: str = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.environ.get("SMTP_FROM", "noreply@eyedentify.app")
    SMTP_USE_TLS: bool = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

    # Frontend URL (for CORS and email links)
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")

    # Free tier
    FREE_TIER_DAILY_LIMIT: int = int(os.environ.get("FREE_TIER_DAILY_LIMIT", "1"))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
