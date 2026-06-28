import { config } from '../config/index.js';
import type { IChunkingService } from '../interfaces/IChunkingService.js';
import { AppError } from '../types/errors.js';
import type { ChunkingResult, TextChunk } from '../types/chunk.js';
import type { PdfExtractionResult } from '../types/upload.js';
import { splitTextWithOverlap } from '../utils/textChunker.js';

export class ChunkingService implements IChunkingService {
  constructor(
    private readonly chunkSize: number = config.CHUNK_SIZE,
    private readonly overlap: number = config.CHUNK_OVERLAP,
  ) {
    if (this.overlap >= this.chunkSize) {
      throw new AppError(
        500,
        'Invalid chunk config: CHUNK_OVERLAP must be smaller than CHUNK_SIZE.',
      );
    }
  }

  chunkDocument(
    documentId: string,
    extraction: PdfExtractionResult,
  ): ChunkingResult {
    const chunks: TextChunk[] = [];
    let chunkNumber = 1;

    for (const page of extraction.pages) {
      const pageChunks = splitTextWithOverlap(
        page.text,
        this.chunkSize,
        this.overlap,
      );

      for (const text of pageChunks) {
        chunks.push({
          chunkNumber,
          documentId,
          page: page.pageNumber,
          text,
          characterCount: text.length,
        });
        chunkNumber += 1;
      }
    }

    return {
      chunkCount: chunks.length,
      chunks,
    };
  }
}

export const chunkingService = new ChunkingService();
