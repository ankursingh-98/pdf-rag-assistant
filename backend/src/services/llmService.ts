import axios, { isAxiosError } from 'axios';
import { config } from '../config/index.js';
import type { ILlmService } from '../interfaces/ILlmService.js';
import { AppError } from '../types/errors.js';
import { getSystemPrompt } from '../utils/ragPrompt.js';
import { logger } from '../utils/logger.js';

interface OllamaChatResponse {
  message?: {
    role: string;
    content: string;
  };
}

export class LlmService implements ILlmService {
  constructor(
    private readonly baseUrl: string = config.OLLAMA_BASE_URL,
    private readonly model: string = config.OLLAMA_CHAT_MODEL,
  ) {}

  async generateAnswer(
    question: string,
    context: string,
  ): Promise<{ answer: string; latencyMs: number }> {
    const start = Date.now();

    try {
      const response = await axios.post<OllamaChatResponse>(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          stream: false,
          messages: [
            { role: 'system', content: getSystemPrompt() },
            {
              role: 'user',
              content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}\n\nAnswer using ONLY the context above.`,
            },
          ],
        },
        { timeout: 120_000 },
      );

      const answer = response.data.message?.content?.trim();

      if (!answer) {
        throw new AppError(502, 'Ollama returned an empty answer.');
      }

      const latencyMs = Date.now() - start;

      logger.info(
        `LLM answer generated with "${this.model}" in ${latencyMs}ms`,
      );

      return { answer, latencyMs };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new AppError(
            503,
            'Ollama is not running. Start it with: ollama serve',
          );
        }

        if (error.response?.status === 404) {
          throw new AppError(
            503,
            `Ollama chat model "${this.model}" not found. Run: ollama pull ${this.model}`,
          );
        }

        const message =
          typeof error.response?.data === 'object' &&
          error.response.data !== null &&
          'error' in error.response.data
            ? String((error.response.data as { error: string }).error)
            : error.message;

        throw new AppError(502, `Ollama chat failed: ${message}`);
      }

      throw new AppError(502, 'Ollama chat failed due to an unexpected error.');
    }
  }
}

export const llmService = new LlmService();
