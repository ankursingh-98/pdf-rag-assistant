import { randomUUID } from 'node:crypto';
import path from 'node:path';
import multer, { type FileFilterCallback } from 'multer';
import { config } from '../config/index.js';
import { fileRepository } from '../repositories/fileRepository.js';
import { AppError } from '../types/errors.js';
import { resolveUploadDir } from '../utils/paths.js';

const MAX_FILES_PER_REQUEST = 10;
const PDF_MIME_TYPE = 'application/pdf';

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fileRepository.ensureUploadDirectory();
      cb(null, resolveUploadDir());
    } catch (error) {
      cb(error as Error, resolveUploadDir());
    }
  },
  filename: (_req, file, cb) => {
    const documentId = randomUUID();
    const extension = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `${documentId}${extension}`);
  },
});

function pdfFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (file.mimetype !== PDF_MIME_TYPE) {
    cb(
      new AppError(
        400,
        `Invalid file type for "${file.originalname}". Only PDF files are allowed.`,
      ),
    );
    return;
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (extension !== '.pdf') {
    cb(
      new AppError(
        400,
        `Invalid file extension for "${file.originalname}". Only .pdf files are allowed.`,
      ),
    );
    return;
  }

  cb(null, true);
}

export const uploadPdfFiles = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_FILES_PER_REQUEST,
  },
}).array('files', MAX_FILES_PER_REQUEST);
