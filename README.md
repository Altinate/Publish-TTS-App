# Local AI Voice Studio

A clean, modern Text-to-Speech web application running fully natively on your local machine using Edge-TTS, Express, and FastAPI.

## Architecture
1. **Frontend & Local Proxy**: A Node.js (Express) server on Port 3010 that serves the UI (HTML/Tailwind/Vanilla JS) and proxies requests to the Python backend to avoid CORS issues.
2. **FastAPI Backend**: A Python backend running natively on Port 8000 using Uvicorn. It processes the TTS requests using the high-quality `edge-tts` engine.

---

## 🚀 Setup Instructions

### 1. Requirements
Ensure you have the following installed on your machine:
- Node.js (v16+)
- Python 3.8+
- npm and pip

### 2. Configure Environment
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. The `BACKEND_API_URL` is set to `http://127.0.0.1:8000` by default, pointing to your local Python backend.

### 3. Quick Start (via Deployment Script)
The easiest way to start the entire stack is by using the provided deployment script. This installs both Node and Python dependencies and manages both processes via PM2.

1. Ensure PM2 is installed globally:
   ```bash
   npm install -g pm2
   ```
2. Run the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```
3. Open your browser and go to `http://localhost:3010`. Both the Express server and the Python API will run silently in the background!

### Manual Start (Without PM2)
If you prefer not to use PM2, you can start the servers manually in two separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
pip install -r requirements.txt --break-system-packages
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
cd ..
node frontend/server.js
```
