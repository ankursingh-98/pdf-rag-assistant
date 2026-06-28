import { StatCard } from './StatCard';

interface StatsGridProps {
  fileCount: number;
  totalPages: number;
  totalChunks: number;
  totalEmbeddings: number;
  totalStored: number;
  embeddingLatencyMs?: number;
  searchLatencyMs?: number;
}

export function StatsGrid({
  fileCount,
  totalPages,
  totalChunks,
  totalEmbeddings,
  totalStored,
  embeddingLatencyMs,
  searchLatencyMs,
}: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Uploaded PDFs" value={fileCount} hint="Documents in session" />
      <StatCard label="Total Pages" value={totalPages} hint="Extracted pages" />
      <StatCard label="Chunks" value={totalChunks} hint="800 chars, 150 overlap" />
      <StatCard
        label="Embeddings"
        value={totalEmbeddings}
        hint={`${totalStored} stored in Qdrant`}
      />
      {embeddingLatencyMs !== undefined ? (
        <StatCard
          label="Embedding Latency"
          value={`${embeddingLatencyMs}ms`}
          hint="Last search query"
        />
      ) : null}
      {searchLatencyMs !== undefined ? (
        <StatCard
          label="Search Latency"
          value={`${searchLatencyMs}ms`}
          hint="Qdrant vector search"
        />
      ) : null}
    </div>
  );
}
