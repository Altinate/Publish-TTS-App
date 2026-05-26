# AI Agent Memory / Context Bank (AGENT.md)

This file contains architectural context and operational constraints intended for any AI Developer or Google Gemini Agent managing this codebase.

## 1. System Architecture
The application is a fully native, locally hosted Text-to-Speech (TTS) synthesizer using Edge-TTS.

**Flow:**
`Frontend UI (Browser)` -> `Local Express Proxy (Port 3010)` -> `Local FastAPI Backend (Port 8000)`

- **Frontend (`frontend/public`)**: HTML/Tailwind/Vanilla JS UI. Minimal logic, strictly presentation and API consumption. Contains an input to dynamically set the Backend URL.
- **Proxy Server (`frontend/server.js`)**: An Express.js layer. It serves the static assets and provides an `/api/tts` endpoint that proxies traffic to the Python backend.
- **Backend (`backend/main.py`)**: A Python FastAPI script running natively on port 8000. 

## 2. Process Management
We use PM2 via `ecosystem.config.js` to manage both Node and Python processes simultaneously.
- **App 1 (`tts-web-app`)**: Node.js Express server.
- **App 2 (`tts-api-backend`)**: Python process running `python3 -m uvicorn main:app`.

The `./scripts/deploy.sh` script automates dependency installation (pip and npm) and PM2 reloads.

## 3. Tech Stack & Architectural Constraints
- **Why an Express Proxy?** Even in a local setup, the proxy acts as a centralized configuration point for the Python URL, avoiding CORS configuration complexities, handling connection timeouts centrally, and allowing seamless configuration swapping.
- **Edge-TTS Validation**: The UI uses a strict `+X%` or `-X%` format for the Edge-TTS rate parameter. Passing exactly `0%` without a sign causes a ValueError in the Python backend, so the UI enforces `>= 0` to result in `+0%`.

## 4. Future Scaling Roadmap
1. **Containerization**: Wrap both the Node app and the Python backend inside a `docker-compose.yml` for unified deployment without PM2.
2. **GPU Acceleration (If Heavy Models Added)**: If substituting Edge-TTS with Coqui TTS or Bark, ensure local CUDA drivers are configured.
