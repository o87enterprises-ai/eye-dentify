#!/bin/bash
# Deploy Eye-Dentify Backend to Hugging Face Spaces
# $0 budget - Free 16GB RAM GPU-free tier

set -e

SPACE_NAME="eye-dentify-api"
BACKEND_DIR="/Volumes/Duck_Drive/software-dev/o87Dev/builds/video_reverse_search/webapp/backend"

echo "=== Eye-Dentify HF Spaces Deploy ==="
echo ""
echo "Step 1: Create a Hugging Face Space"
echo "  → Go to: https://huggingface.co/new-space"
echo "  → Space name: $SPACE_NAME"
echo "  → SDK: Docker"
echo "  → Visibility: Public (required for free tier)"
echo "  → Click 'Create'"
echo ""
read -p "Press Enter once the Space is created..."

echo ""
echo "Step 2: Initialize git repo in backend folder"
cd "$BACKEND_DIR"

if [ -d ".git" ]; then
    echo "  Git repo exists"
else
    git init
    git add .
    git commit -m "Initial Eye-Dentify backend"
fi

echo ""
echo "Step 3: Add Hugging Face as remote"
echo "  → Your space URL: https://huggingface.co/spaces/YOUR_USERNAME/$SPACE_NAME"
read -p "Enter your HF username: " HF_USER

REMOTE_URL="https://huggingface.co/spaces/$HF_USER/$SPACE_NAME"
git remote remove hf 2>/dev/null || true
git remote add hf "$REMOTE_URL"

echo ""
echo "Step 4: Push to Hugging Face"
echo "  → This will build the Docker container on HF servers (takes ~5 min)"
git push hf main --force

echo ""
echo "=== Deploy initiated! ==="
echo "Your API will be available at: https://$HF_USER-$SPACE_NAME.hf.space"
echo ""
echo "Once deployed, update the frontend:"
echo "  1. Open frontend/public/app.html"
echo "  2. Find 'const API_BASE' in the script"
echo "  3. Replace with: https://$HF_USER-$SPACE_NAME.hf.space/api/v1"
echo ""
echo "NOTE: Hugging Face Spaces uses PostgreSQL via environment variable."
echo "The app will auto-create tables on first run."
