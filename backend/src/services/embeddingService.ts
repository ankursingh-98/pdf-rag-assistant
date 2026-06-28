import axios, { isAxiosError } from 'axios';
import { config } from '../config/index.js';
import type { IEmbeddingService } from '../interfaces/IEmbeddingService.js';
import { AppError } from '../types/errors.js';
import type { TextChunk } from '../types/chunk.js';
import type { EmbeddedChunk, EmbeddingResult } from '../types/embedding.js';
import { logger } from '../utils/logger.js';

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export class EmbeddingService implements IEmbeddingService {
  constructor(
    private readonly baseUrl: string = config.OLLAMA_BASE_URL,
    private readonly model: string = config.OLLAMA_EMBED_MODEL,
  ) {}

  async embedChunks(chunks: TextChunk[]): Promise<EmbeddingResult> {
    const start = Date.now();

    if (chunks.length === 0) {
      return {
        model: this.model,
        chunkCount: 0,
        dimensions: 0,
        latencyMs: 0,
        chunks: [],
      };
    }

    const embeddedChunks: EmbeddedChunk[] = [];

    for (const chunk of chunks) {
      const embedding = await this.embedText(chunk.text);
      const preview = embedding.slice(0, 5).map((value) => value.toFixed(4));

      logger.info(
        `Embedded chunk ${chunk.chunkNumber} (page ${chunk.page}): ` +
          `${embedding.length} dimensions, preview [${preview.join(', ')}...]`,
      );

      embeddedChunks.push({
        ...chunk,
        dimensions: embedding.length,
        embedding,
      });
    }

    const latencyMs = Date.now() - start;

    logger.info(
      `Generated ${embeddedChunks.length} embedding(s) using "${this.model}" in ${latencyMs}ms`,
    );

    return {
      model: this.model,
      chunkCount: embeddedChunks.length,
      dimensions: embeddedChunks[0]?.dimensions ?? 0,
      latencyMs,
      chunks: embeddedChunks,
    };
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await axios.post<OllamaEmbeddingResponse>(
        `${this.baseUrl}/api/embeddings`,
        {
          model: this.model,
          prompt: text,
        },
        { timeout: 60_000 },
      );

      if (!Array.isArray(response.data.embedding) || response.data.embedding.length === 0) {
        throw new AppError(502, `Ollama returned an invalid embedding for model "${this.model}".`);
      }

      return response.data.embedding;
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
            `Ollama model "${this.model}" not found. Run: ollama pull ${this.model}`,
          );
        }

        const message =
          typeof error.response?.data === 'object' &&
          error.response.data !== null &&
          'error' in error.response.data
            ? String((error.response.data as { error: string }).error)
            : error.message;

        throw new AppError(502, `Ollama embedding failed: ${message}`);
      }

      throw new AppError(502, 'Ollama embedding failed due to an unexpected error.');
    }
  }
}

export const embeddingService = new EmbeddingService();
