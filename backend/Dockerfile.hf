FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev ffmpeg git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Add SQLite support for HF Spaces
RUN pip install --no-cache-dir aiosqlite

# Copy all app code
COPY app ./app

# Create data directories
RUN mkdir -p /data/frames /data/features /data/index /data/videos

# Expose port (HF Spaces uses 7860)
EXPOSE 7860

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
