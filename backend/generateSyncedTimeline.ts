import fs from "fs";

const SCRIPT_PATH = "./output/script.txt";
const SCENE_MAP_PATH = "./output/video-scene-map.json";
const OUTPUT_PATH = "./output/synced-timeline.json";

const TARGET_DURATION_SECONDS = 15 * 60; // 15 minutos
const MIN_SCENE_DURATION = 5;
const MAX_SCENE_DURATION = 12;

function secondsToTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

if (!fs.existsSync(SCRIPT_PATH)) {
  console.error("❌ output/script.txt não encontrado.");
  process.exit(1);
}

if (!fs.existsSync(SCENE_MAP_PATH)) {
  console.error("❌ output/video-scene-map.json não encontrado.");
  process.exit(1);
}

const script = fs.readFileSync(SCRIPT_PATH, "utf8");
const baseScenes = JSON.parse(fs.readFileSync(SCENE_MAP_PATH, "utf8"));

const sentences = script
  .replace(/\s+/g, " ")
  .split(/(?<=[.!?])\s+/)
  .map((s) => s.trim())
  .filter(Boolean);

const totalWords = sentences.join(" ").split(/\s+/).filter(Boolean).length;
const secondsPerWord = TARGET_DURATION_SECONDS / Math.max(totalWords, 1);

let currentTime = 0;

const syncedScenes = sentences.map((sentence, index) => {
  const words = sentence.split(/\s+/).filter(Boolean).length;
  const rawDuration = words * secondsPerWord;
  const duration = clamp(rawDuration, MIN_SCENE_DURATION, MAX_SCENE_DURATION);

  const baseScene = baseScenes[index % baseScenes.length];

  const start = currentTime;
  const end = currentTime + duration;
  currentTime = end;

  return {
    scene: index + 1,
    start: secondsToTime(start),
    end: secondsToTime(end),
    startSeconds: Number(start.toFixed(2)),
    endSeconds: Number(end.toFixed(2)),
    duration: Number(duration.toFixed(2)),
    category: baseScene.category,
    clip: baseScene.video,
    text: sentence
  };
});

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(syncedScenes, null, 2), "utf8");

console.log(`✅ Timeline sincronizada criada com ${syncedScenes.length} cenas`);
console.log(`⏱️ Duração estimada: ${secondsToTime(currentTime)}`);
console.log(`📄 Salvo em ${OUTPUT_PATH}`);