from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    JSON,
    Enum,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
import uuid

from app.database import Base


class VideoStatus(enum.Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    EXTRACTING = "extracting"
    ENCODING = "encoding"
    INDEXING = "indexing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisType(enum.Enum):
    SEARCH = "search"
    GPS = "gps"
    AI_DETECTION = "ai_detection"
    FULL = "full"


class AnalysisStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Video(Base):
    __tablename__ = "videos"
    __table_args__ = (
        Index("idx_videos_youtube_id", "youtube_id", unique=True),
        Index("idx_videos_status", "status"),
        Index("idx_videos_created_at", "created_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    youtube_id = Column(String(20), unique=True, nullable=False, index=True)
    youtube_url = Column(String(500), nullable=False)
    title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    channel = Column(String(300), nullable=True)
    duration = Column(Integer, nullable=True)  # seconds
    thumbnail_url = Column(String(500), nullable=True)
    upload_date = Column(String(20), nullable=True)

    # File paths
    local_path = Column(String(500), nullable=True)
    frames_count = Column(Integer, default=0)
    features_count = Column(Integer, default=0)

    # Status
    status = Column(Enum(VideoStatus), default=VideoStatus.PENDING)
    error_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    analyses = relationship("Analysis", back_populates="video", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Video {self.youtube_id}: {self.title}>"


class Analysis(Base):
    __tablename__ = "analyses"
    __table_args__ = (
        Index("idx_analyses_video_id", "video_id"),
        Index("idx_analyses_status", "status"),
        Index("idx_analyses_type", "analysis_type"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    analysis_type = Column(Enum(AnalysisType), default=AnalysisType.FULL)

    # Status
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    progress = Column(Float, default=0.0)  # 0.0 to 100.0
    error_message = Column(Text, nullable=True)

    # Results
    results = Column(JSON, nullable=True)  # Flexible JSON for any analysis type

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    video = relationship("Video", back_populates="analyses")

    def __repr__(self):
        return f"<Analysis {self.id}: {self.analysis_type.value} for {self.video_id}>"


class SearchResult(Base):
    __tablename__ = "search_results"
    __table_args__ = (
        Index("idx_search_analysis_id", "analysis_id"),
        Index("idx_search_matched_video_id", "matched_video_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    matched_video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id"), nullable=False)

    # Search metrics
    num_matching_frames = Column(Integer, default=0)
    avg_similarity = Column(Float, default=0.0)
    max_similarity = Column(Float, default=0.0)
    rank = Column(Integer, default=0)

    # Detailed matches (JSON array of frame-level matches)
    frame_matches = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    analysis = relationship("Analysis")
    matched_video = relationship("Video")


class UserSession(Base):
    __tablename__ = "user_sessions"
    __table_args__ = (
        Index("idx_sessions_session_key", "session_key", unique=True),
        Index("idx_sessions_expires", "expires_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_key = Column(String(100), unique=True, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    query_count = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Import relationship
from sqlalchemy.orm import relationship  # noqa: E402

Video.analyses = relationship("Analysis", back_populates="video", cascade="all, delete-orphan")
Analysis.video = relationship("Video", back_populates="analyses")
