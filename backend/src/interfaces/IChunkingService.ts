import type { ChunkingResult } from '../types/chunk.js';
import type { PdfExtractionResult } from '../types/upload.js';

export interface IChunkingService {
  chunkDocument(
    documentId: string,
    extraction: PdfExtractionResult,
  ): ChunkingResult;
}
