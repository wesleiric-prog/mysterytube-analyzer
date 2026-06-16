import { textToSpeech } from "./tts";

async function main() {
  await textToSpeech(
    "Bem-vindos ao canal. Hoje vamos explorar um dos maiores mistérios já registrados."
  );
}

main();