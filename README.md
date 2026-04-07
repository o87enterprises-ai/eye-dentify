# Video Reverse Search - Web Application

A scalable web application that uses YouTube as a database for reverse video search. Submit YouTube URLs, analyze their visual content with AI, and find similar videos using vector similarity search.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   React UI  │────▶│  FastAPI    │────▶│  Celery      │
│  (Port 3000)│     │  (Port 8000)│     │  Workers     │
└─────────────┘     └──────┬──────┘     └──────┬───────┘
                           │                   │
                    ┌──────▼──────┐     ┌──────▼───────┐
                    │ PostgreSQL  │     │    Redis     │
                    │  (Port 5432)│     │  (Port 6379) │
                    └─────────────┘     └──────────────┘
                                               │
                                        ┌──────▼───────┐
                                        │    FAISS     │
                                        │  Index Store │
                                        └──────────────┘
```

## Features

- **YouTube Integration**: Submit any YouTube URL for automatic download and analysis
- **Reverse Video Search**: Find visually similar videos using ResNet50 embeddings
- **AI/CGI Detection**: Detect AI-generated or manipulated video content
- **Metadata Extraction**: Extract video metadata and GPS coordinates
- **Async Processing**: Celery workers handle video processing in the background
- **Scalable**: Docker-compose setup ready for production deployment
- **REST API**: Full OpenAPI/Swagger documentation at `/docs`

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose (or `docker compose` plugin)
- 8GB+ RAM (16GB recommended for ML processing)
- 10GB+ free disk space

### 2. Setup & Launch

```bash
cd webapp
chmod +x setup.sh
./setup.sh
```

This will:
- Create `.env` from template
- Build Docker images
- Start all services (API, Worker, Frontend, PostgreSQL, Redis)

### 3. Access the Application

| Service | URL |
|---------|-----|
| Frontend UI | http://localhost:3000 |
| API Documentation | http://localhost:8000/docs |
| API Health Check | http://localhost:8000/api/v1/health |

## API Endpoints

### Videos
```
POST   /api/v1/videos/submit          Submit YouTube URL for processing
GET    /api/v1/videos/                List all videos
GET    /api/v1/videos/{id}            Get video details
GET    /api/v1/videos/youtube/{id}    Get video by YouTube ID
DELETE /api/v1/videos/{id}            Delete video
```

### Search
```
POST   /api/v1/search/                Search by YouTube URL
POST   /api/v1/search/image           Search by image URL
GET    /api/v1/search/stats           Get search index stats
```

### Analyses
```
POST   /api/v1/analyses/{video_id}    Create analysis task
GET    /api/v1/analyses/{id}          Get analysis results
GET    /api/v1/analyses/              List analyses
```

### Index Management
```
GET    /api/v1/index/stats            Get index statistics
POST   /api/v1/index/rebuild          Trigger full index rebuild
POST   /api/v1/index/reset            Reset (delete) index
```

## Usage Examples

### Submit a YouTube Video
```bash
curl -X POST http://localhost:8000/api/v1/videos/submit \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Search for Similar Videos
```bash
curl -X POST http://localhost:8000/api/v1/search/ \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "top_k": 10, "threshold": 0.5}'
```

### Check Analysis Results
```bash
curl http://localhost:8000/api/v1/analyses/{analysis_id}
```

## Project Structure

```
webapp/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routes/           # FastAPI route handlers
│   │   ├── services/         # Business logic (YouTube, ML, FAISS)
│   │   ├── tasks/            # Celery async tasks
│   │   ├── config.py         # Application settings
│   │   ├── database.py       # Database connection
│   │   ├── celery_app.py     # Celery configuration
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   └── main.py           # FastAPI application entry point
│   ├── Dockerfile            # API server image
│   ├── Dockerfile.worker     # Celery worker image
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── App.js            # Main app component
│   ├── public/
│   ├── Dockerfile            # Frontend image
│   ├── nginx.conf            # Nginx config for production
│   └── package.json
├── docker-compose.yml        # Multi-service orchestration
├── .env.example              # Environment template
└── setup.sh                  # Setup & launch script
```

## Database Schema

### `videos` Table
- `id` (UUID), `youtube_id`, `youtube_url`, `title`, `description`
- `channel`, `duration`, `thumbnail_url`, `upload_date`
- `local_path`, `frames_count`, `features_count`
- `status`, `error_message`, `created_at`, `updated_at`

### `analyses` Table
- `id` (UUID), `video_id` (FK), `analysis_type`
- `status`, `progress`, `error_message`
- `results` (JSON), `created_at`, `completed_at`

### `search_results` Table
- `id` (UUID), `analysis_id` (FK), `matched_video_id` (FK)
- `num_matching_frames`, `avg_similarity`, `max_similarity`, `rank`
- `frame_matches` (JSON), `created_at`

## Scaling

### Horizontal Scaling
- **API Workers**: Increase `--workers` in Dockerfile or use multiple replicas
- **Celery Workers**: Scale with `docker-compose up -d --scale worker=4`
- **Database**: PostgreSQL connection pooling (already configured)

### Production Considerations
1. **Database**: Use managed PostgreSQL (AWS RDS, Supabase, etc.)
2. **Redis**: Use managed Redis (AWS ElastiCache, Upstash, etc.)
3. **Storage**: Use S3/GCS for frame/feature file storage
4. **ML Models**: Consider GPU workers for faster encoding
5. **Rate Limiting**: Add middleware for API rate limiting
6. **Authentication**: Add JWT/OAuth for user management
7. **Monitoring**: Add Prometheus + Grafana for metrics
8. **Logging**: Centralized logging (ELK stack, Datadog)

## How It Works

1. **Submit**: User provides a YouTube URL
2. **Download**: yt-dlp downloads the video
3. **Extract**: OpenCV extracts frames at regular intervals
4. **Encode**: ResNet50 converts each frame to a 2048-dim feature vector
5. **Index**: FAISS stores vectors for fast similarity search
6. **Search**: Query videos are encoded and matched against the index
7. **Results**: Videos ranked by number of matching frames + avg similarity

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Bootstrap 5 |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| Task Queue | Celery + Redis |
| ML Models | ResNet50 (PyTorch) |
| Vector Search | FAISS |
| Video Processing | OpenCV + yt-dlp |
| Deployment | Docker + docker-compose |

## Troubleshooting

### Videos stuck in "pending" status
```bash
# Check Celery worker logs
docker-compose logs worker

# Restart workers
docker-compose up -d --force-recreate worker
```

### Database connection errors
```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Restart database
docker-compose restart db
```

### Out of memory
```bash
# Increase Docker memory allocation
# Reduce concurrency in worker Dockerfile: --concurrency=1
```

## License

MIT License
