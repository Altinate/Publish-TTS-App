import os
import tempfile
import asyncio
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts

app = FastAPI(title="Local Edge-TTS Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    voice: str = "th-TH-NiwatNeural"
    rate: str = "+0%"
    pitch: str = "+0Hz"

def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error removing temporary file {path}: {e}")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Local TTS Backend is running natively."}

@app.get("/api/voices")
async def get_voices():
    try:
        voices = await edge_tts.list_voices()
        return voices
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate")
async def generate_speech(request: TTSRequest, background_tasks: BackgroundTasks):
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        temp_file_path = temp_file.name
        temp_file.close()

        # Generate audio using edge-tts (async API)
        communicate = edge_tts.Communicate(
            request.text, 
            request.voice, 
            rate=request.rate, 
            pitch=request.pitch
        )
        await communicate.save(temp_file_path)

        # Cleanup file after response is sent
        background_tasks.add_task(remove_file, temp_file_path)

        return FileResponse(
            temp_file_path, 
            media_type="audio/mpeg", 
            filename="output.mp3"
        )
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Run the server locally on port 3011
    uvicorn.run("main:app", host="127.0.0.1", port=3011, reload=False)
