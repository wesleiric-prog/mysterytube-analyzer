import "dotenv/config";
import fs from "fs";
import path from "path";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

const PER_SOURCE = 10;

const themes = [
  { folder: "misterio", query: "dark mystery investigation empty room no people" },
  { folder: "suspense", query: "dark suspense cinematic hallway no people" },
  { folder: "terror", query: "haunted abandoned house dark no people" }
];

async function downloadFile(url: string, filePath: string) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function downloadPexels(theme: any) {
  if (!PEXELS_API_KEY) return;

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(theme.query)}&per_page=${PER_SOURCE}&orientation=landscape`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );

  const data: any = await res.json();

  for (let i = 0; i < (data.videos || []).length; i++) {
    const video = data.videos[i];
    const file = video.video_files.find((v: any) => v.quality === "hd") || video.video_files[0];

    if (!file?.link) continue;

    const output = path.join("./videos", theme.folder, `pexels_${theme.folder}_${i + 1}.mp4`);
    console.log(`⬇️ Pexels: ${output}`);
    await downloadFile(file.link, output);
  }
}

async function downloadPixabay(theme: any) {
  if (!PIXABAY_API_KEY) return;

  const res = await fetch(
    `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(theme.query)}&per_page=${PER_SOURCE}&safesearch=true`
  );

  const data: any = await res.json();

  for (let i = 0; i < (data.hits || []).length; i++) {
    const hit = data.hits[i];
    const url =
      hit.videos?.medium?.url ||
      hit.videos?.small?.url ||
      hit.videos?.large?.url;

    if (!url) continue;

    const output = path.join("./videos", theme.folder, `pixabay_${theme.folder}_${i + 1}.mp4`);
    console.log(`⬇️ Pixabay: ${output}`);
    await downloadFile(url, output);
  }
}

async function main() {
  for (const theme of themes) {
    const dir = path.join("./videos", theme.folder);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`🔎 Buscando multi-fonte: ${theme.query}`);

    await downloadPexels(theme);
    await downloadPixabay(theme);
  }

  console.log("✅ Download multi-fonte concluído.");
}

main();