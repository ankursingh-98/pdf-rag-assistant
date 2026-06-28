export interface SearchResultItem {
  pointId: string;
  score: number;
  text: string;
  filename: string;
  page: number;
  chunkNumber: number;
  documentId: string;
}

export interface SearchResult {
  question: string;
  resultCount: number;
  embeddingLatencyMs: number;
  searchLatencyMs: number;
  totalLatencyMs: number;
  results: SearchResultItem[];
}
