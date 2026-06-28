export interface TextChunk {
  chunkNumber: number;
  documentId: string;
  page: number;
  text: string;
  characterCount: number;
}

export interface ChunkingResult {
  chunkCount: number;
  chunks: TextChunk[];
}
