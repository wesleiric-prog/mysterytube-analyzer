import { GoogleGenAI } from '@google/genai';
import { ConfigurationError, ExternalServiceError } from './server-errors';
import { logger } from './server-logger';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  logger.warn('gemini.api_key_missing');
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey ?? '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function parseJsonResponse<T>(rawResponse: string | undefined, context: string): T {
  const text = rawResponse?.trim();

  if (!text) {
    throw new ExternalServiceError(`O Gemini retornou uma resposta vazia em ${context}.`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ExternalServiceError(`O Gemini retornou JSON inválido em ${context}.`, {
      context,
      preview: text.slice(0, 500),
    });
  }
}

export async function generateJsonContent<T>(prompt: string, context: string): Promise<T> {
  if (!geminiApiKey) {
    throw new ConfigurationError('GEMINI_API_KEY não configurada.');
  }

  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    model: "gemma3",
    prompt: prompt,
    stream: false
  }),
});

const data = await response.json();

return parseJsonResponse<T>(data.response, context);
  } catch (error) {
    if (error instanceof ExternalServiceError || error instanceof ConfigurationError) {
      throw error;
    }

    throw new ExternalServiceError(`Falha ao consultar o Gemini em ${context}.`, {
      context,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export { parseJsonResponse };