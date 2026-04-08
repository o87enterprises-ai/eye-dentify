# Eye-Dentify v1.0.0 — Release Notes

> **Integrity. Insight. Identification.**

We're excited to announce the **v1.0.0** release of Eye-Dentify, the AI-powered digital forensics platform for reverse video search, deepfake detection, and metadata extraction.

---

## 🚀 What's New

### 📱 Mobile-First Responsive Design
- **Fluid typography** with CSS `clamp()` for perfect scaling across all devices
- **48px minimum touch targets** for all interactive elements (WCAG compliant)
- **Hamburger navigation** for mobile viewports
- **Zero horizontal scroll** on any screen size
- Tested on Chrome DevTools Device Mode (iPhone SE, Pixel 7, iPad)

### 🔐 Email Authentication System
- **User registration** with email verification via Resend or SMTP
- **JWT-based session management** with secure cookie storage
- **Protected API routes** — all forensic operations require authentication
- **Rate-limited auth endpoints** (5 req/min register, 10 req/min login)
- **Security headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options

### 💰 Ad-Supported Free Tier
- **1 free analysis per day** for all users
- **Rewarded video ad** integration — watch a 30-second ad to unlock additional analyses
- **Banner ad slots** on search results and sidebar (non-intrusive)
- **Ad Provider abstraction layer** — easily swap between Google AdSense, Media.net, or custom providers
- **Mock ad provider** for development and testing

### ✨ Modern SaaS Landing Page
- **Hero section** with 3D animated logo background
- **3 Pillars** showcasing core capabilities (Reverse Search, AI Detection, Metadata Extraction)
- **Premium features** preview with comparison table
- **Call-to-action** sections optimized for conversion
- **Glassomorphism UI** with animated border glow interactions on hover

### 🎨 3D Logo Background Animation
- **Custom 3D geometry** with the actual Eye-Dentify emblem at the center
- **Multiple orbiting rings** with gold and cyan wireframe effects
- **Floating data particles** orbiting the central logo
- **Bloom post-processing** for cinematic glow effects
- **Billboard-style rendering** — logo always faces the camera

### 📖 How-To-Use Guide
- Step-by-step walkthrough of the forensic analysis workflow
- Glassomorphism cards with icon indicators for each step
- Pro tips section for power users
- Only accessible after authentication

### 🛡️ Security Hardening
- **Input sanitization** with Bleach library
- **Email validation** with disposable domain detection
- **YouTube URL validation** with regex pattern matching
- **Password requirements**: 8+ chars, letters + numbers
- **Rate limiting** on all auth endpoints via SlowAPI
- **CORS hardening** — no more wildcard origins in production

---

## 🏗️ Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Framer Motion |
| **3D Engine** | Three.js, React Three Fiber, React Three Drei |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), PostgreSQL 16 |
| **Auth** | bcrypt, python-jose (JWT), Resend/SMTP |
| **ML/AI** | ResNet50, FAISS, OpenCV, PyTorch |
| **Task Queue** | Celery + Redis |
| **Deployment** | Docker Compose, Render, Hugging Face Spaces |

---

## 📦 Getting Started

### Quick Start (Docker)
```bash
git clone https://github.com/your-org/eyedentify.git
cd eyedentify/webapp
cp .env.example .env
docker compose up -d
```

### Frontend Dev
```bash
cd frontend
npm install
npm run dev
```

### Backend Dev
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🔧 Configuration

Key environment variables to set in production:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `EMAIL_PROVIDER` | `mock` \| `resend` \| `smtp` |
| `RESEND_API_KEY` | API key for Resend email service |
| `SMTP_*` | SMTP credentials for email sending |
| `FRONTEND_URL` | Your deployed frontend URL (for CORS) |
| `FREE_TIER_DAILY_LIMIT` | Number of free analyses per day |

---

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `GET` | `/api/v1/auth/verify-email?token=xxx` | Verify email |
| `POST` | `/api/v1/auth/login` | Login and get JWT |
| `GET` | `/api/v1/auth/me` | Get current user |

### Forensic Operations (Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/videos/submit` | Submit YouTube video |
| `POST` | `/api/v1/search/` | Reverse search by video |
| `POST` | `/api/v1/analyses/{id}` | Create analysis |
| `POST` | `/api/v1/analyses/{id}/unlock` | Unlock via rewarded ad |

---

## 🐛 Known Limitations

- Free tier limited to 1 analysis per day (watch ad for more)
- Premium subscriptions coming in a future release
- Google AdSense integration requires Publisher ID configuration

---

## 🙏 Acknowledgments

- **ResNet50** for visual feature extraction
- **FAISS** for efficient vector similarity search
- **yt-dlp** for YouTube video processing
- **OpenCV** for frame extraction and preprocessing

---

## 📝 License

© 2026 087 Software Development. All rights reserved.

---

*Eye-Dentify — Integrity. Insight. Identification.*
