import axios from "axios";

export async function askOllama(prompt: string, maxTokens = 500) {
  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "gemma3:latest",
    prompt,
    stream: false,
    options: {
      num_predict: maxTokens,
      temperature: 0.8
    }
  });

  return res.data.response;
}