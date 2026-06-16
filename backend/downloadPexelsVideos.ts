import "dotenv/config";
import fs from "fs";
import path from "path";

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
  console.error("❌ PEXELS_API_KEY não encontrada no .env");
  process.exit(1);
}

const themes = [
  { folder: "misterio", query: "dark mystery investigation cinematic" },
  { folder: "suspense", query: "suspense dark cinematic fog" },
  { folder: "terror", query: "haunted scary horror dark" }

];

async function downloadFile(url: string, filePath: string) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function main() {
  for (const theme of themes) {
    const dir = path.join("./videos", theme.folder);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`🔎 Buscando: ${theme.query}`);

    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(theme.query)}&per_page=15&orientation=landscape`,
      {
        headers: {
          Authorization: API_KEY!
        }
      }
    );

    const data: any = await res.json();

    for (let i = 0; i < data.videos.length; i++) {
      const video = data.videos[i];
      const file = video.video_files.find((v: any) => v.quality === "hd") || video.video_files[0];

      const output = path.join(dir, `${theme.folder}_${i + 1}.mp4`);

      console.log(`⬇️ Baixando ${output}`);
      await downloadFile(file.link, output);
    }
  }

  console.log("✅ Vídeos baixados em backend/videos/");
}

main();