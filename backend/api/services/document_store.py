from __future__ import annotations

import asyncio
import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Sequence

import numpy as np

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "document_index.db"


@dataclass
class DocumentChunk:
    file_name: str
    chunk_index: int
    content: str
    embedding: Sequence[float]
    metadata: Dict[str, Any]


class DocumentStore:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path
        self._init_lock = asyncio.Lock()
        self._initialized = False

    async def initialize(self) -> None:
        async with self._init_lock:
            if self._initialized:
                return
            await asyncio.to_thread(self._create_schema)
            self._initialized = True

    def _create_schema(self) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id TEXT,
                    file_name TEXT,
                    chunk_index INTEGER,
                    content TEXT,
                    embedding BLOB,
                    metadata TEXT
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id)"
            )
            conn.commit()
        finally:
            conn.close()

    @staticmethod
    def _serialize_embedding(embedding: Sequence[float]) -> bytes:
        array = np.asarray(embedding, dtype=np.float32)
        return array.tobytes()

    @staticmethod
    def _deserialize_embedding(blob: bytes) -> np.ndarray:
        return np.frombuffer(blob, dtype=np.float32)

    async def add_chunks(self, job_id: str, chunks: List[DocumentChunk]) -> None:
        if not self._initialized:
            await self.initialize()

        records = [
            (
                job_id,
                chunk.file_name,
                chunk.chunk_index,
                chunk.content,
                self._serialize_embedding(chunk.embedding),
                json.dumps(chunk.metadata),
            )
            for chunk in chunks
        ]

        await asyncio.to_thread(self._bulk_insert, records)

    def _bulk_insert(self, records: List[Any]) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.executemany(
                """
                INSERT INTO documents (job_id, file_name, chunk_index, content, embedding, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                records,
            )
            conn.commit()
        finally:
            conn.close()

    async def similarity_search(self, embedding: Sequence[float], top_k: int = 5) -> List[Dict[str, Any]]:
        if not self._initialized:
            await self.initialize()

        rows = await asyncio.to_thread(self._fetch_all)
        if not rows:
            return []

        query_vec = np.asarray(embedding, dtype=np.float32)
        results = []
        for row in rows:
            emb = self._deserialize_embedding(row["embedding"])
            # Check dimension compatibility
            if query_vec.shape != emb.shape:
                continue
            similarity = float(query_vec.dot(emb) / (np.linalg.norm(query_vec) * np.linalg.norm(emb) + 1e-8))
            results.append({**row, "similarity": similarity})

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    def _fetch_all(self) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            rows = conn.execute("SELECT * FROM documents").fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()


document_store = DocumentStore()
