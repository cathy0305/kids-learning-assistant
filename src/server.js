import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { OpenAI } from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getCurriculumData } from '../server/data/curriculum.js';
import { generateFullPrompt } from '../server/utils/prompts.js';
import { imageGenerationSystemInstance } from '../server/utils/ImageGeneration.js';
import harryPotterDB from '../knowledge/harrypotterDB.js';

// harryPotterPersona 구조 분해 할당
const { harryPotterPersona } = harryPotterDB;

// Path 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express 앱 생성 및 서버 설정
const app = express();
const server = createServer(app);

// WebSocket 서버 설정 수정
const wss = new WebSocketServer({ 
    server  // server 옵션만 사용하고 port 옵션 제거
});

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not defined in .env file');
    process.exit(1);
}

// 교육과정 데이터 캐시
let curriculumCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

// 교육과정 데이터 초기화
async function initializeCurriculum() {
    try {
        curriculumCache = await getCurriculumData();
        lastFetchTime = Date.now();
        console.log('Curriculum data initialized successfully');
    } catch (error) {
        console.error('Failed to initialize curriculum data:', error);
        setTimeout(initializeCurriculum, 5000);
    }
}

// 서버 시작 시 교육과정 데이터 로드
initializeCurriculum();

// 정적 파일 제공 설정
app.use(express.static(join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        }
    }
}));
app.use(express.json());

// TTS 엔드포인트 수정
app.post('/api/tts', async (req, res) => {
    try {
        const { text, language } = req.body;
        
        // OpenAI TTS API 호출
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            speed: 1.2
        ,
            input: text,
        });

        // 오디오 스���림을 버퍼로 변환
        const buffer = Buffer.from(await mp3.arrayBuffer());
        
        // 응답 헤더 설정
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length
        });

        // 오디오 데이터 전송
        res.send(buffer);
        
    } catch (error) {
        console.error('TTS 에러:', error);
        res.status(500).json({ error: 'TTS 처리 중 오류가 발생했습니다.' });
    }
});

// 기본 라우트
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/landing.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(join(__dirname, '../public/chat.html'));
});

// API 엔드포인트 추가
app.get('/api/curriculum', async (req, res) => {
    try {
        if (!curriculumCache || Date.now() - lastFetchTime > CACHE_DURATION) {
            await initializeCurriculum();
        }
        res.json(curriculumCache);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch curriculum data' });
    }
});

// WebSocket 설정
let currentResponse = '';
let imageGenerated = false;

wss.on('connection', (ws) => {
    console.log('Client connected');
    let selectedAge = "3-5"; // 기본값
    let selectedLanguage = "ko"; // 기본값
    let selectedBook = null;
    let realtimeWs = null;

    const connectToRealtimeAPI = () => {
        realtimeWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'realtime=v1',
            },
        });

        realtimeWs.on('open', () => {
            console.log('Connected to OpenAI Realtime API');
            const basePrompt = generateFullPrompt(selectedAge, curriculumCache?.[selectedAge] || {});
            
            let finalPrompt = basePrompt;
            if (selectedBook === 'harry-potter') {
                const persona = harryPotterPersona.Harry[selectedLanguage][selectedAge];
                finalPrompt = `${basePrompt}\n\n${persona.tone}\n${persona.contextRules}`;
            }

            const languageInstruction = selectedLanguage === 'ko' 
                ? "Communicate in Korean language only. Maintain the same educational level and style as specified, but translate all responses into natural, child-friendly Korean."
                : "Communicate in English language only. Maintain the same educational level and style as specified, using natural, child-friendly English.";
            
            finalPrompt = `${finalPrompt}\n\n${languageInstruction}`;

            realtimeWs.send(JSON.stringify({
                type: 'session.update',
                session: {
                    voice: 'alloy',
                    instructions: finalPrompt,
                    turn_detection: {
                        type: 'server_vad',
                    },
                },
            }));
        });

        realtimeWs.on('message', async (data) => {
            try {
                const event = JSON.parse(data.toString());
                console.log('Received event:', event.type);

                switch (event.type) {
                    case 'session.created':
                        console.log('Session created successfully');
                        currentResponse = '';
                        imageGenerated = false;
                        break;

                    case 'response.output_text.delta':
                    case 'response.audio_transcript.delta':
                        if (event.delta) {
                            currentResponse += event.delta;

                            ws.send(JSON.stringify({
                                type: 'text',
                                data: event.delta,
                                isComplete: false
                            }));

                            if (event.delta.includes('.') || event.delta.includes('?') || event.delta.includes('!')) {
                                const sentence = event.delta.trim();
                                if (sentence.length > 0) {
                                    ws.send(JSON.stringify({
                                        type: 'tts_trigger',
                                        data: sentence
                                    }));
                                }
                            }
                        }
                        break;

                    case 'response.audio.delta':
                        if (event.audio) {
                            ws.send(JSON.stringify({
                                type: 'audio',
                                data: event.audio
                            }));
                        }
                        break;

                    case 'conversation.item.message.created':
                        if (event.message?.content?.text) {
                            console.log('STT Result:', event.message.content.text);
                            ws.send(JSON.stringify({
                                type: 'stt_result',
                                data: event.message.content.text
                            }));
                        }
                        break;

                    case 'response.done':
                        ws.send(JSON.stringify({
                            type: 'text',
                            data: currentResponse,
                            isComplete: true
                        }));

                        console.log('Response completed. Current response length:', currentResponse.length);
                        console.log('Image generated status:', imageGenerated);
                        console.log('Checking if image is needed:', imageGenerationSystemInstance.needsImage(currentResponse));

                        if (!imageGenerated && currentResponse.length > 0) {
                            try {
                                if (imageGenerationSystemInstance.needsImage(currentResponse)) {
                                    console.log('Generating image for response:', currentResponse);
                                    
                                    const imagePrompt = await imageGenerationSystemInstance.generatePrompt(
                                        currentResponse,
                                        selectedAge
                                    );
                                    
                                    console.log('Generated image prompt:', imagePrompt);
                                    
                                    if (typeof imagePrompt !== 'string' || !imagePrompt.trim()) {
                                        throw new Error('Invalid prompt generated');
                                    }
                                    
                                    const image = await openai.images.generate({
                                        model: 'dall-e-3',
                                        prompt: imagePrompt,
                                        size: '1024x1024',
                                        n: 1,
                                    });

                                    if (image.data && image.data[0].url) {
                                        console.log('Image generated successfully:', image.data[0].url);
                                        ws.send(JSON.stringify({
                                            type: 'image',
                                            data: image.data[0].url,
                                        }));
                                        imageGenerated = true;
                                    }

                                    if (imageGenerationSystemInstance.requiresSecondImage(currentResponse)) {
                                        const secondImagePrompt = imageGenerationSystemInstance.generatePrompt(
                                            currentResponse,
                                            selectedAge,
                                            true
                                        );
                                        
                                        const secondImage = await openai.images.generate({
                                            model: 'dall-e-3',
                                            prompt: secondImagePrompt,
                                            size: '1024x1024',
                                            n: 1,
                                        });

                                        if (secondImage.data && secondImage.data[0].url) {
                                            ws.send(JSON.stringify({
                                                type: 'second_image',
                                                data: secondImage.data[0].url,
                                            }));
                                        }
                                    }
                                } else {
                                    console.log('Image generation not needed for this response');
                                }
                            } catch (error) {
                                console.error('Image generation error:', error);
                            }
                        }
                        break;

                    case 'error':
                        console.error('OpenAI Realtime API error:', event.error);
                        ws.send(JSON.stringify({
                            type: 'error',
                            data: event.error.message,
                        }));
                        break;
                }
            } catch (error) {
                console.error('Error processing OpenAI message:', error);
            }
        });

        realtimeWs.on('error', (error) => {
            console.error('WebSocket error:', error);
            setTimeout(connectToRealtimeAPI, 5000);
        });
    };

    connectToRealtimeAPI();

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'init') {
                selectedAge = data.ageGroup;
                selectedBook = data.bookId;
                selectedLanguage = data.language;
                if (!curriculumCache || Date.now() - lastFetchTime > CACHE_DURATION) {
                    await initializeCurriculum();
                }
            }
            else if (data.type === 'audio' && realtimeWs?.readyState === WebSocket.OPEN) {
                currentResponse = '';
                imageGenerated = false;

                realtimeWs.send(JSON.stringify({
                    type: 'conversation.item.create',
                    item: {
                        type: 'message',
                        role: 'user',
                        content: [{
                            type: 'input_audio',
                            audio: data.audio,
                        }],
                    },
                }));

                realtimeWs.send(JSON.stringify({
                    type: 'response.create',
                    response: {
                        modalities: ['text', 'audio'],
                    },
                }));
            }
        } catch (error) {
            console.error('Error handling client message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (realtimeWs) {
            realtimeWs.close();
        }
    });
});

const PORT = process.env.PORT || 3000;

// 서버 리스닝 추가
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;