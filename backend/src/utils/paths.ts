import path from 'node:path';
import { config } from '../config/index.js';

export function resolveUploadDir(): string {
  return path.isAbsolute(config.UPLOAD_DIR)
    ? config.UPLOAD_DIR
    : path.resolve(process.cwd(), config.UPLOAD_DIR);
}
