export interface ExtractedPage {
  pageNumber: number;
  text: string;
  characterCount: number;
}

export interface PdfExtractionResult {
  pageCount: number;
  text: string;
  characterCount: number;
  pages: ExtractedPage[];
}

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

export interface EmbeddedChunk extends TextChunk {
  dimensions: number;
  embedding: number[];
}

export interface EmbeddingResult {
  model: string;
  chunkCount: number;
  dimensions: number;
  latencyMs: number;
  chunks: EmbeddedChunk[];
}

export interface StoredVectorPoint {
  pointId: string;
  chunkNumber: number;
  page: number;
}

export interface VectorStorageResult {
  collectionName: string;
  storedCount: number;
  latencyMs: number;
  points: StoredVectorPoint[];
}

export interface UploadedFileRecord {
  documentId: string;
  filename: string;
  size: number;
  mimetype: string;
  extraction: PdfExtractionResult;
  chunking: ChunkingResult;
  embeddings: EmbeddingResult;
  storage: VectorStorageResult;
}

export interface UploadResponse {
  status: 'success';
  message: string;
  files: UploadedFileRecord[];
}

export interface SearchResultItem {
  pointId: string;
  score: number;
  text: string;
  filename: string;
  page: number;
  chunkNumber: number;
  documentId: string;
}

export interface SearchResponse {
  status: 'success';
  question: string;
  resultCount: number;
  embeddingLatencyMs: number;
  searchLatencyMs: number;
  totalLatencyMs: number;
  results: SearchResultItem[];
}

export interface AskResponse {
  status: 'success';
  question: string;
  answer: string;
  model: string;
  retrieval: Omit<SearchResponse, 'status'>;
  generationLatencyMs: number;
  totalLatencyMs: number;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
}
