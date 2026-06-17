import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

function extractJsonArray(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("A IA não retornou JSON válido.");
  return text.slice(start, end + 1);
}

async function main() {
  const category = process.argv[2] || "misterio";
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) throw new Error("GROQ_API_KEY não encontrada.");

  const groq = new Groq({ apiKey });

  const prompt = `
Responda SOMENTE com JSON válido.
Gere exatamente 3 ideias virais para canal dark no YouTube.
Categoria: ${category}
Idioma: Português do Brasil.

Formato:
[
  { "id": 1, "title": "Título da ideia 1" },
  { "id": 2, "title": "Título da ideia 2" },
  { "id": 3, "title": "Título da ideia 3" }
]
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8
  });

  const text = completion.choices[0]?.message?.content || "";
  const parsed = JSON.parse(extractJsonArray(text));

  const outputDir = path.join(process.cwd(), "output");
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "story-options.json"),
    JSON.stringify(parsed, null, 2),
    "utf8"
  );

  console.log("✅ 3 ideias geradas com Groq");
}

main();