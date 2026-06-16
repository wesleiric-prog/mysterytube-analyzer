import gtts from "gtts";

export function textToSpeech(text: string) {
  return new Promise((resolve, reject) => {
    const speech = new gtts(text, "pt-br");

    const file = "./output/audio.mp3";

    speech.save(file, (err: any) => {
      if (err) {
        console.log("Erro TTS:", err);
        reject(err);
      } else {
        console.log("🔊 Áudio gerado!");
        resolve(file);
      }
    });
  });
}