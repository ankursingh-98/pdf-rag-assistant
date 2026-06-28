import type { SearchResultItem } from '../types/search.js';

const NO_CONTEXT_ANSWER =
  'I cannot find that information in the uploaded documents.';

const SYSTEM_PROMPT = `You are a document assistant for a RAG system.

STRICT RULES:
1. Answer ONLY using the CONTEXT chunks provided by the user.
2. Do NOT use outside knowledge, assumptions, or general world facts.
3. If the CONTEXT does not contain enough information, respond EXACTLY with:
"I cannot find that information in the uploaded documents."
4. Keep answers concise and grounded in the provided text.`;

export function buildContextFromChunks(chunks: SearchResultItem[]): string {
  if (chunks.length === 0) {
    return '';
  }

  return chunks
    .map(
      (chunk, index) =>
        `[Chunk ${index + 1} | ${chunk.filename} | Page ${chunk.page} | Chunk ${chunk.chunkNumber} | Score ${chunk.score.toFixed(3)}]\n${chunk.text}`,
    )
    .join('\n\n');
}

export function buildUserPrompt(question: string, context: string): string {
  return `CONTEXT:
${context}

QUESTION:
${question}

Answer using ONLY the context above.`;
}

export function getNoContextAnswer(): string {
  return NO_CONTEXT_ANSWER;
}

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
