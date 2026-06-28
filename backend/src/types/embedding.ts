import type { TextChunk } from './chunk.js';

export interface EmbeddedChunk extends TextChunk {
  dimensions: number;
  embedding: number[];
}

export interface EmbeddingResult {
  model: string;
  chunkCount: number;
  dimensions: number;
  latencyMs: number;
  chunks: EmbeddedChunk[];
}
