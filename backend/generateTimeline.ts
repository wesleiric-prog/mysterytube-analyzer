import fs from "fs";

const SCENE_MAP = "./output/video-scene-map.json";
const OUTPUT = "./output/timeline.json";

if (!fs.existsSync(SCENE_MAP)) {
  console.error("❌ video-scene-map.json não encontrado.");
  process.exit(1);
}

const scenes = JSON.parse(fs.readFileSync(SCENE_MAP, "utf8"));

const timeline = scenes.map((scene: any) => ({
  scene: scene.scene,
  start: scene.start,
  end: scene.end,
  duration: scene.duration,
  category: scene.category,
  clip: scene.video,
  text: scene.text
}));

fs.writeFileSync(OUTPUT, JSON.stringify(timeline, null, 2), "utf8");

console.log(`✅ Timeline criada com ${timeline.length} cenas`);
console.log(`📄 Salvo em ${OUTPUT}`);