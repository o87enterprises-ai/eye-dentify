from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import uuid
from loguru import logger

from app.database import get_db
from app.models import Video, Analysis, AnalysisStatus, AnalysisType
from app.schemas import (
    AnalysisResponse,
    ErrorResponse,
)
from app.tasks import analyze_video

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.post("/{video_id}", response_model=AnalysisResponse)
async def create_analysis(
    video_id: str,
    analysis_type: str = Query(default="full", description="full, search, gps, or ai"),
    db: AsyncSession = Depends(get_db),
):
    """Create a new analysis for a video."""
    try:
        video_uuid = uuid.UUID(video_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video ID")

    # Check video exists
    result = await db.execute(select(Video).where(Video.id == video_uuid))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        analysis_type_enum = AnalysisType(analysis_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis type. Must be: full, search, gps, ai",
        )

    analysis = Analysis(
        video_id=video_uuid,
        analysis_type=analysis_type_enum,
        status=AnalysisStatus.PENDING,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Queue analysis task
    task = analyze_video.delay(str(video.id), str(analysis.id), analysis_type)

    logger.info(f"Created analysis {analysis.id} for video {video_id}")

    return AnalysisResponse(
        id=str(analysis.id),
        video_id=str(analysis.video_id),
        analysis_type=analysis.analysis_type.value,
        status=AnalysisStatusEnum(analysis.status.value),
        progress=analysis.progress,
        results=analysis.results,
        error_message=analysis.error_message,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get analysis status and results."""
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")

    result = await db.execute(select(Analysis).where(Analysis.id == analysis_uuid))
    analysis = result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return AnalysisResponse(
        id=str(analysis.id),
        video_id=str(analysis.video_id),
        analysis_type=analysis.analysis_type.value,
        status=AnalysisStatusEnum(analysis.status.value),
        progress=analysis.progress,
        results=analysis.results,
        error_message=analysis.error_message,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.get("/", response_model=List[AnalysisResponse])
async def list_analyses(
    video_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List analyses, optionally filtered by video or status."""
    query = select(Analysis)

    if video_id:
        try:
            video_uuid = uuid.UUID(video_id)
            query = query.where(Analysis.video_id == video_uuid)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid video ID")

    if status:
        try:
            status_enum = AnalysisStatus(status)
            query = query.where(Analysis.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    query = query.order_by(desc(Analysis.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    analyses = result.scalars().all()

    return [
        AnalysisResponse(
            id=str(a.id),
            video_id=str(a.video_id),
            analysis_type=a.analysis_type.value,
            status=AnalysisStatusEnum(a.status.value),
            progress=a.progress,
            results=a.results,
            error_message=a.error_message,
            created_at=a.created_at,
            completed_at=a.completed_at,
        )
        for a in analyses
    ]


# Need to import this for the enum conversion
from app.schemas import AnalysisStatusEnum  # noqa: E402
