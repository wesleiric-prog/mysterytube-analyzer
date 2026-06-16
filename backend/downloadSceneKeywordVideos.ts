import "dotenv/config";
import fs from "fs";
import path from "path";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

const KEYWORDS_PATH = "./output/scene-keywords.json";
const OUTPUT_DIR = "./videos/scene-keywords";

async function downloadFile(url: string, filePath: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro ao baixar arquivo: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function searchPexels(query: string) {
  if (!PEXELS_API_KEY) return null;

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    }
  );

  if (!res.ok) return null;

  const data: any = await res.json();
  const video = data.videos?.[0];

  const file =
    video?.video_files?.find((v: any) => v.quality === "hd") ||
    video?.video_files?.[0];

  return file?.link || null;
}

async function searchPixabay(query: string) {
  if (!PIXABAY_API_KEY) return null;

  const res = await fetch(
    `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=1&safesearch=true`
  );

  if (!res.ok) return null;

  const data: any = await res.json();
  const hit = data.hits?.[0];

  return (
    hit?.videos?.medium?.url ||
    hit?.videos?.small?.url ||
    hit?.videos?.large?.url ||
    null
  );
}

async function main() {
  if (!fs.existsSync(KEYWORDS_PATH)) {
    console.error("❌ output/scene-keywords.json não encontrado.");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const scenes = JSON.parse(fs.readFileSync(KEYWORDS_PATH, "utf8"));

  for (const scene of scenes) {
    const filePath = path.join(
      OUTPUT_DIR,
      `scene_${String(scene.scene).padStart(2, "0")}.mp4`
    );

    if (fs.existsSync(filePath)) {
      console.log(`⏭️ Cena ${scene.scene} já existe`);
      continue;
    }

    console.log(`🔎 Cena ${scene.scene}: ${scene.query}`);

    let url = await searchPexels(scene.query);

    if (!url) {
      url = await searchPixabay(scene.query);
    }

    if (!url) {
      console.log(`⚠️ Nada encontrado para cena ${scene.scene}`);
      continue;
    }

    try {
      await downloadFile(url, filePath);
      console.log(`✅ Baixado: ${filePath}`);
    } catch (err: any) {
      console.log(`❌ Erro cena ${scene.scene}: ${err.message}`);
    }
  }

  console.log("✅ Download por cena finalizado.");
}

main();