import fs from "fs";
import { askOllama } from "./ollama";
import { textToSpeech } from "./tts";

async function main() {
  const selectedId = Number(process.argv[2] || 1);

  const ideas = JSON.parse(
    fs.readFileSync("./output/story-options.json", "utf8")
  );

  const idea =
    ideas.find((item: any) => item.id === selectedId) || ideas[0];

  console.log("🎬 Gerando roteiro em português por blocos:");
  console.log(idea.title);

  const blocks = [
    "Introdução forte com gancho inicial de 3 minutos",
    "Investigação e descoberta das primeiras pistas de 4 minutos",
    "Mistério se aprofunda e surgem revelações de 4 minutos",
    "Conclusão, revelação final e encerramento de 4 minutos"
  ];

  let fullScript = "";

  for (let i = 0; i < blocks.length; i++) {
    console.log(`Gerando bloco ${i + 1}/4...`);

    const prompt = `
Você é roteirista profissional de canal dark brasileiro.

Escreva SOMENTE narração limpa em Português do Brasil.

Não use:
- títulos
- marcações
- cenas
- câmera
- efeitos sonoros
- parênteses
- narrador

Tema:
${idea.title}

Parte:
${blocks[i]}

Crie texto longo, detalhado, cinematográfico e contínuo.
`;

  const part = await askOllama(prompt, 650); 

    fullScript += "\n\n" + part.trim();

    fs.writeFileSync(
      "./output/script.txt",
      fullScript.trim(),
      "utf8"
    );

    console.log(`Bloco ${i + 1} concluído`);
  }

  console.log("✅ Roteiro salvo em output/script.txt");

  try {
    console.log("🔊 Gerando áudio...");

    await textToSpeech(fullScript);

    console.log("✅ Áudio salvo em output/audio.mp3");
  } catch (err: any) {
    console.log("⚠️ Falha ao gerar áudio");
    console.log(err?.message || err);
  }
}

main();