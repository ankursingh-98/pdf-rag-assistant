import { llmService } from './llmService.js';
import { searchService } from './searchService.js';
import type { IAskService } from '../interfaces/IAskService.js';
import type { ILlmService } from '../interfaces/ILlmService.js';
import type { ISearchService } from '../interfaces/ISearchService.js';
import { config } from '../config/index.js';
import type { AskResult } from '../types/ask.js';
import {
  buildContextFromChunks,
  getNoContextAnswer,
} from '../utils/ragPrompt.js';
import { logger } from '../utils/logger.js';

export class AskService implements IAskService {
  constructor(
    private readonly search: ISearchService = searchService,
    private readonly llm: ILlmService = llmService,
  ) {}

  async ask(question: string): Promise<AskResult> {
    const totalStart = Date.now();
    const retrieval = await this.search.search(question);

    if (retrieval.results.length === 0) {
      logger.info(`Ask skipped LLM — no retrieved chunks for: "${question}"`);

      return {
        question,
        answer: getNoContextAnswer(),
        model: config.OLLAMA_CHAT_MODEL,
        retrieval,
        generationLatencyMs: 0,
        totalLatencyMs: Date.now() - totalStart,
      };
    }

    const context = buildContextFromChunks(retrieval.results);
    const { answer, latencyMs } = await this.llm.generateAnswer(
      question,
      context,
    );

    logger.info(`Ask completed: "${question}"`);

    return {
      question,
      answer,
      model: config.OLLAMA_CHAT_MODEL,
      retrieval,
      generationLatencyMs: latencyMs,
      totalLatencyMs: Date.now() - totalStart,
    };
  }
}

export const askService = new AskService();
