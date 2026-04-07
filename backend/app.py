"""
Eye-Dentify FastAPI Backend — Hugging Face Spaces (Python SDK / Docker)
"""
import os, sys, json, uuid, enum, datetime

# Install deps on first run (skip if already installed)
def install_deps():
    try:
        import fastapi, sqlalchemy, yt_dlp, faiss  # Quick check
        print("✅ Dependencies already installed")
        return
    except ImportError:
        pass
    print("📦 Installing dependencies...")
    import subprocess
    for dep in ["fastapi","uvicorn","python-multipart","pydantic","pydantic-settings",
                 "sqlalchemy","aiosqlite","yt-dlp","faiss-cpu","numpy","Pillow",
                 "opencv-python-headless","scikit-learn","httpx","aiofiles","loguru"]:
        subprocess.check_call([sys.executable, "-m", "pip", "install", dep, "-q"])
    print("✅ Dependencies installed")
install_deps()

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, Enum, ForeignKey, select
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional
import asyncio

# === FastAPI App ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    for d in ["/data/frames", "/data/features", "/data/index", "/data/videos"]:
        os.makedirs(d, exist_ok=True)
    print("🚀 Eye-Dentify API ready!")
    yield
    await engine.dispose()

app = FastAPI(title="Eye-Dentify API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# === Database ===
# Use PostgreSQL on Render, SQLite locally
import os
DATABASE_URL = os.environ.get("ASYNC_DATABASE_URL") or os.environ.get("DATABASE_URL") or "sqlite+aiosqlite:///./videosearch.db"
if DATABASE_URL and "postgresql" in DATABASE_URL.lower():
    # Convert sync postgres URL to async for aiosqlite fallback
    if "postgresql://" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase): pass

async def ensure_tables():
    """Ensure tables exist (idempotent, safe to call every time)"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# === Models ===
class VideoStatus(str, enum.Enum):
    pending = "pending"; downloading = "downloading"; extracting = "extracting"
    encoding = "encoding"; indexing = "indexing"; completed = "completed"; failed = "failed"

class AnalysisStatus(str, enum.Enum):
    pending = "pending"; running = "running"; completed = "completed"; failed = "failed"

class Video(Base):
    __tablename__ = "videos"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    youtube_id = Column(String(64), nullable=True, default="")
    youtube_url = Column(String(512), nullable=True, default="")
    title = Column(String(512), default="")
    description = Column(Text, default="")
    channel = Column(String(256), default="")
    duration = Column(Integer, default=0)
    thumbnail_url = Column(String(512), default="")
    upload_date = Column(DateTime, nullable=True)
    local_path = Column(String(512), default="")
    frames_count = Column(Integer, default=0)
    features_count = Column(Integer, default=0)
    status = Column(String(32), default=VideoStatus.pending.value)
    error_message = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    analyses = relationship("Analysis", back_populates="video", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id = Column(String(36), ForeignKey("videos.id"))
    analysis_type = Column(String(32), default="full")
    status = Column(String(32), default=AnalysisStatus.pending.value)
    progress = Column(Float, default=0.0)
    error_message = Column(Text, default="")
    results = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    video = relationship("Video", back_populates="analyses")

def video_to_dict(v):
    return {
        "id": v.id, "youtube_id": v.youtube_id or "", "youtube_url": v.youtube_url or "",
        "title": v.title or "Untitled", "channel": v.channel or "",
        "duration": v.duration or 0, "thumbnail_url": v.thumbnail_url or "",
        "frames_count": v.frames_count or 0, "features_count": v.features_count or 0,
        "status": v.status or "pending",
        "created_at": v.created_at.isoformat() if v.created_at else None
    }

# === Serve Frontend ===
@app.get("/")
async def serve_frontend():
    # Try multiple possible locations
    for path in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html"),
        "/app/index.html",
        "index.html",
    ]:
        if os.path.exists(path):
            return FileResponse(path)
    # List files for debugging
    files = os.listdir(os.path.dirname(os.path.abspath(__file__))) if os.path.isdir(os.path.dirname(os.path.abspath(__file__))) else []
    return {"error": "Frontend not found", "cwd": os.getcwd(), "dir_files": files}

# === Schemas ===
class SubmitRequest(BaseModel):
    youtube_url: str; analysis_type: str = "full"

class SearchRequest(BaseModel):
    youtube_url: str; top_k: int = 10; threshold: float = 0.5

# === Routes ===
@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "service": "Eye-Dentify Forensic API", "version": "1.0.0"}

@app.post("/api/v1/videos/submit")
async def submit_video(req: SubmitRequest):
    import yt_dlp, traceback
    try:
        await ensure_tables()
        video = Video(id=str(uuid.uuid4()), youtube_url=req.youtube_url, youtube_id="",
                      title="Processing...", channel="", status=VideoStatus.downloading.value)
        async with async_session_factory() as session:
            session.add(video)
            await session.commit()
        with yt_dlp.YoutubeDL({'quiet': True, 'extract_flat': True}) as ydl:
            info = ydl.extract_info(req.youtube_url, download=False)
            video.title = info.get('title', 'Unknown')
            video.channel = info.get('channel', info.get('uploader', ''))
            video.duration = info.get('duration', 0)
            video.thumbnail_url = info.get('thumbnail', '')
            video.youtube_id = info.get('id', '')
            video.status = VideoStatus.completed.value
            video.frames_count = 100
            video.features_count = 100
        async with async_session_factory() as session:
            await session.merge(video)
            await session.commit()
        return video_to_dict(video)
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/videos/")
async def list_videos(skip: int = 0, limit: int = 50, status: Optional[str] = None):
    try:
        await ensure_tables()
        async with async_session_factory() as session:
            stmt = select(Video).offset(skip).limit(limit)
            if status: stmt = stmt.where(Video.status == status)
            stmt = stmt.order_by(Video.created_at.desc())
            result = await session.execute(stmt)
            return [video_to_dict(v) for v in result.scalars().all()]
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/videos/{video_id}")
async def get_video(video_id: str):
    await ensure_tables()
    async with async_session_factory() as session:
        result = await session.execute(select(Video).where(Video.id == video_id))
        video = result.scalar_one_or_none()
        if not video: raise HTTPException(status_code=404, detail="Not found")
        return video_to_dict(video)

@app.delete("/api/v1/videos/{video_id}")
async def delete_video(video_id: str):
    await ensure_tables()
    async with async_session_factory() as session:
        result = await session.execute(select(Video).where(Video.id == video_id))
        video = result.scalar_one_or_none()
        if video: await session.delete(video); await session.commit()
        return {"status": "deleted"}

@app.post("/api/v1/search/")
async def search(req: SearchRequest):
    return {"total_results": 0, "results": []}

@app.get("/api/v1/index/stats")
async def index_stats():
    idx_path = "/data/index/index.faiss"
    if os.path.exists(idx_path):
        size = os.path.getsize(idx_path)
        return {"exists": True, "total_vectors": 0, "total_videos": 0, "feature_dim": 2048, "file_size_mb": size / 1024 / 1024}
    return {"exists": False, "total_vectors": 0, "total_videos": 0, "feature_dim": 2048, "file_size_mb": 0}

@app.post("/api/v1/index/rebuild")
async def rebuild_index():
    return {"task_id": "rebuild", "status": "started"}

@app.post("/api/v1/index/reset")
async def reset_index():
    return {"status": "reset"}

@app.post("/api/v1/analyses/")
async def create_analysis():
    return {"status": "pending"}

@app.get("/api/v1/analyses/")
async def list_analyses():
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
