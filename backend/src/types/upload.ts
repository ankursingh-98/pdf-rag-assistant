import type { ChunkingResult } from './chunk.js';
import type { EmbeddingResult } from './embedding.js';
import type { VectorStorageResult } from './vector.js';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  characterCount: number;
}

export interface PdfExtractionResult {
  pageCount: number;
  text: string;
  characterCount: number;
  pages: ExtractedPage[];
}

export interface UploadedFileRecord {
  documentId: string;
  filename: string;
  size: number;
  mimetype: string;
  extraction: PdfExtractionResult;
  chunking: ChunkingResult;
  embeddings: EmbeddingResult;
  storage: VectorStorageResult;
}

export interface UploadResult {
  files: UploadedFileRecord[];
}
