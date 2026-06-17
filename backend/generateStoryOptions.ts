import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não encontrada.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Responda SOMENTE com JSON válido.
Não escreva explicações.
Não use markdown.
Não use crases.

Gere exatamente 3 ideias virais de vídeos para YouTube.

Categoria: ${category}
Idioma: Português do Brasil

Regras:
- Use português brasileiro natural e correto
- Os títulos devem parecer vídeos reais de canal dark brasileiro
- Foque em mistério, terror psicológico, investigação e suspense

Formato exato:
[
  { "id": 1, "title": "Título da ideia 1" },
  { "id": 2, "title": "Título da ideia 2" },
  { "id": 3, "title": "Título da ideia 3" }
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  });

  const text = response.text || "";
  const cleanJson = extractJsonArray(text);
  const parsed = JSON.parse(cleanJson);

  const outputDir = path.join(process.cwd(), "output");
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "story-options.json"),
    JSON.stringify(parsed, null, 2),
    "utf8"
  );

  console.log("✅ 3 ideias geradas com Gemini");
  console.log("📄 output/story-options.json");
}

main();