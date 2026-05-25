# AI Agent Memory / Context Bank (AGENT.md)

This file contains architectural context and operational constraints intended for any AI Developer or Google Gemini Agent managing this codebase.

## 1. System Architecture
The application is a Text-to-Speech (TTS) synthesizer that offloads heavy inference away from the web server.

**Flow:**
`Frontend UI (Browser)` -> `Local Express Proxy (Port 3010)` -> `Ngrok Tunnel` -> `Google Colab Backend (FastAPI)`

- **Frontend (`frontend/public`)**: HTML/Tailwind/Vanilla JS UI. Minimal logic, strictly presentation and API consumption.
- **Proxy Server (`frontend/server.js`)**: An Express.js layer. It serves the static assets and provides an `/api/tts` endpoint.
- **Colab Backend (`colab_backend.py`)**: A Python script run manually inside a Google Colab GPU instance. Exposed publicly via `pyngrok`.

## 2. State & Data Flow
- **Request Payload**: The user inputs text and selects a voice in the browser. This is sent as JSON `{"text": "...", "voice": "..."}` to `/api/tts`.
- **Proxy Behavior**: The Express proxy forwards the JSON to the configured `COLAB_API_URL`.
- **Response Payload**: The FastAPI backend generates an `.mp3` file and responds with a binary file stream (`FileResponse`).
- **Stream Handling**: The Express proxy uses `axios` with `responseType: 'stream'` to pipe the binary audio directly back to the client. This avoids buffering large audio files in the proxy's memory.
- **Browser Playback**: The frontend converts the binary blob to a `URL.createObjectURL(blob)` and assigns it to an `<audio>` HTML element.

## 3. Tech Stack & Architectural Constraints
- **Why an Express Proxy?** We use a local proxy (Port 3010) because directly calling the Ngrok URL from the browser triggers CORS (Cross-Origin Resource Sharing) policies and requires pre-flight handling. The proxy bypasses this and acts as a central configuration point for the ngrok URL.
- **Colab Volatility**: Google Colab sessions can timeout, drop connections, or change URLs upon restart. The Express server is configured with a 60-second connection timeout, and PM2 is configured (`ecosystem.config.js`) with `max_restarts` and `restart_delay` to prevent PM2 from crash-looping if the proxy hits a fatal connection drop. The `.env` file allows rapid URL swapping without code changes.

## 4. Future Scaling Roadmap
While Colab is excellent for hobbyist experimentation, it is not viable for production scaling due to ephemeral runtimes.

**To transition to production:**
1. **Shift compute from Colab to a Dedicated GPU Instance**: Look into RunPod, AWS EC2 (G4dn instances), or CoreWeave.
2. **Containerization**: Wrap `colab_backend.py` inside a Docker container using a base image like `nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04`.
3. **Remove Ngrok**: The dedicated GPU instance should expose the FastAPI app behind a proper reverse proxy (like Nginx) or a load balancer with an SSL certificate.
4. **Asynchronous Task Queue (Celery/Redis)**: Instead of holding the HTTP connection open during generation (which can timeout if generating long passages), use a job ID system. The proxy submits a job and polls for completion or listens to webhooks.
