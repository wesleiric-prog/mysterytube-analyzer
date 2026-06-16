import { execSync } from "child_process";

console.log("🎬 Iniciando projeto completo...");

execSync("npx tsx downloadPexelsVideos.ts", { stdio: "inherit" });
execSync("npx tsx smartSceneMatcher.ts", { stdio: "inherit" });
execSync("npx tsx generateTimeline.ts", { stdio: "inherit" });
execSync("npx tsx copyClipsToCapcutPack.ts", { stdio: "inherit" });

console.log("✅ Projeto completo gerado!");
console.log("📂 output/capcut-pack");