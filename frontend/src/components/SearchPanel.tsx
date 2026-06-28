import { FormEvent, useState } from 'react';

interface SearchPanelProps {
  isSearching: boolean;
  onSearch: (question: string) => void;
}

export function SearchPanel({ isSearching, onSearch }: SearchPanelProps) {
  const [question, setQuestion] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(question);
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-lg font-semibold text-white">Semantic Search</h2>
      <p className="mt-1 text-sm text-slate-400">
        Embed question → search Qdrant → top 5 chunks
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a question about your uploaded PDFs..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none ring-indigo-500 placeholder:text-slate-600 focus:ring-2"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
    </section>
  );
}
