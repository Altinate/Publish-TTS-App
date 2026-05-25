document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const textInput = document.getElementById('text-input');
    const voiceSelect = document.getElementById('voice-select');
    const rateSlider = document.getElementById('rate-slider');
    const rateValueDisplay = document.getElementById('rate-value');
    const historyList = document.getElementById('history-list');
    const emptyState = document.getElementById('empty-state');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    // Connection UI elements
    const colabUrlInput = document.getElementById('colabUrlInput');
    const refreshColabBtn = document.getElementById('refreshColabBtn');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const btnSpinner = document.getElementById('btn-spinner');

    let isGenerating = false;
    let historyCounter = 0;

    // Load saved Colab URL from local storage
    const savedUrl = localStorage.getItem('colabUrl');
    if (savedUrl && colabUrlInput) {
        colabUrlInput.value = savedUrl;
    }

    // Function to ping health endpoint
    async function updateConnectionStatus() {
        if (!statusDot || !statusText) return;
        
        statusDot.className = "w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]";
        statusText.textContent = "Checking connection...";
        statusText.className = "text-xs text-gray-400 font-medium tracking-wide";
        
        const colab_url = colabUrlInput ? colabUrlInput.value.trim() : "";
        if (colab_url) {
            localStorage.setItem('colabUrl', colab_url);
        }

        try {
            const response = await fetch('/api/health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ colab_url })
            });

            if (response.ok) {
                statusDot.className = "w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
                statusText.textContent = "Colab Connected";
                statusText.className = "text-xs text-green-400 font-medium tracking-wide";
            } else {
                throw new Error("Bad response");
            }
        } catch (e) {
            statusDot.className = "w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
            statusText.textContent = "Disconnected";
            statusText.className = "text-xs text-red-400 font-medium tracking-wide";
        }
    }

    // Ping on load
    updateConnectionStatus();

    // Ping on refresh button click
    if (refreshColabBtn) {
        refreshColabBtn.addEventListener('click', updateConnectionStatus);
    }

    // Update slider value display
    if (rateSlider && rateValueDisplay) {
        rateSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            const sign = val > 0 ? '+' : '';
            rateValueDisplay.textContent = `${sign}${val}%`;
        });
    }

    generateBtn.addEventListener('click', async () => {
        if (isGenerating) return;

        const text = textInput.value.trim();
        const voice = voiceSelect.value;
        const rateNum = parseInt(rateSlider.value, 10);
        const rate = `${rateNum >= 0 ? '+' : ''}${rateNum}%`;
        const pitch = "+0Hz";
        const colab_url = colabUrlInput ? colabUrlInput.value.trim() : "";
        
        if (colab_url) {
            localStorage.setItem('colabUrl', colab_url);
        }

        if (!text) {
            showError("Please enter some text to generate audio.");
            textInput.focus();
            return;
        }

        hideError();
        setLoadingState(true);

        try {
            // Call the local Express server proxy
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voice, rate, pitch, colab_url })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${response.status}`);
            }

            // Get the binary audio data as a blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Add to history
            addHistoryItem(text, voice, audioUrl);

            // Clear input on success (optional, but good UX)
            textInput.value = '';

        } catch (error) {
            showError(error.message || "Failed to generate audio. Please check if the Colab backend is running and the URL is correctly set.");
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(loading) {
        isGenerating = loading;
        if (loading) {
            generateBtn.classList.add('opacity-80', 'cursor-not-allowed');
            generateBtn.classList.remove('hover:bg-brand-500');
            btnText.textContent = 'Generating...';
            btnIcon.classList.add('hidden');
            btnSpinner.classList.remove('hidden');
        } else {
            generateBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            generateBtn.classList.add('hover:bg-brand-500');
            btnText.textContent = 'Generate Audio';
            btnIcon.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    }

    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('animate-fade-in');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function addHistoryItem(text, voice, audioUrl) {
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        historyCounter++;
        const truncatedText = text.length > 50 ? text.substring(0, 50) + '...' : text;
        
        const itemHtml = `
            <div class="p-4 bg-slate-800/40 border border-white/5 rounded-xl transition-all hover:bg-slate-800/60 group animate-slide-up">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <span class="text-xs font-semibold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md uppercase tracking-wider">Output #${historyCounter}</span>
                        <span class="text-xs text-slate-500 ml-2">${voice}</span>
                    </div>
                </div>
                <p class="text-sm text-slate-300 mb-4 line-clamp-2 italic">"${truncatedText}"</p>
                <div class="w-full bg-slate-900/50 rounded-lg p-2 border border-black/20">
                    <audio controls class="w-full h-10 custom-audio" src="${audioUrl}"></audio>
                </div>
            </div>
        `;

        // Insert at the top
        historyList.insertAdjacentHTML('afterbegin', itemHtml);
    }
});
