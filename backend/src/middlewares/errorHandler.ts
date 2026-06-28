import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { config } from '../config/index.js';
import { AppError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

function normalizeError(err: Error): AppError {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new AppError(
        400,
        `File too large. Maximum allowed size is ${config.MAX_FILE_SIZE_MB}MB.`,
      );
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return new AppError(400, 'Too many files. Maximum 10 PDFs per request.');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return new AppError(
        400,
        'Unexpected field name. Use "files" for PDF uploads.',
      );
    }

    return new AppError(400, err.message);
  }

  return new AppError(500, 'Internal server error', false);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const appError = normalizeError(err);
  const { statusCode, message, isOperational } = appError;

  if (statusCode >= 500) {
    logger.error(message, { stack: err.stack });
  } else {
    logger.warn(message);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.NODE_ENV === 'development' &&
      !isOperational && { stack: err.stack }),
  });
}
