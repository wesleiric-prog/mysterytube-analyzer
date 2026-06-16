import fs from "fs";
import path from "path";

const SCRIPT_PATH = "./output/script.txt";
const OUTPUT_PATH = "./output/video-scene-map.json";
const VIDEOS_DIR = "./videos";

const categories = [
  "oceano",
  "navios",
  "floresta",
  "abandonados",
  "documentos",
  "terror"
];

function getAllVideos() {
  const all: string[] = [];

  for (const category of categories) {
    const dir = path.join(VIDEOS_DIR, category);

    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".mp4"))
      .map((file) => path.join(dir, file));

    all.push(...files);
  }

  return all;
}

function secondsToTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error("❌ output/script.txt não encontrado.");
    process.exit(1);
  }

  const videos = getAllVideos();

  if (videos.length === 0) {
    console.error("❌ Nenhum vídeo .mp4 encontrado na pasta videos.");
    process.exit(1);
  }

  const totalDurationSeconds = 15 * 60;
  const clipDuration = 10;
  const totalScenes = totalDurationSeconds / clipDuration;

  const script = fs.readFileSync(SCRIPT_PATH, "utf8");
  const words = script.split(/\s+/);
  const wordsPerScene = Math.max(10, Math.floor(words.length / totalScenes));

  const scenes = [];

  for (let i = 0; i < totalScenes; i++) {
    const startSecond = i * clipDuration;
    const video = videos[i % videos.length];

    const sceneText = words
      .slice(i * wordsPerScene, (i + 1) * wordsPerScene)
      .join(" ");

    scenes.push({
      scene: i + 1,
      start: secondsToTime(startSecond),
      end: secondsToTime(startSecond + clipDuration),
      duration: clipDuration,
      video,
      text: sceneText
    });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(scenes, null, 2), "utf8");

  console.log(`✅ ${scenes.length} cenas criadas em ${OUTPUT_PATH}`);
  console.log(`🎬 Vídeos encontrados: ${videos.length}`);
}

main();