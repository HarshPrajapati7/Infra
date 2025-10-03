from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import ingestion, query, schema
from api.services.document_processor import DocumentProcessor
from api.services.query_cache import QueryCache
from api.services.schema_discovery import SchemaDiscovery
from api.utils.config import get_config
from api.utils.logger import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="NLP Query Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(schema.router, prefix="/api")


@app.on_event("startup")
async def startup_event() -> None:
    config = get_config()
    services: Dict[str, Any] = {
        "config": config,
        "schema_discovery": SchemaDiscovery(),
        "document_processor": DocumentProcessor(
            model_name=config.embeddings.model,
            batch_size=config.embeddings.batch_size,
        ),
        "cache": QueryCache(
            ttl_seconds=config.cache.ttl_seconds,
            max_size=config.cache.max_size,
        ),
        "query_engine": None,
        "query_history": [],
    }

    uploads_dir = Path(__file__).resolve().parents[1] / "data" / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    app.state.services = services
    app.state.uploads_dir = uploads_dir
    logger.info("Application startup completed")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    logger.info("Shutting down application")
