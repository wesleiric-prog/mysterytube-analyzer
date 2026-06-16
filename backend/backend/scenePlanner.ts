import fs from "fs";

const SCRIPT_PATH = "./output/script.txt";
const OUTPUT_PATH = "./output/scenes.json";

function generateScenes(script: string) {
  const words = script.split(/\s+/);

  const totalScenes = 90;
  const wordsPerScene = Math.max(
    20,
    Math.floor(words.length / totalScenes)
  );

  const scenes = [];

  for (let i = 0; i < totalScenes; i++) {
    const start = i * wordsPerScene;
    const end = start + wordsPerScene;

    const excerpt = words.slice(start, end).join(" ");

    scenes.push({
      scene: i + 1,
      duration: 10,
      text: excerpt,
      keyword: excerpt
        .split(" ")
        .filter((w) => w.length > 5)
        .slice(0, 3)
        .join(" "),
    });
  }

  return scenes;
}

async function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error("❌ script.txt não encontrado.");
    return;
  }

  const script = fs.readFileSync(SCRIPT_PATH, "utf8");

  const scenes = generateScenes(script);

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(scenes, null, 2),
    "utf8"
  );

  console.log(`✅ ${scenes.length} cenas geradas em ${OUTPUT_PATH}`);
}

main();