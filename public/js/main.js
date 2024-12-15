let ws;
let mediaRecorder;
let isRecording = false;
let audioChunks = [];
let currentText = '';
let synthesis = window.speechSynthesis;
let speaking = false;
let speechQueue = [];
let audioContext;

// WebSocket 초기화
async function initWebSocket() {
  ws = new WebSocket(`ws://${window.location.host}`);
  
  ws.onopen = () => {
    console.log('Connected to server');
    document.getElementById('status').textContent = 'Connected';
    document.getElementById('recordButton').disabled = false;
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
    }
  };
  
  ws.onclose = () => {
    console.log('Disconnected from server');
    document.getElementById('status').textContent = 'Disconnected';
    document.getElementById('recordButton').disabled = true;
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
        showError('Audio processing error occurred.');
      }
    };

    document.getElementById('recordButton').disabled = false;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    showError('Microphone access denied.');
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
  const recordButton = document.getElementById('recordButton');

  if (!isRecording) {
    try {
      audioChunks = [];
      mediaRecorder.start(100);
      isRecording = true;
      recordButton.textContent = 'Stop Recording';
      recordButton.classList.add('recording');
      currentText = '';
      document.getElementById('responseText').innerHTML = '';
      document.getElementById('imageContainer').innerHTML = '';
    } catch (error) {
      console.error('Recording start error:', error);
      showError('Could not start recording.');
    }
  } else {
    try {
      mediaRecorder.stop();
      isRecording = false;
      recordButton.textContent = 'Start Recording';
      recordButton.classList.remove('recording');
    } catch (error) {
      console.error('Recording stop error:', error);
      showError('Could not stop recording.');
    }
  }
}

// 음성 합성
function speak(text) {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    synthesis.speak(utterance);
  });
}

// 이미지 업데이트
function updateImage(imageUrl) {
  const imageContainer = document.getElementById('imageContainer');
  imageContainer.innerHTML = '';
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = 'Generated Image';
  img.className = 'generated-image';
  
  imageContainer.appendChild(img);
}

// 텍스트 업데이트
function updateText(text) {
  const responseText = document.getElementById('responseText');
  currentText += text;

  const message = document.createElement('div');
  message.className = 'message assistant-message';
  message.textContent = currentText;

  responseText.innerHTML = '';
  responseText.appendChild(message);
  responseText.scrollTop = responseText.scrollHeight;

  if (text.includes('.') || text.includes('?') || text.includes('!')) {
    speak(text).catch((error) => console.error('Speech synthesis error:', error));
  }
}

// 에러 표시
function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  error.style.display = 'block';
  setTimeout(() => { error.style.display = 'none'; }, 5000);
}

// 페이지 로드 시 초기화
// 페이지 로드 시 연령 확인
window.onload = async () => {
  const selectedAge = localStorage.getItem('selectedAge');
  if (!selectedAge) {
    // 연령이 선택되지 않았으면 landing 페이지로 리다이렉트
    window.location.href = '/';
    return;
  }

  await initWebSocket();
  await initAudio();
  document.getElementById('recordButton').onclick = toggleRecording;
};