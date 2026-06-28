import type { PdfExtractionResult } from '../types/upload.js';

export interface IPdfExtractionService {
  extractFromStoredFile(storedFilename: string): Promise<PdfExtractionResult>;
}
