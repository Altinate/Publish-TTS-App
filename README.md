# Text-to-Speech (TTS) Web Application

A clean, modern Text-to-Speech web application that offloads heavy model inference (like Coqui TTS or Bark) to a Google Colab notebook.

## Architecture
1. **Frontend & Local Proxy**: A Node.js (Express) server that serves a beautiful, responsive UI (HTML/Tailwind/Vanilla JS) and acts as a proxy to avoid CORS issues when communicating with Colab.
2. **Backend (Google Colab)**: A FastAPI Python script exposed securely via `pyngrok`. It receives text and returns the generated audio file.

---

## 🚀 Setup Instructions

### Part 1: Start the Backend (Google Colab)
1. Open Google Colab and create a new notebook.
2. Ensure you are using a GPU runtime (`Runtime > Change runtime type > Hardware accelerator: GPU`).
3. Copy the contents of `colab_backend.py` into a single notebook cell.
4. If you don't have an ngrok account, sign up at [ngrok.com](https://ngrok.com/) to get your authtoken.
5. In the notebook, paste your authtoken in the `NGROK_AUTHTOKEN` variable or set it via Colab's secret manager.
6. Run the cell. 
7. Once the cell is running, it will output a **Public API URL** (e.g., `https://1234-abcd.ngrok-free.app`). **Copy this URL**.

### Part 2: Start the Frontend (Local Web Server)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Go back to the project root and create a `.env` file by copying the example:
   ```bash
   cd ..
   cp .env.example .env
   ```
4. Open the `.env` file at the root level and replace the `COLAB_API_URL` value with the URL you copied from Colab.
5. Start the application (we recommend using the PM2 deployment script):
   ```bash
   ./scripts/deploy.sh
   ```
6. Open your browser and go to `http://localhost:3010`.

---

## Customizing Models in Colab
By default, `colab_backend.py` uses `gTTS` (Google Text-to-Speech) as a fast, lightweight placeholder for testing the connection. 

To use heavy models like **Coqui TTS**:
1. Check the comments in `colab_backend.py`.
2. Install TTS in Colab: `!pip install TTS`
3. Replace the `gTTS` generation logic with the Coqui TTS inference code provided in the comments.
