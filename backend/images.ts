import fs from "fs";

export function getImages() {
  const images = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1520962922320-2038eebab146",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21"
  ];

  fs.writeFileSync("./output/images.json", JSON.stringify(images));
  console.log("🖼️ Imagens salvas");
}