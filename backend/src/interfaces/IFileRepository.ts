export interface IFileRepository {
  ensureUploadDirectory(): Promise<void>;
  readFileBuffer(filename: string): Promise<Buffer>;
  deleteFile(filename: string): Promise<void>;
}
