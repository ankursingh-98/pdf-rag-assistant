import type { SearchResult } from '../types/search.js';

export interface ISearchService {
  search(question: string): Promise<SearchResult>;
}
