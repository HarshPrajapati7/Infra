# NLP Query Engine for Employee Data

A production-ready reference implementation of a natural-language query engine that dynamically discovers relational schemas, ingests unstructured employee documents, and serves a responsive web UI for multi-source insights.

## Highlights

- ⚙️ **Dynamic schema discovery** – introspects any SQL database (SQLite, PostgreSQL, MySQL) without hard-coded table names and surfaces table/column semantics.
- 🧠 **Hybrid query pipeline** – classifies natural language requests into SQL, document, or hybrid workflows with caching, validation, and SQL optimization.
- 📄 **Adaptive document processing** – intelligent chunking for resumes, contracts, reviews; multi-format ingestion (PDF, DOCX, TXT, CSV); batched embeddings; vector similarity search.
- 📈 **Operational visibility** – query metrics, cache indicators, ingestion progress, schema visualization, and exportable result sets.
- 🧪 **Test coverage** – unit tests for critical components plus integration scenarios covering schema connection, querying, and document ingestion.

## Project Structure

```
project/
├── backend/
│   ├── api/
│   │   ├── routes/              # FastAPI routers (ingestion, query, schema)
│   │   ├── services/            # Schema discovery, query engine, doc pipeline
│   │   ├── models/              # Pydantic request/response DTOs
│   │   └── utils/               # Config loader, logging utilities
│   ├── main.py                  # FastAPI application entrypoint
│   └── tests/                   # Unit & integration tests (pytest)
├── frontend/
│   ├── public/                  # Static assets
│   └── src/                     # React UI (components, hooks, styles)
├── config.yml                   # Externalised configuration (env overrides supported)
├── docker-compose.yml           # Optional dev orchestration (API + frontend)
├── package.json                 # Workspace scripts delegating to frontend
├── requirements.txt             # Backend Python dependencies
└── README.md                    # You are here
```

## Running the Stack

### 1. Backend API

```powershell
# from the project directory
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

The API listens on `http://localhost:8000`. Configure `DATABASE_URL` to point at your employee database (`postgresql://`, `mysql://`, or `sqlite:///`), or supply a connection string through the UI.

### 2. Frontend (React + Vite)

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` to launch the interface. API requests are proxied to `http://localhost:8000` by default.

### 3. End-to-End via Docker Compose (optional)

```powershell
docker compose up --build
```

This spins up the FastAPI backend (`api`) and Vite dev server (`frontend`).

## Core Workflows

1. **Connect database** – provide a connection string; the backend reflects tables, columns, foreign keys, and sample rows. Schema metadata is cached for subsequent queries.
2. **Upload documents** – drag & drop PDF, DOCX, TXT, or CSV files. Jobs execute asynchronously with adaptive chunking, batched embeddings, and persistent vector storage.
3. **Ask questions** – the query panel offers inline auto-complete from the discovered vocabulary and a history dropdown. Responses combine SQL results, document matches, performance metrics, and export options.

## Configuration

`config.yml` (or environment variables) controls database pooling, embedding model, and cache behaviour. Environment overrides:

- `DATABASE_URL` – default connection string.
- `APP_CONFIG_PATH` – alternate config file location.

## Testing & Quality Gates

```powershell
# activate venv first
pytest backend/tests -q
```

Tests cover cache semantics, document chunking strategies, schema mapping, query classification, database connectivity, and document ingestion flows. Extend with additional database fixtures or mocks as needed.

## API Reference

| Method | Endpoint                 | Description                                     |
|--------|--------------------------|-------------------------------------------------|
| POST   | `/api/connect-database`  | Connects to DB and performs schema discovery    |
| POST   | `/api/upload-documents`  | Accepts multiple files for batch processing     |
| GET    | `/api/ingestion-status/{job_id}` | Returns ingestion progress and errors     |
| GET    | `/api/ingestion/jobs`    | Lists recent ingestion jobs                     |
| POST   | `/api/query`             | Runs NL query, returns hybrid results & metrics |
| GET    | `/api/query/history`     | Retrieves recent query metadata                 |
| GET    | `/api/schema`            | Serves cached schema representation             |

## Performance Considerations

- **Query caching:** TTL- and size-bounded LRU cache prevents repeated SQL/document trips.
- **Connection pooling:** Async SQLAlchemy engine reuses connections across requests.
- **Batch embeddings:** Sentence Transformer batches reduce GPU/CPU load.
- **Async IO:** File ingestion, similarity search, and database calls leverage asyncio.

## Known Limitations & Next Steps

- Natural language → SQL relies on heuristic mapping. Integrating an LLM or semantic parser would improve complex joins.
- Vector similarity currently loads embeddings into memory for scoring. Swap in FAISS, Qdrant, or pgvector for large-scale deployments.
- Authentication/authorization is omitted per assignment scope; add OAuth2/JWT for production.
- Additional monitoring hooks (OpenTelemetry, Prometheus) can be layered onto the logging scaffold.

## Demo Checklist

When recording the Loom walkthrough:

1. Connect to two different schema variants to show adaptability.
2. Upload mixed-format documents (PDF + DOCX + TXT) and highlight progress indicators.
3. Execute SQL, document, and hybrid queries, demonstrating cache hits on repeats.
4. Showcase schema visualization, metrics dashboard, and export buttons.
5. Simulate concurrent queries in separate tabs while monitoring response times.

---

**Happy querying!** Let me know if you need pre-populated demo datasets or additional integration hooks.
