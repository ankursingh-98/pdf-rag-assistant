import path from 'node:path';
import {
  chunkingService,
  type ChunkingService,
} from './chunkingService.js';
import {
  embeddingService,
  type EmbeddingService,
} from './embeddingService.js';
import {
  vectorStorageService,
  type VectorStorageService,
} from './vectorStorageService.js';
import {
  pdfExtractionService,
  type PdfExtractionService,
} from './pdfExtractionService.js';
import {
  fileRepository,
  type FileRepository,
} from '../repositories/fileRepository.js';
import type { IUploadService } from '../interfaces/IUploadService.js';
import { AppError } from '../types/errors.js';
import type { UploadedFileRecord } from '../types/upload.js';

const PDF_MIME_TYPE = 'application/pdf';

export class UploadService implements IUploadService {
  constructor(
    private readonly files: FileRepository = fileRepository,
    private readonly pdfExtraction: PdfExtractionService = pdfExtractionService,
    private readonly chunking: ChunkingService = chunkingService,
    private readonly embeddings: EmbeddingService = embeddingService,
    private readonly vectorStorage: VectorStorageService = vectorStorageService,
  ) {}

  async processUploadedFiles(
    multerFiles: Express.Multer.File[] | undefined,
  ): Promise<UploadedFileRecord[]> {
    if (!multerFiles || multerFiles.length === 0) {
      throw new AppError(400, 'No files uploaded. Use field name "files".');
    }

    const records: UploadedFileRecord[] = [];

    for (const file of multerFiles) {
      try {
        const record = this.validateAndMapFile(file);
        const extraction = await this.pdfExtraction.extractFromStoredFile(
          file.filename,
        );
        const chunking = this.chunking.chunkDocument(
          record.documentId,
          extraction,
        );
        const embeddings = await this.embeddings.embedChunks(chunking.chunks);
        const storage = await this.vectorStorage.storeEmbeddings(
          record.filename,
          embeddings,
        );

        records.push({
          ...record,
          extraction,
          chunking,
          embeddings,
          storage,
        });
      } catch (error) {
        await this.files.deleteFile(file.filename).catch(() => undefined);
        throw error;
      }
    }

    return records;
  }

  private validateAndMapFile(
    file: Express.Multer.File,
  ): Pick<
    UploadedFileRecord,
    'documentId' | 'filename' | 'size' | 'mimetype'
  > {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.mimetype !== PDF_MIME_TYPE) {
      throw new AppError(
        400,
        `Invalid file type for "${file.originalname}". Only PDF files are allowed.`,
      );
    }

    if (extension !== '.pdf') {
      throw new AppError(
        400,
        `Invalid file extension for "${file.originalname}". Only .pdf files are allowed.`,
      );
    }

    const documentId = path.basename(file.filename, extension);

    return {
      documentId,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

export const uploadService = new UploadService();
