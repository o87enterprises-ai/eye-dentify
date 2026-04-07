"""
YouTube integration service - handles video download and metadata extraction.
"""
import os
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass

import yt_dlp
from loguru import logger

from app.config import get_settings

settings = get_settings()


@dataclass
class YouTubeVideoInfo:
    youtube_id: str
    url: str
    title: str
    description: str
    channel: str
    duration: int  # seconds
    thumbnail_url: str
    upload_date: str
    local_path: str


class YouTubeService:
    """Service for interacting with YouTube - download and metadata extraction."""

    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or settings.VIDEOS_DIR
        os.makedirs(self.output_dir, exist_ok=True)

    def extract_metadata(self, url: str) -> Dict[str, Any]:
        """Extract metadata from a YouTube URL without downloading."""
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
            "socket_timeout": 30,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    "youtube_id": info.get("id", ""),
                    "url": info.get("webpage_url", url),
                    "title": info.get("title", ""),
                    "description": info.get("description", "") or "",
                    "channel": info.get("channel", "") or info.get("uploader", ""),
                    "duration": info.get("duration", 0),
                    "thumbnail_url": info.get("thumbnail", ""),
                    "upload_date": info.get("upload_date", ""),
                }
        except Exception as e:
            logger.error(f"Failed to extract metadata from {url}: {e}")
            raise

    def validate_video(self, url: str) -> Dict[str, Any]:
        """Validate a YouTube URL and check if it meets criteria."""
        metadata = self.extract_metadata(url)

        # Check duration
        if metadata.get("duration", 0) > settings.YT_MAX_DURATION:
            raise ValueError(
                f"Video too long: {metadata['duration']}s > {settings.YT_MAX_DURATION}s max"
            )

        if metadata.get("duration", 0) == 0:
            raise ValueError("Could not determine video duration")

        return metadata

    async def download_video(self, url: str, youtube_id: str) -> str:
        """
        Download a YouTube video to local storage.
        Returns the local file path.
        """
        output_template = os.path.join(self.output_dir, f"{youtube_id}.%(ext)s")

        ydl_opts = {
            "format": settings.YT_FORMAT,
            "outtmpl": output_template,
            "quiet": True,
            "no_warnings": True,
            "merge_output_format": "mp4",
            "retries": 3,
            "fragment_retries": 3,
            "socket_timeout": 30,
        }

        def _download():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                # Find the actual file
                for ext in ["mp4", "webm", "mkv", "avi"]:
                    path = os.path.join(self.output_dir, f"{youtube_id}.{ext}")
                    if os.path.exists(path):
                        return path
                # Try to find any file matching the pattern
                for f in os.listdir(self.output_dir):
                    if f.startswith(f"{youtube_id}.") and not f.startswith("._"):
                        return os.path.join(self.output_dir, f)
                raise FileNotFoundError(f"Downloaded file not found for {youtube_id}")

        return await asyncio.to_thread(_download)

    def get_thumbnail_path(self, youtube_id: str) -> Optional[str]:
        """Get path to video thumbnail if it exists."""
        for ext in ["jpg", "png", "webp"]:
            path = os.path.join(self.output_dir, f"{youtube_id}_thumbnail.{ext}")
            if os.path.exists(path):
                return path
        return None

    async def download_thumbnail(self, url: str, youtube_id: str) -> Optional[str]:
        """Download video thumbnail."""
        try:
            metadata = self.extract_metadata(url)
            thumbnail_url = metadata.get("thumbnail_url")
            if not thumbnail_url:
                return None

            import httpx

            async with httpx.AsyncClient() as client:
                response = await client.get(thumbnail_url, timeout=30)
                response.raise_for_status()

                ext = thumbnail_url.split(".")[-1].split("?")[0] or "jpg"
                thumb_path = os.path.join(self.output_dir, f"{youtube_id}_thumbnail.{ext}")

                with open(thumb_path, "wb") as f:
                    f.write(response.content)

                return thumb_path
        except Exception as e:
            logger.error(f"Failed to download thumbnail for {youtube_id}: {e}")
            return None

    def cleanup_video(self, youtube_id: str):
        """Remove downloaded video files."""
        for f in os.listdir(self.output_dir):
            if f.startswith(f"{youtube_id}.") and not f.startswith("._"):
                try:
                    os.remove(os.path.join(self.output_dir, f))
                except Exception as e:
                    logger.error(f"Failed to cleanup {f}: {e}")

    def youtube_url_to_id(self, url: str) -> str:
        """Extract YouTube video ID from various URL formats."""
        import re

        patterns = [
            r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})",
            r"youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})",
            r"youtube\.com\/v\/([a-zA-Z0-9_-]{11})",
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        # If it's already just an ID
        if re.match(r"^[a-zA-Z0-9_-]{11}$", url):
            return url

        raise ValueError(f"Invalid YouTube URL: {url}")
