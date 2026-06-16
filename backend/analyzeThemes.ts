import fs from "fs";

const videos = JSON.parse(
  fs.readFileSync("./output/trending-videos.json", "utf8")
);

const words: Record<string, number> = {};

for (const video of videos) {
  const title = video.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "");

  const tokens = title.split(" ");

  for (const token of tokens) {
    if (token.length < 4) continue;

    words[token] = (words[token] || 0) + 1;
  }
}

const sorted = Object.entries(words)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50);

console.table(sorted);

fs.writeFileSync(
  "./output/theme-analysis.json",
  JSON.stringify(sorted, null, 2)
);

console.log("✅ theme-analysis.json criado");