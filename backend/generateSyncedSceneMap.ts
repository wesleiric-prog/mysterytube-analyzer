import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const SCRIPT_PATH = "./output/script.txt";
const AUDIO_PATH = "./output/audio.mp3";
const OUTPUT_SCENE_MAP = "./output/video-scene-map.json";
const OUTPUT_TIMELINE = "./output/timeline.json";
const VIDEOS_DIR = "./videos";

const TOTAL_SCENES = 90;
const FALLBACK_DURATION = 15 * 60;

const categories = ["misterio", "suspense", "terror"];

function getAudioDuration() {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${AUDIO_PATH}"`,
      { encoding: "utf8" }
    );

    const duration = Number(result.trim());
    if (!isNaN(duration) && duration > 0) return duration;
  } catch {
    console.log("⚠️ Não consegui medir o áudio. Usando 15 minutos.");
  }

  return FALLBACK_DURATION;
}

function secondsToTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getVideos(category: string) {
  const dir = path.join(VIDEOS_DIR, category);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".mp4"))
    .map((file) => path.join(dir, file));
}

function chooseCategory(text: string, index: number) {
  const lower = text.toLowerCase();

  if (
    lower.includes("fantasma") ||
    lower.includes("assombr") ||
    lower.includes("entidade") ||
    lower.includes("terror") ||
    lower.includes("medo")
  ) {
    return "terror";
  }

  if (
    lower.includes("sombra") ||
    lower.includes("perseg") ||
    lower.includes("observando") ||
    lower.includes("silêncio") ||
    lower.includes("ameaça")
  ) {
    return "suspense";
  }

  if (
    lower.includes("investig") ||
    lower.includes("caso") ||
    lower.includes("pista") ||
    lower.includes("mistério") ||
    lower.includes("segredo")
  ) {
    return "misterio";
  }

  return categories[index % categories.length];
}

function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error("❌ output/script.txt não encontrado.");
    process.exit(1);
  }

  const audioDuration = getAudioDuration();
  const sceneDuration = 10;

  console.log(`🎧 Duração do áudio: ${secondsToTime(audioDuration)}`);
  console.log(`🎬 Duração por cena: ${sceneDuration.toFixed(2)}s`);

  const script = fs.readFileSync(SCRIPT_PATH, "utf8");
  const words = script.split(/\s+/).filter(Boolean);
  const wordsPerScene = Math.max(10, Math.ceil(words.length / TOTAL_SCENES));

  const videoPools: Record<string, string[]> = {
    misterio: getVideos("misterio"),
    suspense: getVideos("suspense"),
    terror: getVideos("terror")
  };

  console.log("📚 Biblioteca:");
  console.log(`Mistério: ${videoPools.misterio.length}`);
  console.log(`Suspense: ${videoPools.suspense.length}`);
  console.log(`Terror: ${videoPools.terror.length}`);

  const usedIndex: Record<string, number> = {
    misterio: 0,
    suspense: 0,
    terror: 0
  };

  const scenes = [];

  for (let i = 0; i < TOTAL_SCENES; i++) {
    const text = words
      .slice(i * wordsPerScene, (i + 1) * wordsPerScene)
      .join(" ");

    const category = chooseCategory(text, i);
    let pool = videoPools[category];

    if (!pool || pool.length === 0) {
      pool = [
        ...videoPools.misterio,
        ...videoPools.suspense,
        ...videoPools.terror
      ];
    }

    if (pool.length === 0) {
      console.error("❌ Nenhum vídeo encontrado em videos/");
      process.exit(1);
    }

    const index = usedIndex[category] || 0;
    const sceneVideo = path.join(
  "./videos/scene-keywords",
  `scene_${String(i + 1).padStart(2, "0")}.mp4`
);

const video = fs.existsSync(sceneVideo)
  ? sceneVideo
  : pool[index % pool.length];
    usedIndex[category] = index + 1;

    const startSeconds = i * sceneDuration;
    const endSeconds = (i + 1) * sceneDuration;

    scenes.push({
      scene: i + 1,
      start: secondsToTime(startSeconds),
      end: secondsToTime(endSeconds),
      startSeconds: Number(startSeconds.toFixed(2)),
      endSeconds: Number(endSeconds.toFixed(2)),
      duration: Number(sceneDuration.toFixed(2)),
      category,
      video,
      clip: video,
      text
    });
  }

  fs.writeFileSync(OUTPUT_SCENE_MAP, JSON.stringify(scenes, null, 2), "utf8");
  fs.writeFileSync(OUTPUT_TIMELINE, JSON.stringify(scenes, null, 2), "utf8");

  console.log(`✅ ${scenes.length} cenas sincronizadas criadas`);
  console.log(`📄 ${OUTPUT_SCENE_MAP}`);
  console.log(`📄 ${OUTPUT_TIMELINE}`);
}

main();