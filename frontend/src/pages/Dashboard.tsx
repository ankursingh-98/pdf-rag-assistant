import { AskPanel } from '../components/AskPanel';
import { AskResult } from '../components/AskResult';
import { FileUpload } from '../components/FileUpload';
import { SearchPanel } from '../components/SearchPanel';
import { SearchResults } from '../components/SearchResults';
import { StatsGrid } from '../components/StatsGrid';
import { UploadedFilesList } from '../components/UploadedFilesList';
import { useDashboard } from '../hooks/useDashboard';

export function Dashboard() {
  const {
    uploadedFiles,
    searchResult,
    askResult,
    stats,
    isUploading,
    isSearching,
    isAsking,
    error,
    uploadFiles,
    search,
    ask,
    clearError,
  } = useDashboard();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
            Phase 10 · Full RAG
          </p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            PDF RAG Learning Console
          </h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Complete RAG pipeline — upload PDFs, retrieve relevant chunks, and
            get LLM answers grounded only in your documents.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {error ? (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 text-red-300 hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <StatsGrid
          fileCount={stats.fileCount}
          totalPages={stats.totalPages}
          totalChunks={stats.totalChunks}
          totalEmbeddings={stats.totalEmbeddings}
          totalStored={stats.totalStored}
          embeddingLatencyMs={searchResult?.embeddingLatencyMs}
          searchLatencyMs={searchResult?.searchLatencyMs}
        />

        <FileUpload isUploading={isUploading} onUpload={uploadFiles} />

        <AskPanel isAsking={isAsking} onAsk={ask} />
        <AskResult result={askResult} />

        <div className="grid gap-6 lg:grid-cols-2">
          <UploadedFilesList files={uploadedFiles} />
          <div className="space-y-6">
            <SearchPanel isSearching={isSearching} onSearch={search} />
            <SearchResults result={searchResult} />
          </div>
        </div>
      </main>
    </div>
  );
}
