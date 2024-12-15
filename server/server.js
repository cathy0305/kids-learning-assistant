import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { OpenAI } from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getCurriculumData } from './data/curriculum.js';
import { generateFullPrompt } from './utils/prompts.js';

// Path 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express 앱 생성 및 서버 설정
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

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
 }
}

// 서버 시작 시 교육과정 데이터 로드
initializeCurriculum();

// 정적 파일 제공 설정
app.use(express.static(join(__dirname, '../public')));
app.use(express.json());

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
   // 캐시 만료 체크
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
     const prompt = generateFullPrompt(selectedAge, curriculumCache);

     realtimeWs.send(JSON.stringify({
       type: 'session.update',
       session: {
         voice: 'alloy',
         instructions: prompt,
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

         case 'response.output_audio':
         case 'response.audio.delta':
           if (event.audio) {
             ws.send(JSON.stringify({
               type: 'audio',
               data: event.audio,
             }));
           }
           break;

         case 'response.output_text.delta':
         case 'response.audio_transcript.delta':
           if (event.delta) {
             currentResponse += event.delta;

             ws.send(JSON.stringify({
               type: 'text',
               data: event.delta,
             }));
           }
           break;

         case 'response.done':
           if (!imageGenerated && currentResponse.length > 100) {
             try {
               console.log('Starting image generation...');
               const imagePrompt = `Create a high-quality, realistic illustration with out any text for: ${currentResponse}`;
               
               const image = await openai.images.generate({
                 model: 'dall-e-3',
                 prompt: imagePrompt + " Important: DO NOT add any text or letters to the image.",
                 size: '1024x1024',
                 size: '1024x1024',
                 n: 1,
               });

               if (image.data && image.data[0].url) {
                 console.log('Image generation successful');
                 ws.send(JSON.stringify({
                   type: 'image',
                   data: image.data[0].url,
                 }));
                 imageGenerated = true;
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
       console.error('Error processing message:', error);
     }
   });

   realtimeWs.on('error', (error) => {
     console.error('WebSocket error:', error);
   });
 };

 connectToRealtimeAPI();

 ws.on('message', async (message) => {
   try {
     const data = JSON.parse(message);
     
     // 연령대 설정 메시지 처리
     if (data.type === 'init') {
       selectedAge = data.ageGroup;
     }

     if (data.type === 'audio' && realtimeWs?.readyState === WebSocket.OPEN) {
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

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});