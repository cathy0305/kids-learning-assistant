let ws;
let mediaRecorder;
let isRecording = false;
let audioChunks = [];
let currentText = '';
let synthesis = window.speechSynthesis;
let speaking = false;
let speechQueue = [];
let audioContext;
let conversationHistory = [];

// UI 요소들 캐싱
const chatControls = {
    startBtn: document.querySelector('.start-chat-btn'),
    endBtn: document.querySelector('.end-chat-btn'),
    aiWaves: document.querySelector('.ai-waves'),
    aiStatus: document.querySelector('.ai-status'),
    imageDisplay: document.querySelector('.image-display'),
    generatedImage: document.querySelector('.generated-image'),
    messagesContainer: document.querySelector('.messages-container')
};

// WebSocket 초기화
async function initWebSocket() {
    ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);
    
    ws.onopen = () => {
        console.log('Connected to server');
        // 선택된 나이, 책, 언어 정보 전송
        ws.send(JSON.stringify({
            type: 'init',
            ageGroup: localStorage.getItem('selectedAge'),
            bookId: localStorage.getItem('selectedBook'),
            language: localStorage.getItem('selectedLanguage') || 'ko'
        }));
        chatControls.startBtn.disabled = false;
        chatControls.aiStatus.textContent = '대화를 시작해보세요';
    };

    ws.onmessage = async (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('수신된 메시지:', data); // 전체 데이터 로깅

            switch (data.type) {
                case 'stt_result':
                    if (data.data) {
                        const userMessage = data.data.trim();
                        console.log('STT 결과 수신:', userMessage);
                        
                        // 즉시 대화 기록에 추가
                        conversationHistory = [
                            ...conversationHistory,
                            {
                                type: 'user',
                                content: userMessage
                            }
                        ];
                        
                        // 즉시 화면 업데이트
                        renderAllMessages();
                    }
                    break;

                case 'text':
                    if (data.data && data.isComplete) {
                        const aiMessage = data.data.trim();
                        console.log('AI 응답 완료:', aiMessage);
                        
                        // AI 응답을 대화 기록에 추가
                        conversationHistory = [
                            ...conversationHistory,
                            {
                                type: 'ai',
                                content: aiMessage
                            }
                        ];
                        
                        // 화면 업데이트
                        renderAllMessages();
                        
                        // 음성 합성 시도
                        try {
                            await speak(aiMessage);
                        } catch (error) {
                            console.error('음성 합성 실패:', error);
                        }
                    }
                    break;

                case 'image':
                    if (data.data) {
                        console.log('이미지 URL 수신:', data.data);
                        updateImage(data.data);
                    }
                    break;

                case 'error':
                    showError(data.data);
                    break;
            }
        } catch (error) {
            console.error('메시지 처리 에러:', error);
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
            console.log('Recording started');
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
            chatControls.aiStatus.textContent = '처리중...';
            console.log('Recording stopped');
        } catch (error) {
            console.error('Recording stop error:', error);
            showError('녹음을 중지할 수 없습니다.');
        }
    }
}

// 음성 합성 초기화
function initSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('Available voices:', voices);
        };
    }
}

// 음성 합성
async function speak(text) {
    if (!text) return;

    try {
        console.log('TTS 요청 시작:', text); // 디버깅용 로그 추가
        
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                language: localStorage.getItem('selectedLanguage') || 'ko'
            })
        });

        if (!response.ok) {
            throw new Error(`TTS 요청 실패: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onerror = (error) => {
            console.error('오디오 재생 에러:', error);
            URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        
        return new Promise((resolve) => {
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
        });
    } catch (error) {
        console.error('TTS 처리 중 에러 발생:', error);
        chatControls.aiStatus.textContent = 'TTS 처리 중 오류가 발생했습니다.';
        throw error;
    }
}

// 이미지 업데이트
function updateImage(imageUrl) {
    console.log('이미지 업데이트 시도:', imageUrl);
    
    if (!chatControls.imageDisplay || !chatControls.generatedImage) {
        console.error('이미지 표시 요소를 찾을 수 없습니다');
        return;
    }
    
    chatControls.imageDisplay.classList.remove('hidden');
    chatControls.generatedImage.src = imageUrl;
    chatControls.generatedImage.alt = '생성된 이미지';
    
    // 이미지 로드 확인
    chatControls.generatedImage.onload = () => {
        console.log('이미지 로드 완료');
    };
    
    chatControls.generatedImage.onerror = () => {
        console.error('이미지 로드 실패');
    };
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
}

// 페이지 로드 시 초기화
window.onload = async () => {
    const selectedAge = localStorage.getItem('selectedAge');
    if (!selectedAge) {
        window.location.href = '/';
        return;
    }

    // 메시지 컨테이너 존재 확인
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        console.error('메시지 컨테이너를 찾을 수 없습니다. HTML 구조를 확인해주세요.');
    }

    initSpeech();
    await initWebSocket();
    await initAudio();
    setupEventListeners();
};

function renderAllMessages() {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        console.error('메시지 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    console.log('대화 기록 렌더링:', conversationHistory);
    
    // 컨테이너 초기화
    messagesContainer.innerHTML = '';
    
    // 모든 메시지 렌더링
    conversationHistory.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.type}-message`;
        messageDiv.textContent = message.content;
        messagesContainer.appendChild(messageDiv);
    });
    
    // 스크롤을 최신 메시지로
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
