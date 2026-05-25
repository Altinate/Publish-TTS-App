const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for TTS generation
app.post('/api/tts', async (req, res) => {
    const { text, voice, rate, pitch } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    const colabUrl = process.env.COLAB_API_URL;
    
    if (!colabUrl) {
        return res.status(500).json({ error: "COLAB_API_URL is not configured in .env" });
    }

    try {
        const targetEndpoint = `${colabUrl.replace(/\/$/, '')}/generate`;
        
        // Request the audio from Colab
        const response = await axios.post(targetEndpoint, { text, voice, rate, pitch }, {
            responseType: 'stream', // Important to handle the audio binary stream
            timeout: 60000 // 60 seconds timeout for heavy model inference
        });

        // Set the appropriate headers for audio
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

        // Pipe the audio stream directly to the client
        response.data.pipe(res);
        
    } catch (error) {
        console.error("Error connecting to Colab:", error.message);
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: "Request to Colab API timed out." });
        }
        
        // Try to read the error from the stream if possible
        if (error.response && error.response.data) {
             res.status(error.response.status).json({ error: "Error from Colab backend." });
        } else {
             res.status(500).json({ error: "Failed to connect to Colab API. Make sure it is running and the URL is correct." });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Configured Colab API URL: ${process.env.COLAB_API_URL || 'Not set!'}`);
});
