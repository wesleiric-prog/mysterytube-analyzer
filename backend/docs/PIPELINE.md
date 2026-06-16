\# Pipeline MysteryTube



\## Fluxo Atual



Dashboard

↓

SQLite

↓

Vídeo mais viral

↓

Ollama (llama3.2:3b)

↓

Roteiro

↓

gTTS

↓

audio.mp3



\## Comandos



\### Dashboard

npx tsx server.ts



\### Ollama

ollama serve



\### Gerar projeto pelo vídeo mais viral

cd backend

npm run topvideo



\### Abrir resultado

start output\\audio.mp3

notepad output\\script.txt



\## Arquivos importantes



server.ts

server-db.ts



backend/

├── generateFromTopVideo.ts

├── generateVideo.ts

├── ollama.ts

├── tts.ts

└── output/



output/

├── script.txt

├── audio.mp3

└── images/

