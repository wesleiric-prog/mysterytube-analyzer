import fs from "fs";
import { askOllama } from "./ollama";

function extractJsonArray(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("A IA não retornou uma lista JSON válida.");
  }

  return text.slice(start, end + 1);
}

async function main() {
  const category = process.argv[2] || "misterio";

  const prompt = `
Responda SOMENTE com JSON válido.
Não escreva explicações.
Não use markdown.
Não use crases.
Não escreva a palavra json.

Gere exatamente 3 ideias virais de vídeos para YouTube.

Categoria: ${category}
Idioma: Português do Brasil

Regras:
- Use português brasileiro natural e correto
- Não invente palavras estranhas
- Os títulos devem parecer vídeos reais de canal dark brasileiro
- Foque em mistério, terror psicológico, investigação e suspense
- Retorne somente uma lista JSON

Formato exato:
[
  {
    "id": 1,
    "title": "Título da ideia 1"
  },
  {
    "id": 2,
    "title": "Título da ideia 2"
  },
  {
    "id": 3,
    "title": "Título da ideia 3"
  }
]
`;

  const response = await askOllama(prompt);
  const cleanJson = extractJsonArray(response);
  const parsed = JSON.parse(cleanJson);

  fs.writeFileSync(
    "./output/story-options.json",
    JSON.stringify(parsed, null, 2),
    "utf8"
  );

  console.log("✅ 3 ideias geradas");
  console.log("📄 output/story-options.json");
}

main();