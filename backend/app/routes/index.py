from fastapi import APIRouter, Depends, HTTPException
from loguru import logger

from app.schemas import IndexStatsResponse, ErrorResponse
from app.services import FAISSIndexManager
from app.tasks import rebuild_index

router = APIRouter(prefix="/index", tags=["Index"])


@router.get("/stats")
async def get_index_stats():
    """Get FAISS index statistics."""
    index_manager = FAISSIndexManager()
    stats = index_manager.get_index_stats()

    return {
        "exists": stats.get("exists", False),
        "total_vectors": stats.get("total_vectors", 0),
        "total_videos": stats.get("total_videos", 0),
        "feature_dim": stats.get("feature_dim", 0),
        "file_size_mb": round(stats.get("file_size_mb", 0), 2),
    }


@router.post("/rebuild")
async def trigger_rebuild():
    """Trigger a full index rebuild from existing feature files."""
    task = rebuild_index.delay()
    logger.info(f"Triggered index rebuild: {task.id}")

    return {
        "task_id": task.id,
        "message": "Index rebuild started",
    }


@router.post("/reset")
async def reset_index():
    """Reset (delete) the entire search index."""
    index_manager = FAISSIndexManager()
    index_manager.reset_index()

    logger.warning("Search index has been reset")

    return {"message": "Index reset successfully"}
