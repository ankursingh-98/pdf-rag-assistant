import type { AskResult } from '../types/ask.js';

export interface IAskService {
  ask(question: string): Promise<AskResult>;
}
