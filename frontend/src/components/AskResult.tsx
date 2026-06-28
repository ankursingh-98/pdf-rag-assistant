import type { AskResponse } from '../types/api';
import { SearchResults } from './SearchResults';

interface AskResultProps {
  result: AskResponse | null;
}

export function AskResult({ result }: AskResultProps) {
  if (!result) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">LLM Answer</h2>
        <p className="mt-2 text-sm text-slate-500">
          Ask a question to get an answer grounded in retrieved chunks only.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-indigo-500/30 bg-slate-900/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">LLM Answer</h2>
            <p className="mt-1 text-sm text-slate-400">
              Model: <span className="text-slate-200">{result.model}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
              Generate: {result.generationLatencyMs}ms
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
              Total: {result.totalLatencyMs}ms
            </span>
          </div>
        </div>

        <p className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200">
          {result.answer}
        </p>

        <p className="mt-3 text-xs text-slate-500">
          Answered using {result.retrieval.resultCount} retrieved chunk(s) as
          context only — no outside knowledge.
        </p>
      </section>

      <SearchResults
        result={{
          status: 'success',
          ...result.retrieval,
        }}
      />
    </div>
  );
}
