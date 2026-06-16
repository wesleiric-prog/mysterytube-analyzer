import fs from "fs";
import path from "path";

const MAP_PATH = "./output/video-scene-map.json";
const CLIPS_DIR = "./output/capcut-pack/clips";

if (!fs.existsSync(MAP_PATH)) {
  console.error("❌ video-scene-map.json não encontrado.");
  process.exit(1);
}

if (fs.existsSync(CLIPS_DIR)) {
  fs.rmSync(CLIPS_DIR, { recursive: true, force: true });
}

fs.mkdirSync(CLIPS_DIR, { recursive: true });

const scenes = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));

for (const scene of scenes) {
  const source = scene.video;

  if (!fs.existsSync(source)) {
    console.warn(`⚠️ Vídeo não encontrado: ${source}`);
    continue;
  }

  const fileName = `scene_${String(scene.scene).padStart(2, "0")}_${path.basename(source)}`;
  const dest = path.join(CLIPS_DIR, fileName);

  fs.copyFileSync(source, dest);
}

console.log(`✅ Clipes copiados para ${CLIPS_DIR}`);