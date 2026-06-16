import "dotenv/config";
import fs from "fs";
import path from "path";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

const SCRIPT_PATH = "./output/script.txt";
const PER_QUERY = 6;

const baseQueries = [
  { folder: "misterio", query: "mystery investigation evidence detective dark cinematic" },
  { folder: "misterio", query: "old documents archive investigation case files" },
  { folder: "suspense", query: "dark hallway suspense person walking cinematic" },
  { folder: "suspense", query: "night street shadow suspense cinematic" },
  { folder: "terror", query: "abandoned house horror dark cinematic" },
  { folder: "terror", query: "haunted place scary dark fog cinematic" }
];

function detectExtraQueries(script: string) {
  const text = script.toLowerCase();
  const queries: any[] = [];

  if (text.includes("fábrica") || text.includes("abandonada")) {
    queries.push({ folder: "misterio", query: "abandoned factory dark cinematic investigation" });
  }

  if (text.includes("caixa") || text.includes("segurança")) {
    queries.push({ folder: "misterio", query: "safe box vault security room cinematic" });
  }

  if (text.includes("mensagem") || text.includes("telefone")) {
    queries.push({ folder: "suspense", query: "phone message dark room suspense cinematic" });
  }

  if (text.includes("casa") || text.includes("espírito")) {
    queries.push({ folder: "terror", query: "haunted house ghost dark cinematic" });
  }

  if (text.includes("cemitério") || text.includes("morte")) {
    queries.push({ folder: "terror", query: "cemetery night fog horror cinematic" });
  }

  if (text.includes("floresta")) {
    queries.push({ folder: "suspense", query: "dark forest fog mystery cinematic" });
  }

  return queries;
}

async function downloadFile(url: string, filePath: string) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function downloadPexels(folder: string, query: string, startIndex: number) {
  if (!PEXELS_API_KEY) return 0;

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${PER_QUERY}&orientation=landscape`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );

  const data: any = await res.json();
  let count = 0;

  for (const video of data.videos || []) {
    const file = video.video_files?.find((v: any) => v.quality === "hd") || video.video_files?.[0];
    if (!file?.link) continue;

    count++;
    const output = path.join("./videos", folder, `context_pexels_${folder}_${startIndex + count}.mp4`);
    console.log(`⬇️ Pexels: ${output}`);
    await downloadFile(file.link, output);
  }

  return count;
}

async function downloadPixabay(folder: string, query: string, startIndex: number) {
  if (!PIXABAY_API_KEY) return 0;

  const res = await fetch(
    `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${PER_QUERY}&safesearch=true`
  );

  const data: any = await res.json();
  let count = 0;

  for (const hit of data.hits || []) {
    const url = hit.videos?.medium?.url || hit.videos?.small?.url || hit.videos?.large?.url;
    if (!url) continue;

    count++;
    const output = path.join("./videos", folder, `context_pixabay_${folder}_${startIndex + count}.mp4`);
    console.log(`⬇️ Pixabay: ${output}`);
    await downloadFile(url, output);
  }

  return count;
}

async function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error("❌ output/script.txt não encontrado.");
    process.exit(1);
  }

  const script = fs.readFileSync(SCRIPT_PATH, "utf8");

  const queries = [
    ...baseQueries,
    ...detectExtraQueries(script)
  ];

  for (const q of queries) {
    fs.mkdirSync(path.join("./videos", q.folder), { recursive: true });

    const existing = fs
      .readdirSync(path.join("./videos", q.folder))
      .filter((f) => f.endsWith(".mp4")).length;

    console.log(`🔎 Buscando cenas para o roteiro: ${q.query}`);

    const pexelsCount = await downloadPexels(q.folder, q.query, existing);
    await downloadPixabay(q.folder, q.query, existing + pexelsCount);
  }

  console.log("✅ Cenas baixadas com base no roteiro.");
}

main();