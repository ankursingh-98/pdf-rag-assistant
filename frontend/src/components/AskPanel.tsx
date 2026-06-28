import { FormEvent, useState } from 'react';

interface AskPanelProps {
  isAsking: boolean;
  onAsk: (question: string) => void;
}

export function AskPanel({ isAsking, onAsk }: AskPanelProps) {
  const [question, setQuestion] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAsk(question);
  }

  return (
    <section className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
      <h2 className="text-lg font-semibold text-white">RAG Q&A (LLM)</h2>
      <p className="mt-1 text-sm text-slate-400">
        Retrieve chunks → send only context to Ollama → grounded answer
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a question — answered only from your PDFs..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none ring-indigo-500 placeholder:text-slate-600 focus:ring-2"
        />
        <button
          type="submit"
          disabled={isAsking}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAsking ? 'Thinking...' : 'Ask'}
        </button>
      </form>
    </section>
  );
}
