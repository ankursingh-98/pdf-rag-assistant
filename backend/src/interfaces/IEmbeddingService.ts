import type { TextChunk } from '../types/chunk.js';
import type { EmbeddingResult } from '../types/embedding.js';

export interface IEmbeddingService {
  embedText(text: string): Promise<number[]>;
  embedChunks(chunks: TextChunk[]): Promise<EmbeddingResult>;
}
