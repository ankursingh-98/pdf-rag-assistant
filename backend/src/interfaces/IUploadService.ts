import type { UploadedFileRecord } from '../types/upload.js';

export interface IUploadService {
  processUploadedFiles(
    files: Express.Multer.File[] | undefined,
  ): Promise<UploadedFileRecord[]>;
}
