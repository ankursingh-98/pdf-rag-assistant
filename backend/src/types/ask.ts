import type { SearchResult } from './search.js';

export interface AskResult {
  question: string;
  answer: string;
  model: string;
  retrieval: SearchResult;
  generationLatencyMs: number;
  totalLatencyMs: number;
}
