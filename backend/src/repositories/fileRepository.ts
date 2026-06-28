import { mkdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { IFileRepository } from '../interfaces/IFileRepository.js';
import { resolveUploadDir } from '../utils/paths.js';

export class FileRepository implements IFileRepository {
  async ensureUploadDirectory(): Promise<void> {
    await mkdir(resolveUploadDir(), { recursive: true });
  }

  async readFileBuffer(filename: string): Promise<Buffer> {
    const filePath = path.join(resolveUploadDir(), filename);
    return readFile(filePath);
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(resolveUploadDir(), filename);
    await unlink(filePath);
  }
}

export const fileRepository = new FileRepository();
