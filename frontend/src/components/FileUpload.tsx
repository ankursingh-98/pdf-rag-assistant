import { useRef } from 'react';

interface FileUploadProps {
  isUploading: boolean;
  onUpload: (files: FileList | File[]) => void;
}

export function FileUpload({ isUploading, onUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Upload PDFs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Extract → Chunk → Embed → Store in Qdrant
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              onUpload(event.target.files);
              event.target.value = '';
            }
          }}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Processing...' : 'Select PDF files'}
        </button>
      </div>
    </section>
  );
}
