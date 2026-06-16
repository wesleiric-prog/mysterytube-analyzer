import fs from "fs";
import path from "path";

const SCRIPT_PATH = "./output/script.txt";
const OUTPUT_PATH = "./output/video-scene-map.json";
const VIDEOS_DIR = "./videos";

const categories = [
  {
    name: "misterio",
    keywords: [
      "mistério", "misterioso", "investigação", "investigador", "evidência",
      "caso", "arquivo", "segredo", "oculto", "pista", "detetive",
      "relatório", "verdade", "desaparecimento", "enigma", "crime",
      "mystery", "investigation", "evidence", "case", "secret", "clue"
    ]
  },
  {
    name: "suspense",
    keywords: [
      "suspense", "tensão", "perseguido", "observado", "sumiu",
      "desapareceu", "desaparecida", "estranho", "silêncio", "passos",
      "sombra", "noite", "sozinho", "medo", "ameaça", "suspeito",
      "missing", "vanished", "shadow", "night", "fear", "strange"
    ]
  },
  {
    name: "terror",
    keywords: [
      "terror", "horror", "assombrado", "fantasma", "demônio", "maligno",
      "escuro", "grito", "sangue", "maldição", "possuído", "entidade",
      "pesadelo", "morte", "casa", "espíritos",
      "haunted", "ghost", "demon", "evil", "scary", "death"
    ]
  }
];

function getVideos(category: string) {
  const dir = path.join(VIDEOS_DIR, category);

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".mp4"))
    .map((file) => path.join(dir, file));
}

function chooseCategory(text: string) {
  const lower = text.toLowerCase();

  let bestCategory = "misterio";
  let bestScore = 0;

  for (const category of categories) {
    let score = 0;

    for (const keyword of category.keywords) {
      if (lower.includes(keyword.toLowerCase())) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category.name;
    }
  }

  return bestCategory;
}

function secondsToTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function pickVideoWithoutRepeating(
  category: string,
  videoPools: Record<string, string[]>,
  usedIndex: Record<string, number>
) {
  let videos = videoPools[category] || [];

  if (videos.length === 0) {
    videos = [
      ...(videoPools["misterio"] || []),
      ...(videoPools["suspense"] || []),
      ...(videoPools["terror"] || [])
    ];
  }

  if (videos.length === 0) return null;

  const index = usedIndex[category] || 0;
  const video = videos[index % videos.length];

  usedIndex[category] = index + 1;

  return video;
}

function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error("❌ output/script.txt não encontrado.");
    process.exit(1);
  }

  const script = fs.readFileSync(SCRIPT_PATH, "utf8");

  const videoPools: Record<string, string[]> = {
    misterio: getVideos("misterio"),
    suspense: getVideos("suspense"),
    terror: getVideos("terror")
  };

  console.log("🎬 Biblioteca carregada:");
  console.log(`🕵️ Mistério: ${videoPools.misterio.length} vídeos`);
  console.log(`😰 Suspense: ${videoPools.suspense.length} vídeos`);
  console.log(`👻 Terror: ${videoPools.terror.length} vídeos`);

  const words = script.split(/\s+/).filter(Boolean);
  const totalScenes = 90;
  const duration = 10;
  const wordsPerScene = Math.max(20, Math.floor(words.length / totalScenes));

  const usedIndex: Record<string, number> = {};
  const scenes = [];

  for (let i = 0; i < totalScenes; i++) {
    const text = words
      .slice(i * wordsPerScene, (i + 1) * wordsPerScene)
      .join(" ");

    let category = chooseCategory(text);

    // Mistura as categorias para não ficar tudo igual.
    // A cada 5 cenas, força uma variação leve.
    if (i % 5 === 1 && videoPools.suspense.length > 0) category = "suspense";
    if (i % 5 === 3 && videoPools.terror.length > 0) category = "terror";
    if (i % 5 === 0 && videoPools.misterio.length > 0) category = "misterio";

    const video = pickVideoWithoutRepeating(category, videoPools, usedIndex);

    if (!video) {
      console.warn(`⚠️ Nenhum vídeo encontrado para cena ${i + 1}`);
      continue;
    }

    scenes.push({
      scene: i + 1,
      start: secondsToTime(i * duration),
      end: secondsToTime((i + 1) * duration),
      duration,
      category,
      video,
      text
    });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(scenes, null, 2), "utf8");

  console.log(`✅ ${scenes.length} cenas inteligentes criadas`);
  console.log(`📄 Salvo em ${OUTPUT_PATH}`);
  console.log("✅ Sistema agora evita repetir vídeos até esgotar a biblioteca da categoria.");
}

main();