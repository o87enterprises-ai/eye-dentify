from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# === Request Schemas ===

class YouTubeSubmitRequest(BaseModel):
    youtube_url: str = Field(..., description="YouTube video URL or ID")
    analysis_type: str = Field(default="full", description="full, search, gps, or ai")


class SearchRequest(BaseModel):
    youtube_url: str = Field(..., description="YouTube video URL to search against index")
    top_k: int = Field(default=10, ge=1, le=100)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


class ImageSearchRequest(BaseModel):
    image_url: str = Field(..., description="URL of image to search")
    top_k: int = Field(default=10, ge=1, le=100)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


class BatchSubmitRequest(BaseModel):
    youtube_urls: List[str] = Field(..., min_items=1, max_items=50)
    analysis_type: str = Field(default="full")


# === Response Schemas ===

class VideoStatusEnum(str, Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    EXTRACTING = "extracting"
    ENCODING = "encoding"
    INDEXING = "indexing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisStatusEnum(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoResponse(BaseModel):
    id: str
    youtube_id: str
    youtube_url: str
    title: Optional[str]
    channel: Optional[str]
    duration: Optional[int]
    thumbnail_url: Optional[str]
    status: VideoStatusEnum
    frames_count: int
    features_count: int
    error_message: Optional[str]
    created_at: datetime


class AnalysisResponse(BaseModel):
    id: str
    video_id: str
    analysis_type: str
    status: AnalysisStatusEnum
    progress: float
    results: Optional[Dict[str, Any]]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]


class SearchResultItem(BaseModel):
    video_id: str
    youtube_id: str
    title: Optional[str]
    thumbnail_url: Optional[str]
    num_matches: int
    avg_similarity: float
    max_similarity: float
    rank: int


class SearchResponse(BaseModel):
    query_video_id: str
    results: List[SearchResultItem]
    total_results: int


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    progress: float
    result: Optional[Dict[str, Any]]


class IndexStatsResponse(BaseModel):
    exists: bool
    total_vectors: int
    total_videos: int
    feature_dim: int
    file_size_mb: float


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
