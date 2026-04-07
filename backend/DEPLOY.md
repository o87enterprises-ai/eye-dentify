# Deploy Eye-Dentify to Hugging Face Spaces — $0 Budget

## Quick Start (5 minutes)

### 1. Create HF Space
1. Go to **https://huggingface.co/new-space**
2. **Space name:** `eye-dentify-api`
3. **SDK:** Docker
4. **Visibility:** Public
5. Click **Create**

### 2. Push Backend Code
```bash
# Navigate to backend directory
cd /Volumes/Duck_Drive/software-dev/o87Dev/builds/video_reverse_search/webapp/backend

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Add your HF space as remote (replace YOUR_USERNAME)
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/eye-dentify-api

# Push (this triggers the Docker build on HF servers)
git push hf main
```

### 3. Wait for Build (~5 min)
- Check your Space at: `https://huggingface.co/spaces/YOUR_USERNAME/eye-dentify-api`
- Wait for status to show **"Running"**

### 4. Connect Frontend
1. Open `http://localhost:3001/app.html`
2. In the **top-right corner**, find the API URL input
3. Paste: `https://huggingface.co/spaces/YOUR_USERNAME/eye-dentify-api`
4. Click **Set**
5. Click **Connect to API →**

### 5. Test!
- Submit a YouTube URL from the Command page
- Watch the real-time progress indicator
- Results appear in Case Archive

## Architecture on HF Spaces

```
Hugging Face Space (16GB RAM)
├── FastAPI Server (port 7860)
├── SQLite Database (persistent)
├── FAISS Index (persistent /data)
├── ResNet50 ML Models
└── yt-dlp + OpenCV
```

## Why This Works
- **$0/month** — HF Spaces free tier includes 16GB RAM
- **No Docker locally** — HF builds the container remotely
- **External drive stays local** — only code is pushed, not data
- **Full ML pipeline** — ResNet50, FAISS, yt-dlp all work

## Troubleshooting

### CORS errors?
Add this to your Space's `README.md`:
```
---
app_port: 7860
---
```
The FastAPI app already has `CORSMiddleware` with `allow_origins=["*"]`.

### Build fails?
Check Space logs → click **"Logs"** tab on your Space page.

### API not responding?
The health endpoint is at: `https://YOUR-SPACE.hf.space/api/v1/health`
