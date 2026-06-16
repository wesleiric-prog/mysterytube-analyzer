import { TOP_CHANNELS } from "./topChannels";

console.log("🔥 ANALISANDO TOP CANAIS");

for (const channel of TOP_CHANNELS) {
  console.log(`📺 ${channel.name}`);
  console.log(`🎯 Nicho: ${channel.niche}`);
}

console.log("");
console.log("Próxima etapa:");
console.log("Buscar vídeos via YouTube API");
console.log("Extrair títulos");
console.log("Detectar padrões virais");
console.log("Gerar novos temas");