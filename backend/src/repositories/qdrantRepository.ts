import { randomUUID } from 'node:crypto';
import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';
import type { IVectorRepository } from '../interfaces/IVectorRepository.js';
import { AppError } from '../types/errors.js';
import type { EmbeddedChunk } from '../types/embedding.js';
import type { SearchResultItem } from '../types/search.js';
import type { VectorStorageResult } from '../types/vector.js';
import { logger } from '../utils/logger.js';

interface ChunkPayload {
  text: string;
  filename: string;
  page: number;
  chunkNumber: number;
  documentId: string;
}

export class QdrantRepository implements IVectorRepository {
  private readonly client: QdrantClient;
  private readyVectorSize: number | null = null;

  constructor(private readonly collectionName: string = config.QDRANT_COLLECTION_NAME) {
    this.client = new QdrantClient({ url: config.QDRANT_URL });
  }

  async ensureCollection(vectorSize: number): Promise<void> {
    if (this.readyVectorSize === vectorSize) {
      return;
    }

    try {
      const { collections } = await this.client.getCollections();
      const exists = collections.some(
        (collection) => collection.name === this.collectionName,
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        });

        logger.info(
          `Created Qdrant collection "${this.collectionName}" (${vectorSize} dimensions, Cosine distance)`,
        );
        this.readyVectorSize = vectorSize;
        return;
      }

      const collection = await this.client.getCollection(this.collectionName);
      const existingSize = this.getConfiguredVectorSize(collection);

      if (existingSize !== vectorSize) {
        throw new AppError(
          500,
          `Qdrant collection "${this.collectionName}" expects ${existingSize} dimensions, but embeddings have ${vectorSize}.`,
        );
      }

      this.readyVectorSize = vectorSize;
      logger.info(`Qdrant collection "${this.collectionName}" is ready`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        503,
        'Qdrant is not running. Start it with: docker compose up -d',
      );
    }
  }

  async upsertEmbeddedChunks(
    filename: string,
    chunks: EmbeddedChunk[],
  ): Promise<VectorStorageResult> {
    if (chunks.length === 0) {
      return {
        collectionName: this.collectionName,
        storedCount: 0,
        latencyMs: 0,
        points: [],
      };
    }

    const vectorSize = chunks[0].dimensions;
    await this.ensureCollection(vectorSize);

    const start = Date.now();
    const points = chunks.map((chunk) => {
      const pointId = randomUUID();

      return {
        id: pointId,
        record: {
          pointId,
          chunkNumber: chunk.chunkNumber,
          page: chunk.page,
        },
        point: {
          id: pointId,
          vector: chunk.embedding,
          payload: {
            text: chunk.text,
            filename,
            page: chunk.page,
            chunkNumber: chunk.chunkNumber,
            documentId: chunk.documentId,
          },
        },
      };
    });

    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: points.map((entry) => entry.point),
      });
    } catch {
      throw new AppError(503, 'Failed to store vectors in Qdrant.');
    }

    const latencyMs = Date.now() - start;

    logger.info(
      `Stored ${points.length} vector(s) in Qdrant collection "${this.collectionName}" (${latencyMs}ms)`,
    );

    return {
      collectionName: this.collectionName,
      storedCount: points.length,
      latencyMs,
      points: points.map((entry) => entry.record),
    };
  }

  async searchSimilar(
    queryVector: number[],
    limit: number,
  ): Promise<SearchResultItem[]> {
    try {
      const hits = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit,
        with_payload: true,
      });

      return hits
        .map((hit) => this.mapSearchHit(hit))
        .filter((hit): hit is SearchResultItem => hit !== null);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(503, 'Qdrant search failed. Is Qdrant running?');
    }
  }

  private mapSearchHit(hit: {
    id: string | number;
    score: number;
    payload?: Record<string, unknown> | null;
  }): SearchResultItem | null {
    const payload = this.parsePayload(hit.payload);
    if (!payload) {
      return null;
    }

    return {
      pointId: String(hit.id),
      score: hit.score,
      text: payload.text,
      filename: payload.filename,
      page: payload.page,
      chunkNumber: payload.chunkNumber,
      documentId: payload.documentId,
    };
  }

  private parsePayload(
    payload: Record<string, unknown> | null | undefined,
  ): ChunkPayload | null {
    if (!payload) {
      return null;
    }

    const { text, filename, page, chunkNumber, documentId } = payload;

    if (
      typeof text !== 'string' ||
      typeof filename !== 'string' ||
      typeof page !== 'number' ||
      typeof chunkNumber !== 'number' ||
      typeof documentId !== 'string'
    ) {
      return null;
    }

    return { text, filename, page, chunkNumber, documentId };
  }

  private getConfiguredVectorSize(collection: {
    config?: {
      params?: {
        vectors?: { size?: number } | Record<string, { size?: number }>;
      };
    };
  }): number {
    const vectors = collection.config?.params?.vectors;

    if (!vectors) {
      throw new AppError(500, 'Unable to read vector configuration from Qdrant.');
    }

    if ('size' in vectors && typeof vectors.size === 'number') {
      return vectors.size;
    }

    const firstNamedVector = Object.values(vectors)[0];
    if (firstNamedVector && typeof firstNamedVector.size === 'number') {
      return firstNamedVector.size;
    }

    throw new AppError(500, 'Unable to determine vector size from Qdrant collection.');
  }
}

export const qdrantRepository = new QdrantRepository();
