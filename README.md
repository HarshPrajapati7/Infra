# INFERA - AI-Powered NLP Query Engine# NLP Query Engine for Employee Data



A modern, intelligent query engine that allows you to interact with your databases and documents using natural language. Built with React, FastAPI, and advanced NLP capabilities.A production-ready reference implementation of a natural-language query engine that dynamically discovers relational schemas, ingests unstructured employee documents, and serves a responsive web UI for multi-source insights.



## 🚀 Features## Highlights



- **Natural Language Queries** - Ask questions in plain English without knowing SQL- ⚙️ **Dynamic schema discovery** – introspects any SQL database (SQLite, PostgreSQL, MySQL) without hard-coded table names and surfaces table/column semantics.

- **Database Integration** - Connect to PostgreSQL, MySQL, SQLite, SQL Server- 🧠 **Hybrid query pipeline** – classifies natural language requests into SQL, document, or hybrid workflows with caching, validation, and SQL optimization.

- **Document Search** - Upload and search through PDF, TXT, CSV, DOCX files- 📄 **Adaptive document processing** – intelligent chunking for resumes, contracts, reviews; multi-format ingestion (PDF, DOCX, TXT, CSV); batched embeddings; vector similarity search.

- **Schema Discovery** - Automatically analyzes database structure- 📈 **Operational visibility** – query metrics, cache indicators, ingestion progress, schema visualization, and exportable result sets.

- **Hybrid Search** - Combines structured queries with semantic document search- 🧪 **Test coverage** – unit tests for critical components plus integration scenarios covering schema connection, querying, and document ingestion.

- **Smart Caching** - Intelligent query caching for improved performance

- **Real-time Analytics** - Monitor query performance and system metrics## Project Structure



## 🛠️ Tech Stack```

project/

### Frontend├── backend/

- React 18.2.0│   ├── api/

- Vite 4.5.14│   │   ├── routes/              # FastAPI routers (ingestion, query, schema)

- React Query (TanStack Query)│   │   ├── services/            # Schema discovery, query engine, doc pipeline

- Recharts for visualizations│   │   ├── models/              # Pydantic request/response DTOs

- Modern CSS with black & white minimalist design│   │   └── utils/               # Config loader, logging utilities

│   ├── main.py                  # FastAPI application entrypoint

### Backend│   └── tests/                   # Unit & integration tests (pytest)

- FastAPI├── frontend/

- SQLAlchemy (async)│   ├── public/                  # Static assets

- Sentence Transformers│   └── src/                     # React UI (components, hooks, styles)

- ChromaDB for vector storage├── config.yml                   # Externalised configuration (env overrides supported)

- Python 3.9+├── docker-compose.yml           # Optional dev orchestration (API + frontend)

├── package.json                 # Workspace scripts delegating to frontend

## 📦 Installation├── requirements.txt             # Backend Python dependencies

└── README.md                    # You are here

### Prerequisites```

- Node.js 16+ and npm/yarn

- Python 3.9+## Running the Stack

- Git

### 1. Backend API

### Clone Repository

```bash```powershell

git clone <your-repo-url># from the project directory

cd projectpython -m venv .venv

```.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

### Backend Setupuvicorn backend.main:app --reload

```bash```

cd backend

python -m venv .venvThe API listens on `http://localhost:8000`. Configure `DATABASE_URL` to point at your employee database (`postgresql://`, `mysql://`, or `sqlite:///`), or supply a connection string through the UI.

.venv\Scripts\activate  # Windows

source .venv/bin/activate  # Linux/Mac### 2. Frontend (React + Vite)



pip install -r requirements.txt```powershell

```npm install

npm run dev

### Frontend Setup```

```bash

cd frontendOpen `http://localhost:5173` to launch the interface. API requests are proxied to `http://localhost:8000` by default.

npm install

```### 3. End-to-End via Docker Compose (optional)



## 🚀 Running the Application```powershell

docker compose up --build

### Start Backend Server```

```bash

cd backendThis spins up the FastAPI backend (`api`) and Vite dev server (`frontend`).

python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

```## Core Workflows



Backend will be available at: `http://localhost:8000`1. **Connect database** – provide a connection string; the backend reflects tables, columns, foreign keys, and sample rows. Schema metadata is cached for subsequent queries.

2. **Upload documents** – drag & drop PDF, DOCX, TXT, or CSV files. Jobs execute asynchronously with adaptive chunking, batched embeddings, and persistent vector storage.

### Start Frontend Development Server3. **Ask questions** – the query panel offers inline auto-complete from the discovered vocabulary and a history dropdown. Responses combine SQL results, document matches, performance metrics, and export options.

```bash

cd frontend## Configuration

npm run dev

````config.yml` (or environment variables) controls database pooling, embedding model, and cache behaviour. Environment overrides:



Frontend will be available at: `http://localhost:5173`- `DATABASE_URL` – default connection string.

- `APP_CONFIG_PATH` – alternate config file location.

## 🐳 Docker Deployment (Optional)

## Testing & Quality Gates

```bash

docker-compose up -d```powershell

```# activate venv first

pytest backend/tests -q

This will start both frontend and backend services.```



## 📖 UsageTests cover cache semantics, document chunking strategies, schema mapping, query classification, database connectivity, and document ingestion flows. Extend with additional database fixtures or mocks as needed.



1. **Connect Database**## API Reference

   - Navigate to Database section

   - Enter your database connection string| Method | Endpoint                 | Description                                     |

   - Example: `sqlite+aiosqlite:///path/to/database.db`|--------|--------------------------|-------------------------------------------------|

| POST   | `/api/connect-database`  | Connects to DB and performs schema discovery    |

2. **Upload Documents (Optional)**| POST   | `/api/upload-documents`  | Accepts multiple files for batch processing     |

   - Go to Documents section| GET    | `/api/ingestion-status/{job_id}` | Returns ingestion progress and errors     |

   - Upload PDF, TXT, CSV, or DOCX files| GET    | `/api/ingestion/jobs`    | Lists recent ingestion jobs                     |

   - Wait for processing to complete| POST   | `/api/query`             | Runs NL query, returns hybrid results & metrics |

| GET    | `/api/query/history`     | Retrieves recent query metadata                 |

3. **Query Your Data**| GET    | `/api/schema`            | Serves cached schema representation             |

   - Use the Query Chat interface

   - Ask questions in natural language## Performance Considerations

   - Example: "Show me all employees in engineering"

- **Query caching:** TTL- and size-bounded LRU cache prevents repeated SQL/document trips.

4. **View Results**- **Connection pooling:** Async SQLAlchemy engine reuses connections across requests.

   - See structured database results- **Batch embeddings:** Sentence Transformer batches reduce GPU/CPU load.

   - View relevant document excerpts- **Async IO:** File ingestion, similarity search, and database calls leverage asyncio.

   - Export data as CSV or JSON

## Known Limitations & Next Steps

## 🔧 Configuration

- Natural language → SQL relies on heuristic mapping. Integrating an LLM or semantic parser would improve complex joins.

Edit `config.yml` for backend configuration:- Vector similarity currently loads embeddings into memory for scoring. Swap in FAISS, Qdrant, or pgvector for large-scale deployments.

```yaml- Authentication/authorization is omitted per assignment scope; add OAuth2/JWT for production.

database:- Additional monitoring hooks (OpenTelemetry, Prometheus) can be layered onto the logging scaffold.

  connection_string: "sqlite+aiosqlite:///./data/company.db"

  ## Demo Checklist

cache:

  enabled: trueWhen recording the Loom walkthrough:

  ttl: 3600

1. Connect to two different schema variants to show adaptability.

embeddings:2. Upload mixed-format documents (PDF + DOCX + TXT) and highlight progress indicators.

  model: "all-MiniLM-L6-v2"3. Execute SQL, document, and hybrid queries, demonstrating cache hits on repeats.

```4. Showcase schema visualization, metrics dashboard, and export buttons.

5. Simulate concurrent queries in separate tabs while monitoring response times.

## 📁 Project Structure

---

```

project/**Happy querying!** Let me know if you need pre-populated demo datasets or additional integration hooks.

├── backend/              # FastAPI backend
│   ├── api/             # API routes
│   │   ├── models/      # Data models
│   │   ├── routes/      # Endpoints
│   │   └── services/    # Business logic
│   ├── tests/           # Unit & integration tests
│   └── main.py          # Application entry
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components
│   │   ├── App.jsx      # Main app
│   │   └── styles.css   # Global styles
│   └── public/          # Static assets
│
├── data/                # Database and uploads
├── logs/                # Application logs
└── docker-compose.yml   # Docker configuration
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Run Specific Tests
```bash
pytest tests/unit/
pytest tests/integration/
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

- `POST /api/connect` - Connect to database
- `GET /api/schema` - Get database schema
- `POST /api/ingest` - Upload documents
- `POST /api/query` - Execute natural language query
- `GET /api/query/history` - View query history

## 🎨 Design Philosophy

INFERA features a clean, minimalist black & white design with:
- High contrast for accessibility
- Grainy texture background for depth
- Chat-based interface inspired by modern AI assistants
- Intuitive navigation with sidebar
- Responsive design for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Harsh Prajapati**
- Role: Developer

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React community for amazing tools
- Sentence Transformers for NLP capabilities
- All contributors and testers

## 📞 Support

For support, email contactharsh.prajapati@gmail.com or open an issue in the repository.
