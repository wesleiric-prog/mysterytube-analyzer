import fs from "fs";
import { askOllama } from "./ollama";

async function main() {
  const topics = JSON.parse(
    fs.readFileSync("./output/viral-topics.json", "utf8")
  );

  const topic = topics[0];

  console.log("🎬 Tema escolhido:");
  console.log(topic.title);

  const prompt = `
You are a professional YouTube mystery documentary writer.

Create a 15-minute script in English.

Rules:
- Strong hook in first 15 seconds
- Suspense throughout the story
- Gradual revelations
- Emotional storytelling
- Dark documentary style
- Final theory section
- Call to action at the end

Topic:
${topic.title}

Return ONLY clean narration text spoken by the narrator.
Do not include music cues.
Do not include sound effects.
Do not include parentheses.
Do not include camera instructions.
Do not include scene directions.
Do not include labels like narrator, pause, music, background, or dramatic effect.
Write it as one continuous spoken documentary narration.
`;

  const script = await askOllama(prompt);

  fs.writeFileSync("./output/script.txt", script);

  console.log("✅ English script generated");
  console.log("📄 Saved to output/script.txt");
}

main();