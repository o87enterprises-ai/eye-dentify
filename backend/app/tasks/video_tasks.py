import os
from typing import Dict, Any
from datetime import datetime
from loguru import logger

from app.celery_app import celery_app
from app.database import async_session_factory
from app.models import Video, Analysis, SearchResult, VideoStatus, AnalysisStatus
from app.services import YouTubeService, VideoAnalyzer, FAISSIndexManager
from app.config import get_settings

from sqlalchemy import select, update

settings = get_settings()


@celery_app.task(bind=True, name="tasks.process_video")
def process_video(
    self,
    video_id: str,
    youtube_url: str,
) -> Dict[str, Any]:
    """
    Complete video processing pipeline:
    1. Download from YouTube
    2. Extract frames
    3. Encode features
    4. Add to search index
    """
    import asyncio

    async def _run():
        async with async_session_factory() as db:
            # Get video record
            result = await db.execute(select(Video).where(Video.id == video_id))
            video = result.scalar_one_or_none()
            if not video:
                return {"error": "Video not found"}

            # Update status
            video.status = VideoStatus.DOWNLOADING
            await db.commit()

            yt_service = YouTubeService(settings.VIDEOS_DIR)

            try:
                # Step 1: Download video
                self.update_state(state="DOWNLOADING", meta={"progress": 10})
                logger.info(f"Downloading {video.youtube_id}...")
                local_path = await yt_service.download_video(
                    youtube_url, video.youtube_id
                )
                video.local_path = local_path
                video.status = VideoStatus.EXTRACTING
                await db.commit()

                # Step 2: Extract frames and encode
                self.update_state(state="EXTRACTING", meta={"progress": 30})
                logger.info(f"Analyzing {video.youtube_id}...")

                analyzer = VideoAnalyzer()
                analysis_results = analyzer.analyze_video_full(
                    local_path,
                    video.youtube_id,
                )

                video.frames_count = analysis_results["frame_extraction"]["frames_extracted"]
                video.features_count = analysis_results["feature_encoding"]["features_count"]
                video.status = VideoStatus.INDEXING
                await db.commit()

                # Step 3: Add to index
                self.update_state(state="INDEXING", meta={"progress": 80})
                logger.info(f"Indexing {video.youtube_id}...")

                index_manager = FAISSIndexManager()
                features_file = analysis_results["feature_encoding"]["features_file"]
                index_manager.add_video_features(video.youtube_id, features_file)

                # Complete
                video.status = VideoStatus.COMPLETED
                await db.commit()

                self.update_state(state="COMPLETED", meta={"progress": 100})

                return {
                    "success": True,
                    "video_id": str(video.id),
                    "youtube_id": video.youtube_id,
                    "frames": video.frames_count,
                    "features": video.features_count,
                }

            except Exception as e:
                logger.error(f"Failed to process {video.youtube_id}: {e}")
                video.status = VideoStatus.FAILED
                video.error_message = str(e)
                await db.commit()
                return {"error": str(e)}

    return asyncio.run(_run())


@celery_app.task(bind=True, name="tasks.analyze_video")
def analyze_video(
    self,
    video_id: str,
    analysis_id: str,
    analysis_type: str = "full",
) -> Dict[str, Any]:
    """
    Run analysis on an already-processed video:
    - GPS extraction
    - AI detection
    - Reverse search
    """
    import asyncio

    async def _run():
        async with async_session_factory() as db:
            result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
            analysis = result.scalar_one_or_none()
            if not analysis:
                return {"error": "Analysis not found"}

            result = await db.execute(select(Video).where(Video.id == video_id))
            video = result.scalar_one_or_none()
            if not video or not video.local_path:
                return {"error": "Video not found or not downloaded"}

            analysis.status = AnalysisStatus.RUNNING
            await db.commit()

            try:
                results = {}

                # AI Detection
                if analysis_type in ["ai", "full"]:
                    self.update_state(state="AI_DETECTION", meta={"progress": 30})
                    from app.services import AIDetector

                    ai_results = AIDetector.analyze_video(video.local_path)
                    results["ai_detection"] = ai_results

                # GPS/Metadata
                if analysis_type in ["gps", "full"]:
                    self.update_state(state="GPS_EXTRACTION", meta={"progress": 60})
                    results["metadata"] = {
                        "youtube_id": video.youtube_id,
                        "title": video.title,
                        "channel": video.channel,
                        "duration": video.duration,
                        "upload_date": video.upload_date,
                    }

                # Reverse search
                if analysis_type in ["search", "full"]:
                    self.update_state(state="SEARCH", meta={"progress": 80})
                    index_manager = FAISSIndexManager()

                    features_file = f"{settings.FEATURES_DIR}/{video.youtube_id}.npy"
                    if os.path.exists(features_file):
                        import numpy as np

                        query_features = np.load(features_file)
                        search_results = index_manager.search(query_features)

                        # Store search results
                        for rank, result_item in enumerate(search_results[:10], 1):
                            matched_result = await db.execute(
                                select(Video).where(
                                    Video.youtube_id == result_item["video_id"]
                                )
                            )
                            matched_video = matched_result.scalar_one_or_none()
                            if matched_video:
                                search_result = SearchResult(
                                    analysis_id=analysis_id,
                                    matched_video_id=matched_video.id,
                                    num_matching_frames=result_item["num_matches"],
                                    avg_similarity=result_item["avg_similarity"],
                                    max_similarity=result_item["max_similarity"],
                                    rank=rank,
                                    frame_matches=result_item["frame_matches"],
                                )
                                db.add(search_result)

                        results["search"] = search_results[:10]

                analysis.status = AnalysisStatus.COMPLETED
                analysis.results = results
                analysis.progress = 100.0
                analysis.completed_at = datetime.utcnow()
                await db.commit()

                self.update_state(state="COMPLETED", meta={"progress": 100})

                return {"success": True, "analysis_id": str(analysis.id)}

            except Exception as e:
                logger.error(f"Analysis failed for {video_id}: {e}")
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                await db.commit()
                return {"error": str(e)}

    return asyncio.run(_run())


@celery_app.task(bind=True, name="tasks.rebuild_index")
def rebuild_index(self) -> Dict[str, Any]:
    """Rebuild the entire FAISS index from existing feature files."""
    try:
        self.update_state(state="BUILDING", meta={"progress": 0})

        index_manager = FAISSIndexManager()
        stats = index_manager.build_index()

        self.update_state(state="COMPLETED", meta={"progress": 100})

        return {"success": True, **stats}
    except Exception as e:
        logger.error(f"Index rebuild failed: {e}")
        return {"error": str(e)}
