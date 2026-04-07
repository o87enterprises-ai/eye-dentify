from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import os
import numpy as np
import httpx
from loguru import logger

from app.database import get_db
from app.models import Video, VideoStatus
from app.schemas import (
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    ErrorResponse,
)
from app.services import YouTubeService, FAISSIndexManager, FeatureEncoder
from app.config import get_settings

router = APIRouter(prefix="/search", tags=["Search"])
settings = get_settings()


@router.post("/", response_model=SearchResponse)
async def search_by_youtube(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Search for videos similar to a YouTube video.
    The video must already be in the database.
    """
    yt_service = YouTubeService()

    # Extract YouTube ID
    try:
        youtube_id = yt_service.youtube_url_to_id(request.youtube_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check if video exists in DB
    result = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(
            status_code=404,
            detail=f"Video {youtube_id} not in database. Submit it first.",
        )

    if video.status != VideoStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Video not ready yet. Status: {video.status.value}",
        )

    # Load features and search
    features_file = os.path.join(settings.FEATURES_DIR, f"{youtube_id}.npy")
    if not os.path.exists(features_file):
        raise HTTPException(status_code=404, detail="Features file not found")

    query_features = np.load(features_file)

    index_manager = FAISSIndexManager()
    results = index_manager.search(query_features, request.top_k, request.threshold)

    # Build response
    result_items = []
    for rank, item in enumerate(results[:request.top_k], 1):
        matched_result = await db.execute(
            select(Video).where(Video.youtube_id == item["video_id"])
        )
        matched_video = matched_result.scalar_one_or_none()

        if matched_video:
            result_items.append(
                SearchResultItem(
                    video_id=str(matched_video.id),
                    youtube_id=matched_video.youtube_id,
                    title=matched_video.title,
                    thumbnail_url=matched_video.thumbnail_url,
                    num_matches=item["num_matches"],
                    avg_similarity=item["avg_similarity"],
                    max_similarity=item["max_similarity"],
                    rank=rank,
                )
            )

    return SearchResponse(
        query_video_id=str(video.id),
        results=result_items,
        total_results=len(result_items),
    )


@router.post("/image", response_model=SearchResponse)
async def search_by_image(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Search for videos similar to an image URL.
    Downloads image, encodes it, and searches the index.
    """
    # Download image
    async with httpx.AsyncClient() as client:
        response = await client.get(request.youtube_url, timeout=30)
        response.raise_for_status()

        # Save temporarily
        temp_path = f"/tmp/query_image_{uuid.uuid4().hex}.jpg"
        with open(temp_path, "wb") as f:
            f.write(response.content)

    try:
        # Encode image
        encoder = FeatureEncoder()
        features = encoder.encode_image(temp_path)

        # Search
        index_manager = FAISSIndexManager()
        results = index_manager.search(features.reshape(1, -1), request.top_k, request.threshold)

        # Build response
        result_items = []
        for rank, item in enumerate(results[:request.top_k], 1):
            matched_result = await db.execute(
                select(Video).where(Video.youtube_id == item["video_id"])
            )
            matched_video = matched_result.scalar_one_or_none()

            if matched_video:
                result_items.append(
                    SearchResultItem(
                        video_id=str(matched_video.id),
                        youtube_id=matched_video.youtube_id,
                        title=matched_video.title,
                        thumbnail_url=matched_video.thumbnail_url,
                        num_matches=item["num_matches"],
                        avg_similarity=item["avg_similarity"],
                        max_similarity=item["max_similarity"],
                        rank=rank,
                    )
                )

        return SearchResponse(
            query_video_id="image_query",
            results=result_items,
            total_results=len(result_items),
        )

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/stats")
async def search_stats():
    """Get search index statistics."""
    index_manager = FAISSIndexManager()
    stats = index_manager.get_index_stats()

    return {
        "index_exists": stats.get("exists", False),
        "total_vectors": stats.get("total_vectors", 0),
        "total_videos": stats.get("total_videos", 0),
        "feature_dim": stats.get("feature_dim", 0),
        "file_size_mb": round(stats.get("file_size_mb", 0), 2),
    }
