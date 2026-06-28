# Mini RAG Learning Guide — Step by Step

This document tracks **every phase** of building the PDF RAG Assistant.  
Work through one step at a time. Verify each step before moving on.

> **Phase 1 goal:** Master retrieval. No LLM until Phase 10.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [How to Run the Project](#how-to-run-the-project)
3. [Phase 1 — Project Scaffold](#phase-1--project-scaffold) ✅
4. [Phase 2 — Express Server](#phase-2--express-server) ✅
5. [Phase 3 — PDF Upload API](#phase-3--pdf-upload-api) ✅
6. [Phase 4 — Text Extraction](#phase-4--text-extraction) ✅
7. [Phase 5 — Chunking](#phase-5--chunking) ✅
8. [Phase 6 — Ollama Embeddings](#phase-6--ollama-embeddings) ✅
9. [Phase 7 — Qdrant Storage](#phase-7--qdrant-storage) ✅
10. [Phase 8 — Semantic Search](#phase-8--semantic-search) ✅
11. [Phase 9 — Developer Dashboard](#phase-9--developer-dashboard) ✅
12. [Phase 10 — LLM Integration](#phase-10--llm-integration) ✅

---

## Prerequisites

Install these before starting:

| Tool | Version | Used from |
|------|---------|-----------|
| Node.js | 20+ | Phase 1 (install deps) |
| npm | 9+ | Phase 1 |
| Docker & Docker Compose | Latest | Phase 1 (Qdrant), Phase 7+ |
| Ollama | Latest | Phase 6+ |
| curl | Any | Testing APIs |

---

## How to Run the Project

### Full stack (after Phase 9 is complete)

Open **three terminals** from the project root:

**Terminal 1 — Qdrant (vector database)**

```bash
cd /path/to/pdf-rag-assistant
docker compose up -d
```

**Terminal 2 — Ollama (embeddings, Phase 6+)**

```bash
ollama serve
# In another shell, pull the model once:
ollama pull nomic-embed-text
```

**Terminal 3 — Backend API**

```bash
cd backend
cp .env.example .env   # first time only
npm install            # first time only
npm run dev
```

Backend runs at: `http://localhost:3001`

**Terminal 4 — Frontend dashboard (Phase 9+)**

```bash
cd frontend
npm install            # first time only
npm run dev
```

Frontend runs at: `http://localhost:5173` (default Vite port)

---

### What you can run at each phase

| Phase | Qdrant | Ollama | Backend | Frontend | What works |
|-------|--------|--------|---------|----------|------------|
| 1 | ✅ Optional | — | — | — | Folder structure, Docker Compose |
| 2 | Optional | — | ✅ | — | `GET /health` |
| 3 | — | — | ✅ | — | `POST /upload` (save PDFs) |
| 4 | — | — | ✅ | — | Upload + extract text |
| 5 | — | — | ✅ | — | Upload + extract + chunk |
| 6 | ✅ | ✅ | ✅ | — | Upload + embed chunks |
| 7 | ✅ | ✅ | ✅ | — | Store vectors in Qdrant |
| 8 | ✅ | ✅ | ✅ | — | `POST /search` |
| 9 | ✅ | ✅ | ✅ | ✅ | Developer dashboard |
| 10 | ✅ | ✅ | ✅ | ✅ | RAG with LLM |

---

### Stop everything

```bash
# Stop Qdrant
docker compose down

# Stop backend / frontend: Ctrl+C in each terminal

# Stop Ollama: Ctrl+C in ollama serve terminal
```

---

### Useful URLs

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:3001` |
| Backend health | `http://localhost:3001/health` |
| Backend search | `http://localhost:3001/search` |
| Backend ask (RAG) | `http://localhost:3001/ask` |
| Qdrant REST API | `http://localhost:6333` |
| Qdrant dashboard | `http://localhost:6333/dashboard` |
| Ollama API | `http://localhost:11434` |
| Frontend (Vite) | `http://localhost:5173` |

---

## Phase 1 — Project Scaffold ✅

**Status:** Complete

### What we built

- Clean Architecture folder structure (`backend/src/`, `frontend/src/`)
- `package.json` and `tsconfig.json` for backend and frontend
- `docker-compose.yml` for Qdrant only
- `backend/.env.example` for all environment variables
- `.gitignore`
- `README.md` with architecture overview

### Why we built it

- **Folders first** — Each layer has one job (routes, controllers, services, repositories).
- **Dependencies declared early** — Documents the full tech stack before writing code.
- **Docker for Qdrant** — Vector DB runs consistently on any machine.
- **No app code yet** — Learn structure before behavior.

### How it works internally

```
Routes → Controllers → Services → Repositories → External APIs
```

Dependencies point **inward**. Controllers never talk to Qdrant directly — only repositories do.

### How to run (Phase 1 only)

```bash
cd /path/to/pdf-rag-assistant

# Optional: start Qdrant to verify Docker works
docker compose up -d
curl http://localhost:6333/healthz
# Expected: healthz check passed

# Optional: verify dependencies install
cd backend && npm install
cd ../frontend && npm install
```

> `npm run dev` will **not** work yet — no server code until Phase 2.

### How to verify Phase 1

```bash
# 1. Check folder structure
ls backend/src/
# Expected: config controllers interfaces middlewares repositories routes services types utils

ls frontend/src/
# Expected: components hooks pages services types

# 2. Check config files exist
test -f docker-compose.yml && \
test -f backend/package.json && \
test -f backend/tsconfig.json && \
test -f frontend/package.json && \
echo "Phase 1 structure: OK"

# 3. Check Qdrant (optional)
docker compose ps
curl http://localhost:6333/healthz
```

### Git branch

`cursor/phase-1-project-scaffold`

---

## Phase 2 — Express Server ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `src/index.ts` | Entry point — starts HTTP server, graceful shutdown |
| `src/app.ts` | Express app factory — wires middleware and routes |
| `src/config/env.ts` | Zod-validated environment variables |
| `src/config/index.ts` | Exported `config` singleton |
| `src/utils/logger.ts` | Winston console logger |
| `src/utils/asyncHandler.ts` | Wraps async routes for error middleware (Phase 3+) |
| `src/types/errors.ts` | `AppError` — operational HTTP errors |
| `src/controllers/healthController.ts` | `GET /health` logic |
| `src/routes/healthRoutes.ts` | Health route definition |
| `src/routes/index.ts` | Aggregates all API routes |
| `src/middlewares/requestLogger.ts` | Logs method, URL, status, duration |
| `src/middlewares/notFoundHandler.ts` | 404 → `AppError` |
| `src/middlewares/errorHandler.ts` | Global JSON error responses |

### Why we built it

Before PDF or search logic, we need a **reliable HTTP foundation**:

- **Config** — one typed source of truth for all settings
- **Logging** — see every request and error in development
- **Error handling** — consistent JSON errors instead of crashes
- **Health check** — confirm the server is alive (used by Docker/K8s in production)

### How it works internally

```
HTTP Request
    ↓
cors + express.json()
    ↓
requestLogger (starts timer)
    ↓
Route → Controller → JSON response
    ↓
requestLogger (logs on res.finish)
```

If no route matches:

```
notFoundHandler → AppError(404) → errorHandler → JSON error
```

If any error is thrown:

```
errorHandler → log + JSON { status: "error", message: "..." }
```

**Zod config loading:** On startup, `loadEnvConfig()` reads `process.env`, validates types (PORT must be a number, URLs must be valid), and **exits immediately** if `.env` is invalid. Fail fast at boot — not on first request.

### How to run (Phase 2)

```bash
cd backend
cp .env.example .env    # first time only
npm install             # first time only
npm run dev
```

### How to verify Phase 2

```bash
# Health check
curl http://localhost:3001/health
# Expected:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "uptime": ...,
#   "environment": "development"
# }

# 404 handling
curl http://localhost:3001/unknown
# Expected:
# { "status": "error", "message": "Route not found: GET /unknown" }
```

Check the terminal running `npm run dev` — you should see Winston logs like:

```
2026-06-28 16:07:55 [info]: Server running on http://localhost:3001
2026-06-28 16:07:55 [info]: GET /health 200 - 2ms
```

### Files created

```
backend/src/
├── index.ts
├── app.ts
├── config/
│   ├── env.ts
│   └── index.ts
├── controllers/
│   └── healthController.ts
├── routes/
│   ├── healthRoutes.ts
│   └── index.ts
├── middlewares/
│   ├── errorHandler.ts
│   ├── notFoundHandler.ts
│   └── requestLogger.ts
├── interfaces/
│   └── IHealthController.ts
├── types/
│   └── errors.ts
└── utils/
    ├── logger.ts
    └── asyncHandler.ts
```

---

## Phase 3 — PDF Upload API ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `middlewares/uploadMiddleware.ts` | Multer config — disk storage, PDF filter, size limits |
| `controllers/uploadController.ts` | Handles `POST /upload`, returns JSON |
| `services/uploadService.ts` | Validates uploaded files, maps metadata |
| `repositories/fileRepository.ts` | Creates upload dir, deletes invalid files |
| `routes/uploadRoutes.ts` | `POST /upload` route |
| `types/upload.ts` | `UploadedFileRecord`, `UploadResult` types |

### Why we built it

RAG starts with **documents**. Upload is the entry point of the entire pipeline. Before extraction or embedding, we need a safe way to accept PDFs from the client and store them temporarily on disk.

### How multipart upload works internally

When you upload a file, the HTTP request uses `Content-Type: multipart/form-data` instead of JSON.

```
Browser / curl
    ↓
HTTP body split into "parts" by boundary string
    ↓
Multer parses the stream
    ↓
Each file part → written to disk (backend/tmp/uploads/)
    ↓
req.files[] → Controller → Service → JSON response
```

**Key concepts:**

| Concept | Explanation |
|---------|-------------|
| `multipart/form-data` | HTTP format for sending files + fields in one request |
| **Boundary** | A separator string between parts in the body |
| **Field name** | Must be `files` (matches `upload.array('files')`) |
| **Multer** | Express middleware that parses multipart streams |
| **diskStorage** | Saves files to `UPLOAD_DIR` instead of RAM |

**Validation layers:**

1. **Multer `fileFilter`** — rejects non-PDF before saving
2. **Multer `limits`** — max 20MB per file, max 10 files per request
3. **UploadService** — double-checks mimetype/extension; deletes file if invalid

**Stored filename:** `{documentId}.pdf` (UUID) — the `documentId` is reused in Phase 4+ to find the file.

### How to run (Phase 3)

```bash
cd backend
npm run dev
```

**Terminal 2:**

```bash
# Single PDF
curl -X POST http://localhost:3001/upload \
  -F "files=@/path/to/document.pdf"

# Multiple PDFs
curl -X POST http://localhost:3001/upload \
  -F "files=@/path/to/doc1.pdf" \
  -F "files=@/path/to/doc2.pdf"
```

Use the included test file:

```bash
curl -X POST http://localhost:3001/upload \
  -F "files=@backend/test-fixtures/sample.pdf"
```

### How to verify Phase 3

```bash
# Success — expect 201
curl -X POST http://localhost:3001/upload \
  -F "files=@backend/test-fixtures/sample.pdf"

# Expected response:
# {
#   "status": "success",
#   "message": "1 file(s) uploaded successfully",
#   "files": [{
#     "documentId": "uuid-here",
#     "filename": "sample.pdf",
#     "size": 317,
#     "mimetype": "application/pdf"
#   }]
# }

# No files — expect 400
curl -X POST http://localhost:3001/upload

# Wrong type — expect 400
curl -X POST http://localhost:3001/upload \
  -F "files=@/path/to/image.png"
```

**Check disk:** uploaded files appear in `backend/tmp/uploads/` as `{documentId}.pdf`.

### Files created

```
backend/src/
├── controllers/uploadController.ts
├── middlewares/uploadMiddleware.ts
├── repositories/fileRepository.ts
├── routes/uploadRoutes.ts
├── services/uploadService.ts
├── interfaces/IUploadService.ts
├── interfaces/IFileRepository.ts
├── types/upload.ts
└── utils/paths.ts

backend/test-fixtures/sample.pdf   # test PDF for curl
```

---

## Phase 4 — Text Extraction ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `services/pdfExtractionService.ts` | Reads PDF from disk, extracts text with `pdf-parse` |
| `interfaces/IPdfExtractionService.ts` | Contract for extraction service |
| `types/upload.ts` | Added `PdfExtractionResult`, `ExtractedPage` |
| `repositories/fileRepository.ts` | Added `readFileBuffer()` |
| `services/uploadService.ts` | Orchestrates upload → extraction |

Upload response now includes an `extraction` object per file.

### Why we built it

PDFs are **binary files**, not plain text. Before chunking or embedding, we must extract readable text. This is the second step in the RAG pipeline:

```
Upload → Extract Text → Chunk → Embed → Store → Search
              ↑ Phase 4
```

### How PDF parsing works internally

```
PDF file on disk
    ↓
readFileBuffer() → Buffer (raw bytes)
    ↓
pdf-parse uses Mozilla PDF.js under the hood
    ↓
PDF.js parses PDF object tree (pages, fonts, streams)
    ↓
For each page: getTextContent() → text items with positions
    ↓
Text items joined into page text → full document text
```

**Important limitations:**

| Case | Result |
|------|--------|
| Text-based PDF (Word export, etc.) | Text extracted successfully |
| Scanned/image PDF | Empty or near-empty text (no OCR) |
| Corrupted PDF | `400` error — file deleted |

`pdf-parse` does **not** use OCR. It only reads embedded text streams.

### Response shape

```json
{
  "status": "success",
  "message": "1 file(s) uploaded and processed successfully",
  "files": [{
    "documentId": "uuid",
    "filename": "sample.pdf",
    "size": 13264,
    "mimetype": "application/pdf",
    "extraction": {
      "pageCount": 1,
      "text": "Dummy PDF file",
      "characterCount": 14,
      "pages": [{
        "pageNumber": 1,
        "text": "Dummy PDF file",
        "characterCount": 14
      }]
    }
  }]
}
```

### How to run (Phase 4)

```bash
cd backend
npm run dev
```

```bash
curl -X POST http://localhost:3001/upload \
  -F "files=@test-fixtures/sample.pdf"
```

### How to verify Phase 4

1. Upload a text-based PDF (not a scanned image).
2. Confirm `extraction.text` contains readable content.
3. Confirm `extraction.pages` has one entry per page.
4. Confirm `extraction.pageCount` matches the PDF page count.

**Test file included:** `backend/test-fixtures/sample.pdf` (W3C dummy PDF with text `"Dummy PDF file"`).

### Files created / updated

```
backend/src/
├── services/pdfExtractionService.ts   (new)
├── interfaces/IPdfExtractionService.ts (new)
├── services/uploadService.ts          (updated)
├── repositories/fileRepository.ts     (updated)
└── types/upload.ts                    (updated)
```

---

## Phase 5 — Chunking ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `utils/textChunker.ts` | Pure sliding-window split function |
| `services/chunkingService.ts` | Page-aware chunking orchestration |
| `types/chunk.ts` | `TextChunk`, `ChunkingResult` types |
| `interfaces/IChunkingService.ts` | Chunking contract |
| `services/uploadService.ts` | Runs chunking after extraction |

**Config (from `.env`):**

| Variable | Default | Meaning |
|----------|---------|---------|
| `CHUNK_SIZE` | `800` | Max characters per chunk |
| `CHUNK_OVERLAP` | `150` | Characters repeated between consecutive chunks |

### Why chunking is necessary

Embedding models have a **context limit**. A 50-page PDF might be 200,000+ characters — far too large for a single vector. Chunking splits the document into small, searchable pieces so retrieval returns only **relevant passages**.

### Why overlap matters

Without overlap, a sentence split across two chunks can lose meaning at the boundary.

**Example (chunk size 800, overlap 150):**

```
Chunk 1: "...the contract expires on December"
Chunk 2: "December 31, 2025. Renewal requires..."
         ^^^^^^^^ 150 chars overlap — "December" stays connected to the date
```

**How the sliding window works:**

```
Step size = CHUNK_SIZE - CHUNK_OVERLAP = 800 - 150 = 650

Text:  [0────────800][650────────1450][1300───────...]
                    ↑ overlap region ↑
```

### How it works internally

```
extraction.pages[]
    ↓
For each page → splitTextWithOverlap(page.text, 800, 150)
    ↓
Assign chunkNumber (global), page, documentId
    ↓
Return chunking.chunks[]
```

Chunking is **page-aware** — each chunk keeps its source `page` number for Qdrant payload in Phase 7.

### Response shape

```json
{
  "files": [{
    "documentId": "uuid",
    "filename": "sample.pdf",
    "extraction": { ... },
    "chunking": {
      "chunkCount": 1,
      "chunks": [{
        "chunkNumber": 1,
        "documentId": "uuid",
        "page": 1,
        "text": "Dummy PDF file",
        "characterCount": 14
      }]
    }
  }]
}
```

### How to run (Phase 5)

```bash
cd backend
npm run dev
```

```bash
curl -X POST http://localhost:3001/upload \
  -F "files=@test-fixtures/sample.pdf"
```

Look for the `chunking` object in the JSON response.

### How to verify Phase 5

1. Upload a PDF — confirm `chunking.chunks` is present.
2. Small PDF (14 chars) → `chunkCount: 1`.
3. Large PDF → multiple chunks, each `characterCount` ≤ 800.
4. Consecutive chunks on the same page share 150 characters of overlap.

### Files created

```
backend/src/
├── utils/textChunker.ts
├── services/chunkingService.ts
├── interfaces/IChunkingService.ts
└── types/chunk.ts
```

---

## Phase 6 — Ollama Embeddings ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `services/embeddingService.ts` | Calls Ollama `POST /api/embeddings` per chunk |
| `interfaces/IEmbeddingService.ts` | Embedding service contract |
| `types/embedding.ts` | `EmbeddedChunk`, `EmbeddingResult` types |
| `services/uploadService.ts` | Runs embedding after chunking |

**Model:** `nomic-embed-text` (768 dimensions)

### What embeddings are

An **embedding** is a list of numbers (a **vector**) that represents the *meaning* of text in mathematical space.

```
"The cat sat on the mat"  →  [0.021, -0.134, 0.892, ..., 0.045]  (768 numbers)
"A feline rested on a rug" →  [0.019, -0.128, 0.885, ..., 0.051]  (similar vector!)
"Stock prices rose today"  →  [-0.412, 0.331, -0.102, ..., 0.287] (very different)
```

Similar meanings produce vectors that are **close together** in high-dimensional space.

### Why vectors exist

Computers cannot compare meaning directly — they only understand numbers. Embeddings convert text into numbers so we can measure **semantic similarity** with math (cosine similarity in Phase 8).

### Why embeddings capture meaning

Embedding models (like `nomic-embed-text`) are trained on billions of text pairs. They learn that words and sentences appearing in similar contexts should have similar vectors. "Cat" and "feline" end up near each other because the model saw them used interchangeably.

### How it works internally

```
chunking.chunks[]
    ↓
For each chunk.text:
    POST http://localhost:11434/api/embeddings
    { "model": "nomic-embed-text", "prompt": "chunk text..." }
    ↓
Ollama returns { "embedding": [768 floats] }
    ↓
Winston logs: dimensions + first 5 values (preview)
    ↓
Response includes full embedding vectors
```

### Install Ollama (first time on Mac)

```bash
# Install from https://ollama.com/download
# Or with Homebrew:
brew install ollama

# Start Ollama
ollama serve

# Pull the embedding model (once)
ollama pull nomic-embed-text
```

### How to run (Phase 6)

**Terminal 1 — Ollama:**

```bash
ollama serve
```

**Terminal 2 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 3 — Upload:**

```bash
curl -X POST http://localhost:3001/upload \
  -F "files=@test-fixtures/sample.pdf"
```

Watch the **backend terminal** — you'll see embedding logs like:

```
Embedded chunk 1 (page 1): 768 dimensions, preview [0.0214, -0.1342, ...]
Generated 1 embedding(s) using "nomic-embed-text" in 245ms
```

### Response shape

```json
{
  "embeddings": {
    "model": "nomic-embed-text",
    "chunkCount": 1,
    "dimensions": 768,
    "latencyMs": 245,
    "chunks": [{
      "chunkNumber": 1,
      "documentId": "uuid",
      "page": 1,
      "text": "Dummy PDF file",
      "characterCount": 14,
      "dimensions": 768,
      "embedding": [0.021, -0.134, ...]
    }]
  }
}
```

### How to verify Phase 6

```bash
# 1. Confirm Ollama is running
curl http://localhost:11434/api/tags

# 2. Confirm model is installed
ollama list | grep nomic-embed-text

# 3. Upload PDF — check embeddings in JSON + backend logs
curl -X POST http://localhost:3001/upload \
  -F "files=@test-fixtures/sample.pdf"
```

**Common errors:**

| Error | Fix |
|-------|-----|
| `Ollama is not running` | Run `ollama serve` |
| `model not found` | Run `ollama pull nomic-embed-text` |

### Files created

```
backend/src/
├── services/embeddingService.ts
├── interfaces/IEmbeddingService.ts
└── types/embedding.ts
```

---

## Phase 7 — Qdrant Storage ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `repositories/qdrantRepository.ts` | Qdrant client — create collection, upsert vectors |
| `services/vectorStorageService.ts` | Orchestrates storage after embedding |
| `interfaces/IVectorRepository.ts` | Vector DB contract |
| `types/vector.ts` | `VectorStorageResult`, payload types |
| `index.ts` | Ensures collection exists on server startup |

**Collection config:**

| Setting | Value |
|---------|-------|
| Name | `pdf_chunks` (from `.env`) |
| Dimensions | `768` (`nomic-embed-text`) |
| Distance | `Cosine` |

### Why payload is stored with vectors

Vector search returns **point IDs and similarity scores** — not human-readable text. The **payload** stores the original metadata alongside each vector so one query returns everything:

```
Search → nearest vectors → vector + payload (text, filename, page, ...)
```

Without payload, you'd need a second database lookup to get the chunk text. Storing them together is faster and simpler.

### How it works internally

```
embeddings.chunks[]
    ↓
ensureCollection(768 dimensions, Cosine)
    ↓
For each chunk:
    point = {
      id: UUID,
      vector: [768 floats],
      payload: { text, filename, page, chunkNumber, documentId }
    }
    ↓
client.upsert("pdf_chunks", { points })
    ↓
Qdrant indexes vector with HNSW for fast search (Phase 8)
```

**On server startup:**

```
index.ts → ensureCollection(768) → create if missing
```

### How to run (Phase 7)

**Terminal 1 — Qdrant:**

```bash
docker compose up -d
curl http://localhost:6333/healthz
```

**Terminal 2 — Ollama:**

```bash
ollama serve
```

**Terminal 3 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 4 — Upload:**

```bash
curl -X POST http://localhost:3001/upload \
  -F "files=@test-fixtures/sample.pdf"
```

**Verify in Qdrant dashboard:** `http://localhost:6333/dashboard`  
→ Collection `pdf_chunks` → browse points with payload.

### Response shape

```json
{
  "storage": {
    "collectionName": "pdf_chunks",
    "storedCount": 1,
    "latencyMs": 42,
    "points": [{
      "pointId": "uuid",
      "chunkNumber": 1,
      "page": 1
    }]
  }
}
```

### How to verify Phase 7

1. `docker compose ps` — Qdrant container running.
2. Backend logs: `Created Qdrant collection "pdf_chunks"` or `collection is ready`.
3. Upload PDF — `storage.storedCount` matches `chunking.chunkCount`.
4. Open Qdrant dashboard — see points with payload fields.

**Common errors:**

| Error | Fix |
|-------|-----|
| `Qdrant is not running` | `docker compose up -d` |
| Dimension mismatch | Delete collection in dashboard or `docker compose down -v` and re-upload |

### Files created

```
backend/src/
├── repositories/qdrantRepository.ts
├── services/vectorStorageService.ts
├── interfaces/IVectorRepository.ts
└── types/vector.ts
```

---

## Phase 8 — Semantic Search ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `routes/searchRoutes.ts` | `POST /search` |
| `controllers/searchController.ts` | Validates body, returns results |
| `services/searchService.ts` | Embed question → search Qdrant → top 5 |
| `validators/searchValidator.ts` | Zod schema for `{ question }` |
| `types/search.ts` | `SearchResult`, `SearchResultItem` |
| `repositories/qdrantRepository.ts` | Added `searchSimilar()` |

### Workflow

```
POST /search { "question": "..." }
    ↓
Zod validates question (non-empty string)
    ↓
Ollama embeds question → query vector [768 floats]
    ↓
Qdrant search: find 5 nearest vectors (Cosine similarity)
    ↓
Return chunks with scores + payload metadata
```

### Key concepts

| Concept | Explanation |
|---------|-------------|
| **Cosine similarity** | Measures the angle between two vectors. Score `1.0` = identical meaning direction; `0` = unrelated. |
| **Vector search** | Find stored chunk vectors closest to the question vector in 768-dimensional space. |
| **Nearest Neighbor Search (top-K)** | Return the **5** closest matches (`TOP_K = 5`). |
| **How Qdrant finds results** | Uses an **HNSW index** (graph-based) to avoid comparing every vector — fast approximate nearest neighbor search. |

### How to run (Phase 8)

**Prerequisites:** Upload at least one PDF first (Phases 3–7).

```bash
# Terminal 1: Qdrant
docker compose up -d

# Terminal 2: Ollama
ollama serve

# Terminal 3: Backend
cd backend && npm run dev
```

**Search:**

```bash
curl -X POST http://localhost:3001/search \
  -H "Content-Type: application/json" \
  -d '{"question": "What does the dummy PDF say?"}'
```

### Response shape

```json
{
  "status": "success",
  "question": "What does the dummy PDF say?",
  "resultCount": 1,
  "embeddingLatencyMs": 180,
  "searchLatencyMs": 12,
  "totalLatencyMs": 195,
  "results": [{
    "pointId": "uuid",
    "score": 0.89,
    "text": "Dummy PDF file",
    "filename": "sample.pdf",
    "page": 1,
    "chunkNumber": 1,
    "documentId": "uuid"
  }]
}
```

### How to verify Phase 8

1. Upload a PDF first.
2. Search with a question related to the PDF content.
3. Confirm `results[0].text` contains relevant chunk text.
4. Confirm `score` is a number between 0 and 1 (higher = more similar).
5. Check backend logs for embed/search latency.

**Test with sample PDF:**

```bash
curl -X POST http://localhost:3001/search \
  -H "Content-Type: application/json" \
  -d '{"question": "dummy pdf file"}'
```

Expected: result text `"Dummy PDF file"` with high score.

### Files created

```
backend/src/
├── routes/searchRoutes.ts
├── controllers/searchController.ts
├── services/searchService.ts
├── validators/searchValidator.ts
├── interfaces/ISearchService.ts
└── types/search.ts
```

---

## Phase 9 — Developer Dashboard ✅

**Status:** Complete

### What we built

| File / Folder | Purpose |
|---------------|---------|
| `pages/Dashboard.tsx` | Main learning console layout |
| `hooks/useDashboard.ts` | Upload + search state management |
| `services/api.ts` | Axios client for `/upload` and `/search` |
| `types/api.ts` | TypeScript types matching backend API |
| `components/StatsGrid.tsx` | PDF, chunk, embedding counts + latencies |
| `components/FileUpload.tsx` | Multi-PDF upload |
| `components/UploadedFilesList.tsx` | Per-file pipeline stats + chunk preview |
| `components/SearchPanel.tsx` | Question input |
| `components/SearchResults.tsx` | Retrieved chunks, scores, latencies |
| `vite.config.ts` | Vite + React + path aliases |
| `tailwind.config.js` | TailwindCSS styling |

### Dashboard shows

| Section | Data |
|---------|------|
| **Stats grid** | Uploaded PDFs, pages, chunks, embeddings, Qdrant stored count |
| **Upload** | Multi-PDF upload through full pipeline |
| **Uploaded PDFs** | Filename, documentId, pages, chunks, embeddings, storage |
| **Chunk preview** | Expandable list of chunk text per document |
| **Search** | Semantic search with question input |
| **Results** | Cosine similarity score bar, retrieved text, filename, page, chunk # |
| **Latency** | Embedding latency, search latency, total latency |

### Why

A visual dashboard lets you **see RAG internals** — not just JSON in a terminal. You can watch chunks being created, embeddings counted, and similarity scores for retrieved text.

### How to run (Phase 9 — full stack)

**Terminal 1 — Qdrant:**

```bash
docker compose up -d
```

**Terminal 2 — Ollama:**

```bash
ollama serve
```

**Terminal 3 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 4 — Frontend:**

```bash
cd frontend
cp .env.example .env    # first time only
npm install             # first time only
npm run dev
```

Open **http://localhost:5173**

### How to verify Phase 9

1. Open dashboard in browser.
2. Upload a PDF — stats update, file appears in list.
3. Expand chunks — see chunk text and metadata.
4. Search with a related question — see results with similarity bars.
5. Confirm embedding and search latency badges appear.

### Frontend env

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3001
```

### Files created

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.tsx
    ├── pages/Dashboard.tsx
    ├── hooks/useDashboard.ts
    ├── services/api.ts
    ├── types/api.ts
    └── components/
        ├── StatCard.tsx
        ├── StatsGrid.tsx
        ├── FileUpload.tsx
        ├── UploadedFilesList.tsx
        ├── SearchPanel.tsx
        └── SearchResults.tsx
```

---

## Phase 10 — LLM Integration ✅

**Status:** Complete

### What we built

| File | Purpose |
|------|---------|
| `POST /ask` | Full RAG endpoint |
| `services/askService.ts` | Retrieve → build context → call LLM |
| `services/llmService.ts` | Ollama chat API (`/api/chat`) |
| `utils/ragPrompt.ts` | Context-only system prompt + chunk formatting |
| `controllers/askController.ts` | HTTP handler |
| `components/AskPanel.tsx` | Frontend Q&A input |
| `components/AskResult.tsx` | Answer + source chunks display |

**Chat model:** `llama3.2` (configurable via `OLLAMA_CHAT_MODEL`)

### The golden rule

The LLM receives **only retrieved chunks** as context. It must **not** answer from outside knowledge.

If no chunks are found, or context is insufficient:

> "I cannot find that information in the uploaded documents."

### How RAG works (complete flow)

```
User Question
    ↓
Embed question (nomic-embed-text)
    ↓
Search Qdrant → top 5 chunks
    ↓
Build context string from chunks only
    ↓
Ollama chat (llama3.2) with strict system prompt
    ↓
Grounded answer + source chunks returned
```

### System prompt (enforced)

```
1. Answer ONLY using the CONTEXT provided.
2. Do NOT use outside knowledge.
3. If CONTEXT is insufficient → say you cannot find the information.
```

### Install chat model (first time)

```bash
ollama pull llama3.2
```

Add to `backend/.env`:

```env
OLLAMA_CHAT_MODEL=llama3.2
```

### How to run (full RAG stack)

```bash
# Terminal 1: Qdrant
docker compose up -d

# Terminal 2: Ollama
ollama serve

# Terminal 3: Backend
cd backend && npm run dev

# Terminal 4: Frontend
cd frontend && npm run dev
```

### API test

```bash
curl -X POST http://localhost:3001/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What does the dummy PDF say?"}'
```

### Response shape

```json
{
  "status": "success",
  "question": "What does the dummy PDF say?",
  "answer": "The dummy PDF says: Dummy PDF file.",
  "model": "llama3.2",
  "retrieval": { "results": [...], "embeddingLatencyMs": 180, ... },
  "generationLatencyMs": 3200,
  "totalLatencyMs": 3450
}
```

### How to verify Phase 10

1. Upload a PDF with known content.
2. Ask a question answerable from the PDF → get grounded answer.
3. Ask an unrelated question (e.g. "What is the capital of France?") → should refuse or say not found.
4. Use dashboard **RAG Q&A** panel — see answer + retrieved chunks below.

### Files created

```
backend/src/
├── routes/askRoutes.ts
├── controllers/askController.ts
├── services/askService.ts
├── services/llmService.ts
├── utils/ragPrompt.ts
├── interfaces/IAskService.ts
├── interfaces/ILlmService.ts
└── types/ask.ts

frontend/src/components/
├── AskPanel.tsx
└── AskResult.tsx
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` before running the backend:

```bash
cd backend
cp .env.example .env
```

| Variable | Default | Used from |
|----------|---------|-----------|
| `PORT` | `3001` | Phase 2 |
| `NODE_ENV` | `development` | Phase 2 |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Phase 6 |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Phase 6 |
| `OLLAMA_CHAT_MODEL` | `llama3.2` | Phase 10 |
| `QDRANT_URL` | `http://localhost:6333` | Phase 7 |
| `QDRANT_COLLECTION_NAME` | `pdf_chunks` | Phase 7 |
| `CHUNK_SIZE` | `800` | Phase 5 |
| `CHUNK_OVERLAP` | `150` | Phase 5 |
| `UPLOAD_DIR` | `./tmp/uploads` | Phase 3 |
| `MAX_FILE_SIZE_MB` | `20` | Phase 3 |

---

## Retrieval Pipeline (full picture)

```
PDF Upload
    ↓
Extract Text          (Phase 4)
    ↓
Chunk Text            (Phase 5 — 800 chars, 150 overlap)
    ↓
Generate Embeddings   (Phase 6 — Ollama nomic-embed-text)
    ↓
Store in Qdrant       (Phase 7 — vector + payload)
    ↓
User Question
    ↓
Embed Question        (Phase 6)
    ↓
Vector Search         (Phase 8 — top 5 chunks)
    ↓
Return Results        (Phase 8 / 9)
    ↓
LLM Answer            (Phase 10 — context only) ✅
```

---

## Progress Tracker

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

*Update this file as each phase is completed. Mark status ✅ and add run/verify commands for that phase.*
