import sqlite3 from "sqlite3";
import { askOllama } from "./ollama";
import { textToSpeech } from "./tts";
import fs from "fs";

const db = new sqlite3.Database("../mystery_channels.db");

db.get(
  `
  SELECT title, viral_score
  FROM videos
  ORDER BY viral_score DESC
  LIMIT 1
`,
  async (err, row: any) => {
    if (err || !row) {
      console.log("Nenhum vídeo encontrado");
      return;
    }

    console.log("Vídeo escolhido:", row.title);

    const prompt = `
Você é um roteirista profissional de canais de mistério.

Crie um roteiro de aproximadamente 12 minutos.

Regras:
- Gancho forte nos primeiros 15 segundos
- Suspense crescente
- Linguagem emocional
- Clímax próximo ao final
- Pergunta para comentários

Tema:
${row.title}
`;

    const script = await askOllama(prompt);

    fs.writeFileSync("./output/script.txt", script);

    await textToSpeech(script);

    console.log("✅ Projeto gerado!");
  }
);