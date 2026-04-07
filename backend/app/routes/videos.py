from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
import uuid
from loguru import logger

from app.database import get_db
from app.models import Video, Analysis, VideoStatus, AnalysisStatus, SearchResult
from app.schemas import (
    YouTubeSubmitRequest,
    SearchRequest,
    VideoResponse,
    AnalysisResponse,
    SearchResponse,
    SearchResultItem,
    TaskStatusResponse,
    ErrorResponse,
)
from app.services import YouTubeService, FAISSIndexManager
from app.tasks import process_video, analyze_video
from app.config import get_settings

router = APIRouter(prefix="/videos", tags=["Videos"])
settings = get_settings()


@router.post("/submit", response_model=VideoResponse)
async def submit_video(
    request: YouTubeSubmitRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a YouTube URL for processing.
    Downloads, extracts frames, encodes features, and adds to index.
    """
    yt_service = YouTubeService()

    # Validate URL
    try:
        metadata = yt_service.validate_video(request.youtube_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    youtube_id = metadata["youtube_id"]

    # Check if already exists
    result = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    existing = result.scalar_one_or_none()
    if existing:
        return VideoResponse(
            id=str(existing.id),
            youtube_id=existing.youtube_id,
            youtube_url=existing.youtube_url,
            title=existing.title,
            channel=existing.channel,
            duration=existing.duration,
            thumbnail_url=existing.thumbnail_url,
            status=VideoStatusEnum(existing.status.value),
            frames_count=existing.frames_count,
            features_count=existing.features_count,
            error_message=existing.error_message,
            created_at=existing.created_at,
        )

    # Create video record
    video = Video(
        youtube_id=youtube_id,
        youtube_url=request.youtube_url,
        title=metadata["title"],
        description=metadata["description"],
        channel=metadata["channel"],
        duration=metadata["duration"],
        thumbnail_url=metadata["thumbnail_url"],
        upload_date=metadata["upload_date"],
        status=VideoStatus.PENDING,
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)

    # Queue processing task
    task = process_video.delay(str(video.id), request.youtube_url)

    logger.info(f"Submitted YouTube video: {youtube_id} (task: {task.id})")

    return VideoResponse(
        id=str(video.id),
        youtube_id=video.youtube_id,
        youtube_url=video.youtube_url,
        title=video.title,
        channel=video.channel,
        duration=video.duration,
        thumbnail_url=video.thumbnail_url,
        status=VideoStatusEnum(video.status.value),
        frames_count=video.frames_count,
        features_count=video.features_count,
        error_message=video.error_message,
        created_at=video.created_at,
    )


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get video details by database ID."""
    try:
        video_uuid = uuid.UUID(video_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video ID")

    result = await db.execute(select(Video).where(Video.id == video_uuid))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return VideoResponse(
        id=str(video.id),
        youtube_id=video.youtube_id,
        youtube_url=video.youtube_url,
        title=video.title,
        channel=video.channel,
        duration=video.duration,
        thumbnail_url=video.thumbnail_url,
        status=VideoStatusEnum(video.status.value),
        frames_count=video.frames_count,
        features_count=video.features_count,
        error_message=video.error_message,
        created_at=video.created_at,
    )


@router.get("/youtube/{youtube_id}", response_model=VideoResponse)
async def get_video_by_youtube_id(
    youtube_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get video details by YouTube ID."""
    result = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return VideoResponse(
        id=str(video.id),
        youtube_id=video.youtube_id,
        youtube_url=video.youtube_url,
        title=video.title,
        channel=video.channel,
        duration=video.duration,
        thumbnail_url=video.thumbnail_url,
        status=VideoStatusEnum(video.status.value),
        frames_count=video.frames_count,
        features_count=video.features_count,
        error_message=video.error_message,
        created_at=video.created_at,
    )


@router.get("/", response_model=List[VideoResponse])
async def list_videos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all processed videos."""
    query = select(Video)

    if status:
        try:
            status_enum = VideoStatus(status)
            query = query.where(Video.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    query = query.order_by(desc(Video.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    videos = result.scalars().all()

    return [
        VideoResponse(
            id=str(v.id),
            youtube_id=v.youtube_id,
            youtube_url=v.youtube_url,
            title=v.title,
            channel=v.channel,
            duration=v.duration,
            thumbnail_url=v.thumbnail_url,
            status=VideoStatusEnum(v.status.value),
            frames_count=v.frames_count,
            features_count=v.features_count,
            error_message=v.error_message,
            created_at=v.created_at,
        )
        for v in videos
    ]


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a video and its analyses."""
    try:
        video_uuid = uuid.UUID(video_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video ID")

    result = await db.execute(select(Video).where(Video.id == video_uuid))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    await db.delete(video)
    await db.commit()

    # Clean up files
    yt_service = YouTubeService()
    yt_service.cleanup_video(video.youtube_id)

    return {"message": f"Video {video.youtube_id} deleted"}
