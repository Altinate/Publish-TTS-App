import os
import tempfile
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import nest_asyncio
import edge_tts

# To run this in Colab, you need to install the following packages:
# !pip install fastapi uvicorn pyngrok edge-tts nest-asyncio

# --- INSTRUCTIONS FOR HEAVY MODELS (e.g., Coqui TTS, Bark) ---
# To use a heavy model like Coqui TTS, install it in your Colab notebook:
# !pip install TTS
# Then replace the edge-tts code below with Coqui TTS inference:
# from TTS.api import TTS
# tts_model = TTS(model_name="tts_models/en/vctk/vits", progress_bar=False).to("cuda")
# tts_model.tts_to_file(text=request.text, file_path=temp_file_path, speaker=request.voice)

app = FastAPI(title="Colab TTS API")

class TTSRequest(BaseModel):
    text: str
    voice: str = "th-TH-NiwatNeural"
    rate: str = "+0%"
    pitch: str = "+0Hz"

@app.post("/generate")
async def generate_audio(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        # Create a temporary file to save the generated audio
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

        return FileResponse(temp_file_path, media_type="audio/mpeg", filename="output.mp3")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "message": "TTS API is running."}


# --- NGROK SETUP ---
# You need an ngrok authtoken to expose the port.
# Sign up at https://ngrok.com/, get your authtoken, and set it here:
# NGROK_AUTHTOKEN = "YOUR_NGROK_AUTHTOKEN"
# !ngrok config add-authtoken $NGROK_AUTHTOKEN

if __name__ == "__main__":
    from pyngrok import ngrok
    try:
        from google.colab import userdata
        authtoken = userdata.get("NGROK_AUTHTOKEN")
    except ImportError:
        authtoken = os.environ.get("NGROK_AUTHTOKEN")
    except Exception:
        authtoken = None

    if authtoken:
        ngrok.set_auth_token(authtoken)
    else:
        print("⚠️ Warning: No NGROK_AUTHTOKEN found in Colab secrets. ngrok might fail or have session limits.")

    # Expose the FastAPI port via ngrok
    public_url = ngrok.connect(8000).public_url
    print(f"\n{'='*50}\n")
    print(f"✅ Public API URL: {public_url}")
    print("Copy this URL and set it as COLAB_API_URL in your frontend .env file.")
    print(f"\n{'='*50}\n")

    # nest_asyncio allows uvicorn to run in Colab's Jupyter event loop
    nest_asyncio.apply()
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8000)
