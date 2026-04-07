from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import os

from app.config import get_settings
from app.database import engine, Base
from app.routes import videos, search, analyses, index

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Video Reverse Search API...")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured")

    # Ensure storage directories exist
    for dir_path in [
        settings.FRAMES_DIR,
        settings.FEATURES_DIR,
        settings.INDEX_DIR,
        settings.VIDEOS_DIR,
    ]:
        os.makedirs(dir_path, exist_ok=True)
    logger.info("Storage directories ensured")

    yield

    # Shutdown
    logger.info("Shutting down API...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered reverse video search engine with YouTube integration",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(videos.router, prefix=settings.API_PREFIX)
app.include_router(search.router, prefix=settings.API_PREFIX)
app.include_router(analyses.router, prefix=settings.API_PREFIX)
app.include_router(index.router, prefix=settings.API_PREFIX)


@app.get(f"{settings.API_PREFIX}/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/")
async def root():
    return {
        "message": "Video Reverse Search API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
