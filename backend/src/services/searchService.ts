import { embeddingService } from './embeddingService.js';
import { qdrantRepository } from '../repositories/qdrantRepository.js';
import type { IEmbeddingService } from '../interfaces/IEmbeddingService.js';
import type { ISearchService } from '../interfaces/ISearchService.js';
import type { IVectorRepository } from '../interfaces/IVectorRepository.js';
import type { SearchResult } from '../types/search.js';
import { logger } from '../utils/logger.js';

const TOP_K = 5;

export class SearchService implements ISearchService {
  constructor(
    private readonly embeddings: IEmbeddingService = embeddingService,
    private readonly vectors: IVectorRepository = qdrantRepository,
  ) {}

  async search(question: string): Promise<SearchResult> {
    const totalStart = Date.now();

    const embeddingStart = Date.now();
    const queryVector = await this.embeddings.embedText(question);
    const embeddingLatencyMs = Date.now() - embeddingStart;

    await this.vectors.ensureCollection(queryVector.length);

    const searchStart = Date.now();
    const results = await this.vectors.searchSimilar(queryVector, TOP_K);
    const searchLatencyMs = Date.now() - searchStart;

    const totalLatencyMs = Date.now() - totalStart;

    logger.info(
      `Search completed: "${question}" → ${results.length} result(s) ` +
        `(embed ${embeddingLatencyMs}ms, search ${searchLatencyMs}ms)`,
    );

    return {
      question,
      resultCount: results.length,
      embeddingLatencyMs,
      searchLatencyMs,
      totalLatencyMs,
      results,
    };
  }
}

export const searchService = new SearchService();
