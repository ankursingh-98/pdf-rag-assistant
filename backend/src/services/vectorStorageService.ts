import { qdrantRepository } from '../repositories/qdrantRepository.js';
import type { IVectorRepository } from '../interfaces/IVectorRepository.js';
import type { EmbeddingResult } from '../types/embedding.js';
import type { VectorStorageResult } from '../types/vector.js';

export class VectorStorageService {
  constructor(private readonly vectors: IVectorRepository = qdrantRepository) {}

  async storeEmbeddings(
    filename: string,
    embeddings: EmbeddingResult,
  ): Promise<VectorStorageResult> {
    if (embeddings.chunkCount > 0) {
      await this.vectors.ensureCollection(embeddings.dimensions);
    }

    return this.vectors.upsertEmbeddedChunks(filename, embeddings.chunks);
  }
}

export const vectorStorageService = new VectorStorageService();
