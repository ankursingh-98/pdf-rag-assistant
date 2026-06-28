import type { NextFunction, Request, Response } from 'express';
import type { IUploadService } from '../interfaces/IUploadService.js';
import { uploadService } from '../services/uploadService.js';

export class UploadController {
  constructor(private readonly service: IUploadService = uploadService) {}

  async handleUpload(req: Request, res: Response): Promise<void> {
    const files = await this.service.processUploadedFiles(
      req.files as Express.Multer.File[] | undefined,
    );

    res.status(201).json({
      status: 'success',
      message: `${files.length} file(s) uploaded, processed, embedded, and stored in Qdrant successfully`,
      files,
    });
  }
}

export const uploadController = new UploadController();

export function handleUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  uploadController.handleUpload(req, res).catch(next);
}
