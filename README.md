# PDF RAG Assistant

A **learning-focused Mini RAG application** for understanding retrieval before adding an LLM.

Upload PDFs → extract text → chunk → embed locally (Ollama) → store in Qdrant → search semantically.

> **Phase 1 goal:** Master retrieval. No LLM integration until Phase 10.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Embeddings | Ollama (`nomic-embed-text`) |
| Vector DB | Qdrant (Docker) |
| PDF parsing | `pdf-parse` |
| Validation | Zod |
| HTTP client | Axios |
| Logging | Winston |

---

## Project Structure

```
pdf-rag-assistant/
├── backend/
│   └── src/
│       ├── controllers/    # HTTP layer — parse requests, send responses
│       ├── routes/         # Express route definitions
│       ├── services/       # Business logic (chunking, embedding, search)
│       ├── repositories/   # Data access (Qdrant, file system)
│       ├── middlewares/    # Cross-cutting concerns (errors, validation)
│       ├── config/         # Environment & app configuration
│       ├── interfaces/     # Contracts between layers
│       ├── types/          # Shared TypeScript types
│       └── utils/          # Pure helpers (no side effects)
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI pieces
│       ├── pages/          # Route-level views
│       ├── hooks/          # React hooks (state, API calls)
│       ├── services/       # Axios API client
│       └── types/          # Frontend TypeScript types
├── docker-compose.yml      # Qdrant only
└── README.md
```

---

## Architecture (Clean Architecture)

We separate **what the app does** from **how it talks to the outside world**.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Pages → Components → Hooks → Services (HTTP)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                     BACKEND (Express)                        │
│                                                              │
│  Routes → Controllers → Services → Repositories              │
│                │            │            │                   │
│           Middlewares    Business     External I/O           │
│                          Logic        (Qdrant, Ollama, FS)   │
└─────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

| Layer | Responsibility | Example (later phases) |
|-------|----------------|------------------------|
| **Routes** | Map URLs to controller methods | `POST /upload` → `uploadController.handle` |
| **Controllers** | HTTP in/out only — no business logic | Validate body shape, call service, return JSON |
| **Services** | Core business rules | Split text into chunks, orchestrate embed + store |
| **Repositories** | Persistence & external APIs | Qdrant upsert/search, read PDF from disk |
| **Middlewares** | Request pipeline | Error handler, request logging |
| **Config** | Centralized settings | Read `.env`, export typed config object |
| **Interfaces** | Contracts for DI & testing | `IEmbeddingService`, `IVectorRepository` |

### Data flow (retrieval pipeline — built across Phases 3–8)

```
PDF Upload → Extract Text → Chunk → Embed → Store in Qdrant
                                              ↓
User Question → Embed Question → Vector Search → Top-K Chunks
```

### Why Clean Architecture here?

1. **Testability** — Services can be unit-tested without HTTP or Qdrant.
2. **Swapability** — Change Qdrant to another vector DB by replacing only the repository.
3. **Clarity** — Each file has one job; easier to learn one concept at a time.
4. **Production habit** — Real RAG systems grow fast; structure prevents spaghetti.

---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Ollama (installed in Phase 6)

---

## Getting Started (after dependencies are installed)

### 1. Start Qdrant

```bash
docker compose up -d
```

Qdrant REST API: `http://localhost:6333`  
Dashboard: `http://localhost:6333/dashboard`

### 2. Backend (Phase 2+)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend (Phase 9+)

```bash
cd frontend
npm install
npm run dev
```

---

## Learning Phases

> **Full step-by-step guide:** See [STEPS.md](./STEPS.md) for every phase, verification steps, and how to run the project.

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Project scaffold & architecture | ✅ Complete |
| 2 | Express server, config, logging, errors | ✅ Complete |
| 3 | PDF upload API | ✅ Complete |
| 4 | Text extraction (`pdf-parse`) | ✅ Complete |
| 5 | Chunking (800 / 150 overlap) | ✅ Complete |
| 6 | Ollama embeddings (`nomic-embed-text`) | ✅ Complete |
| 7 | Qdrant collection & storage | ✅ Complete |
| 8 | Semantic search (`POST /search`) | ✅ Complete |
| 9 | Developer dashboard | ✅ Complete |
| 10 | LLM integration (retrieval-only context) | ✅ Complete |

---

## Environment Variables

See `backend/.env.example` for all configuration keys. Copy to `backend/.env` before running the backend.

---

## License

MIT
