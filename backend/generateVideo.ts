import { askOllama } from "./ollama";
import { textToSpeech } from "./tts";
import fs from "fs";

async function generateVideo() {
  console.log("🎬 Gerando roteiro...");

const prompt = `
Você é um roteirista profissional de canais de mistério.

Crie um roteiro de aproximadamente 12 minutos.

Regras:
- Gancho chocante nos primeiros 15 segundos
- Suspense crescente
- Linguagem emocional
- Revelações graduais
- Clímax próximo ao final
- Pergunta para comentários no encerramento

Estrutura:
1. Gancho
2. Contexto
3. Desenvolvimento
4. Revelação
5. Conclusão

Tema:
Segredos do Oceano
`;