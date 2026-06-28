export interface ILlmService {
  generateAnswer(question: string, context: string): Promise<{
    answer: string;
    latencyMs: number;
  }>;
}
