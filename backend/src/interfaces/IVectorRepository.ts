import type { EmbeddedChunk } from '../types/embedding.js';
import type { SearchResultItem } from '../types/search.js';
import type { VectorStorageResult } from '../types/vector.js';

export interface IVectorRepository {
  ensureCollection(vectorSize: number): Promise<void>;
  upsertEmbeddedChunks(
    filename: string,
    chunks: EmbeddedChunk[],
  ): Promise<VectorStorageResult>;
  searchSimilar(
    queryVector: number[],
    limit: number,
  ): Promise<SearchResultItem[]>;
}
