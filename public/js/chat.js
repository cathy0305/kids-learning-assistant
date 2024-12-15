let ws;
let mediaRecorder;
let isRecording = false;
let audioChunks = [];
let currentText = '';
let currentSentence = '';
let synthesis = window.speechSynthesis;
let speaking = false;
let speechQueue = [];
let audioContext;
let conversationHistory = [];

// UI 요소들 캐싱
const chatControls = {
    startBtn: document.querySelector('.start-chat-btn'),
    endBtn: document.querySelector('.end-chat-btn'),
    historyBtn: document.querySelector('.history-btn'),
    closeModalBtn: document.querySelector('.close-modal-btn'),
    modal: document.querySelector('.history-modal'),
    aiWaves: document.querySelector('.ai-waves'),
    aiStatus: document.querySelector('.ai-status'),
    imageDisplay: document.querySelector('.image-display'),
    generatedImage: document.querySelector('.generated-image')
};

// WebSocket 초기화
async function initWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onopen = () => {
        console.log('Connected to server');
        chatControls.startBtn.disabled = false;
        chatControls.aiStatus.textContent = '대화를 시작해보세요';
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case 'audio':
                if (data.data) playAudio(data.data);
                break;
            case 'text':
                if (data.data) updateText(data.data);
                break;
            case 'image':
                if (data.data) updateImage(data.data);
                break;
            case 'error':
                showError(data.data);
                break;
            case 'stt_result':
                if (data.text) addUserMessage(data.text);
                break;
        }
    };
    
    ws.onclose = () => {
        console.log('Disconnected from server');
        chatControls.startBtn.disabled = true;
        chatControls.aiStatus.textContent = '연결이 끊어졌습니다';
        setTimeout(initWebSocket, 3000);
    };
}

// 오디오 초기화
async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, sampleRate: 24000 }
        });

        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 24000,
        });

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

        mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            try {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioData = await audioContext.decodeAudioData(arrayBuffer);
                const pcmData = convertToPCM16(audioData);
                const base64Audio = uint8ArrayToBase64(new Uint8Array(pcmData.buffer));
                
                ws.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
                audioChunks = [];
            } catch (error) {
                console.error('Error processing recorded audio:', error);
                showError('오디오 처리 중 오류가 발생했습니다.');
            }
        };

        chatControls.startBtn.disabled = false;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showError('마이크 접근이 거부되었습니다.');
    }
}

// PCM 데이터 변환
function convertToPCM16(audioBuffer) {
    const inputData = audioBuffer.getChannelData(0);
    const pcmData = new Int16Array(inputData.length);
    
    for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    return pcmData;
}

// Base64 인코딩
function uint8ArrayToBase64(uint8Array) {
    const chunks = [];
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        chunks.push(String.fromCharCode.apply(null, chunk));
    }
    
    return btoa(chunks.join(''));
}

// 녹음 시작/중지
function toggleRecording() {
    if (!isRecording) {
        try {
            audioChunks = [];
            mediaRecorder.start(100);
            isRecording = true;
            chatControls.startBtn.classList.add('hidden');
            chatControls.endBtn.classList.remove('hidden');
            chatControls.aiWaves.classList.add('active');
            chatControls.aiStatus.textContent = '듣고 있어요...';
            currentText = '';
            currentSentence = '';
        } catch (error) {
            console.error('Recording start error:', error);
            showError('녹음을 시작할 수 없습니다.');
        }
    } else {
        try {
            mediaRecorder.stop();
            isRecording = false;
            chatControls.endBtn.classList.add('hidden');
            chatControls.startBtn.classList.remove('hidden');
            chatControls.aiWaves.classList.remove('active');
            chatControls.aiStatus.textContent = '대화를 시작해보세요';
        } catch (error) {
            console.error('Recording stop error:', error);
            showError('녹음을 중지할 수 없습니다.');
        }
    }
}

// 음성 합성
async function speak(text) {
    return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.onend = () => {
            chatControls.aiWaves.classList.remove('active');
            resolve();
        };
        utterance.onerror = (error) => reject(error);
        chatControls.aiWaves.classList.add('active');
        synthesis.speak(utterance);
    });
}

// 이미지 업데이트
function updateImage(imageUrl) {
    chatControls.imageDisplay.classList.remove('hidden');
    chatControls.generatedImage.src = imageUrl;
    chatControls.generatedImage.alt = '생성된 이미지';
}

// 텍스트 업데이트
function updateText(text) {
    currentText += text;
    currentSentence += text;
    chatControls.aiStatus.textContent = '답변하고 있어요...';
    
    if (text.includes('.') || text.includes('?') || text.includes('!')) {
        speak(currentSentence).catch((error) => 
            console.error('Speech synthesis error:', error)
        );
        
        if (currentSentence.trim()) {
            conversationHistory.push({
                type: 'ai',
                content: currentSentence.trim()
            });
            updateHistoryModal();
        }
        
        currentSentence = '';
    }
}

// 사용자 메시지 추가
function addUserMessage(text) {
    if (text.trim()) {
        conversationHistory.push({
            type: 'user',
            content: text.trim()
        });
        updateHistoryModal();
    }
}

// 대화 기록 모달 업데이트
function updateHistoryModal() {
    const chatHistory = document.querySelector('.chat-history');
    chatHistory.innerHTML = '';
    
    conversationHistory.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.type}-message`;
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = message.type === 'user' ? '나' : 'AI';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        messageDiv.appendChild(label);
        messageDiv.appendChild(content);
        chatHistory.appendChild(messageDiv);
    });
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// 에러 표시
function showError(message) {
    chatControls.aiStatus.textContent = message;
    setTimeout(() => {
        chatControls.aiStatus.textContent = '대화를 시작해보세요';
    }, 5000);
}

// 이벤트 리스너 설정
function setupEventListeners() {
    chatControls.startBtn.onclick = () => toggleRecording();
    chatControls.endBtn.onclick = () => toggleRecording();
    
    chatControls.historyBtn.onclick = () => {
        chatControls.modal.classList.remove('hidden');
        updateHistoryModal();
    };
    
    chatControls.closeModalBtn.onclick = () => {
        chatControls.modal.classList.add('hidden');
    };
    
    chatControls.modal.onclick = (e) => {
        if (e.target === chatControls.modal) {
            chatControls.modal.classList.add('hidden');
        }
    };
}

// 페이지 로드 시 초기화
window.onload = async () => {
    const selectedAge = localStorage.getItem('selectedAge');
    if (!selectedAge) {
        window.location.href = '/';
        return;
    }

    await initWebSocket();
    await initAudio();
    setupEventListeners();
};