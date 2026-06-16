import fs from "fs";
import { askOllama } from "./ollama";

const SCRIPT_PATH = "./output/script.txt";
const OUTPUT_PATH = "./output/scene-keywords.json";
const TOTAL_SCENES = 90;

function extractJsonArray(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("JSON inválido");
  return text.slice(start, end + 1);
}

async function main() {
  const script = fs.readFileSync(SCRIPT_PATH, "utf8");
  const words = script.split(/\s+/).filter(Boolean);
  const wordsPerScene = Math.ceil(words.length / TOTAL_SCENES);

  const scenes = [];

  for (let i = 0; i < TOTAL_SCENES; i++) {
    const text = words.slice(i * wordsPerScene, (i + 1) * wordsPerScene).join(" ");

    const prompt = `
Responda SOMENTE JSON válido.

Transforme este trecho de roteiro em UMA busca visual curta em inglês para achar vídeo de banco de imagens.

Regras:
- Não invente coisa fora do trecho
- Não use nomes de pessoas
- Foque no que aparece visualmente
- Máximo 8 palavras
- Estilo cinematográfico sombrio

Trecho:
${text}

Formato:
[
  {
    "query": "..."
  }
]
`;

    const response = await askOllama(prompt, 120);
    const parsed = JSON.parse(extractJsonArray(response));

    scenes.push({
      scene: i + 1,
      text,
      query: parsed[0]?.query || "dark mystery cinematic scene"
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(scenes, null, 2), "utf8");
    console.log(`✅ Cena ${i + 1}/90: ${scenes[i].query}`);
  }

  console.log("📄 output/scene-keywords.json criado");
}

main();