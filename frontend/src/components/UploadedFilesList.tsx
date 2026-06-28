import type { UploadedFileRecord } from '../types/api';

interface UploadedFilesListProps {
  files: UploadedFileRecord[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function UploadedFilesList({ files }: UploadedFilesListProps) {
  if (files.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Uploaded PDFs</h2>
        <p className="mt-2 text-sm text-slate-500">No documents uploaded yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-lg font-semibold text-white">Uploaded PDFs</h2>
      <div className="mt-4 space-y-3">
        {files.map((file) => (
          <article
            key={file.documentId}
            className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-slate-100">{file.filename}</h3>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {file.documentId}
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {formatBytes(file.size)}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-slate-500">Pages</dt>
                <dd className="font-medium text-white">{file.extraction.pageCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Chunks</dt>
                <dd className="font-medium text-white">{file.chunking.chunkCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Embeddings</dt>
                <dd className="font-medium text-white">
                  {file.embeddings.chunkCount} × {file.embeddings.dimensions}d
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Stored</dt>
                <dd className="font-medium text-white">
                  {file.storage.storedCount} in {file.storage.collectionName}
                </dd>
              </div>
            </dl>

            {file.chunking.chunks.length > 0 ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-indigo-300 hover:text-indigo-200">
                  View chunks ({file.chunking.chunkCount})
                </summary>
                <div className="mt-3 space-y-2">
                  {file.chunking.chunks.map((chunk) => (
                    <div
                      key={`${file.documentId}-${chunk.chunkNumber}`}
                      className="rounded-md border border-slate-800 bg-slate-900 p-3"
                    >
                      <p className="text-xs text-slate-500">
                        Chunk #{chunk.chunkNumber} · Page {chunk.page} ·{' '}
                        {chunk.characterCount} chars
                      </p>
                      <p className="mt-2 text-sm text-slate-300">{chunk.text}</p>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
