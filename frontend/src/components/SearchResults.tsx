import type { SearchResponse } from '../types/api';

interface SearchResultsProps {
  result: SearchResponse | null;
}

function ScoreBar({ score }: { score: number }) {
  const percentage = Math.max(0, Math.min(100, score * 100));

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-14 text-right font-mono text-sm text-emerald-300">
        {score.toFixed(3)}
      </span>
    </div>
  );
}

export function SearchResults({ result }: SearchResultsProps) {
  if (!result) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Retrieved Chunks</h2>
        <p className="mt-2 text-sm text-slate-500">
          Run a search to see similarity scores and retrieved text.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Retrieved Chunks</h2>
          <p className="mt-1 text-sm text-slate-400">
            Question: <span className="text-slate-200">"{result.question}"</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
            Embed: {result.embeddingLatencyMs}ms
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
            Search: {result.searchLatencyMs}ms
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
            Total: {result.totalLatencyMs}ms
          </span>
        </div>
      </div>

      {result.results.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No matching chunks found.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {result.results.map((item, index) => (
            <article
              key={item.pointId}
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-white">
                  Result #{index + 1}
                </h3>
                <p className="text-xs text-slate-500">
                  {item.filename} · Page {item.page} · Chunk {item.chunkNumber}
                </p>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                  Cosine similarity
                </p>
                <ScoreBar score={item.score} />
              </div>

              <p className="mt-4 rounded-md border border-slate-800 bg-slate-900 p-3 text-sm leading-relaxed text-slate-300">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
