import fs from "fs";

const outputPath = "./output/video-clips.json";

const clips = [
  {
    scene: 1,
    keyword: "oceano profundo mistério",
    duration: 10,
    source: "manual",
    file: "./videos/oceano/oceano_01.mp4"
  },
  {
    scene: 2,
    keyword: "ondas escuras noite",
    duration: 10,
    source: "manual",
    file: "./videos/oceano/oceano_02.mp4"
  },
  {
    scene: 3,
    keyword: "navio abandonado",
    duration: 10,
    source: "manual",
    file: "./videos/navios/navio_01.mp4"
  }
];

fs.mkdirSync("./output", { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(clips, null, 2), "utf8");

console.log("✅ Banco de vídeos criado em output/video-clips.json");