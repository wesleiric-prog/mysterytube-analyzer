import "dotenv/config";
import fs from "fs";
import { TOP_CHANNELS } from "./topChannels";

const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  console.error("❌ YOUTUBE_API_KEY não encontrada.");
  process.exit(1);
}

async function searchChannelVideos(channelName: string) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&q=${encodeURIComponent(channelName)}` +
    `&type=video` +
    `&maxResults=10` +
    `&order=viewCount` +
    `&key=${API_KEY}`;

  const res = await fetch(url);
  const data: any = await res.json();

  return (data.items || []).map((item: any) => ({
    channel: channelName,
    title: item.snippet.title,
    videoId: item.id.videoId,
    publishedAt: item.snippet.publishedAt,
  }));
}

async function main() {
  const allVideos: any[] = [];

  for (const channel of TOP_CHANNELS) {
    console.log(`🔎 Buscando vídeos de: ${channel.name}`);
    const videos = await searchChannelVideos(channel.name);
    allVideos.push(...videos);
  }

  fs.mkdirSync("./output", { recursive: true });
  fs.writeFileSync(
    "./output/trending-videos.json",
    JSON.stringify(allVideos, null, 2),
    "utf8"
  );

  console.log(`✅ ${allVideos.length} vídeos salvos em output/trending-videos.json`);
}

main();