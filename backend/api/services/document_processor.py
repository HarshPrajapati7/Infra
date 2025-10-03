from __future__ import annotations

import asyncio
import csv
import io
import logging
import mimetypes
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Sequence

import aiofiles
import pandas as pd
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer

from .document_store import DocumentChunk, document_store

logger = logging.getLogger(__name__)

SUPPORTED_TYPES = {".pdf", ".docx", ".txt", ".csv"}


@dataclass
class IngestionStatus:
    job_id: str
    total_files: int
    processed_files: int = 0
    status: str = "pending"
    errors: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "job_id": self.job_id,
            "total_files": self.total_files,
            "processed_files": self.processed_files,
            "status": self.status,
            "errors": self.errors,
        }


@dataclass
class DocumentProcessor:
    model_name: str
    batch_size: int
    _embedding_model: SentenceTransformer | None = None
    jobs: Dict[str, IngestionStatus] = field(default_factory=dict)

    @property
    def embedding_model(self) -> SentenceTransformer:
        if self._embedding_model is None:
            logger.info("Loading embedding model %s", self.model_name)
            self._embedding_model = SentenceTransformer(self.model_name)
        return self._embedding_model

    async def process_documents(self, file_paths: Sequence[Path]) -> str:
        job_id = str(uuid.uuid4())
        status = IngestionStatus(job_id=job_id, total_files=len(file_paths))
        self.jobs[job_id] = status

        asyncio.create_task(self._process_job(job_id, list(file_paths)))
        return job_id

    async def _process_job(self, job_id: str, files: List[Path]) -> None:
        status = self.jobs[job_id]
        status.status = "processing"
        try:
            for index, file_path in enumerate(files, start=1):
                try:
                    content, doc_type = await self._read_file(file_path)
                    chunks = self.dynamic_chunking(content, doc_type)
                    embeddings = await self._embed_chunks(chunks)
                    chunk_records = [
                        DocumentChunk(
                            file_name=file_path.name,
                            chunk_index=i,
                            content=chunk,
                            embedding=embeddings[i],
                            metadata={
                                "doc_type": doc_type,
                                "path": str(file_path),
                                "word_count": len(chunk.split()),
                            },
                        )
                        for i, chunk in enumerate(chunks)
                    ]
                    await document_store.add_chunks(job_id, chunk_records)
                except Exception as exc:  # noqa: BLE001
                    logger.exception("Failed to process %s", file_path)
                    status.errors.append(f"{file_path.name}: {exc}")
                finally:
                    status.processed_files = index
            status.status = "completed" if not status.errors else "completed_with_errors"
        except Exception as outer:  # noqa: BLE001
            status.status = "failed"
            status.errors.append(str(outer))
            logger.exception("Ingestion job %s failed", job_id)

    async def _read_file(self, file_path: Path) -> tuple[str, str]:
        suffix = file_path.suffix.lower()
        if suffix not in SUPPORTED_TYPES:
            raise ValueError(f"Unsupported file type: {suffix}")

        if suffix == ".pdf":
            return await asyncio.to_thread(self._read_pdf, file_path), "pdf"
        if suffix == ".docx":
            return await asyncio.to_thread(self._read_docx, file_path), "docx"
        if suffix == ".csv":
            return await asyncio.to_thread(self._read_csv, file_path), "csv"

        async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as fh:
            content = await fh.read()
        return content, "txt"

    @staticmethod
    def _read_pdf(file_path: Path) -> str:
        reader = PdfReader(str(file_path))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text

    @staticmethod
    def _read_docx(file_path: Path) -> str:
        import docx  # lazy import

        document = docx.Document(str(file_path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    @staticmethod
    def _read_csv(file_path: Path) -> str:
        df = pd.read_csv(file_path)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        return buffer.getvalue()

    async def _embed_chunks(self, chunks: Sequence[str]) -> List[List[float]]:
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None,
            lambda: self.embedding_model.encode(
                list(chunks),
                batch_size=self.batch_size,
                convert_to_numpy=True,
                show_progress_bar=False,
            ),
        )
        return embeddings.tolist()

    def dynamic_chunking(self, content: str, doc_type: str) -> List[str]:
        content = content.strip()
        if not content:
            return []

        if doc_type == "csv":
            rows = content.splitlines()
            header, entries = rows[0], rows[1:]
            chunks = []
            batch_size = 50
            for i in range(0, len(entries), batch_size):
                batch = entries[i : i + batch_size]
                csv_content = "\n".join([header] + batch)
                chunks.append(csv_content)
            return chunks

        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]

        if self._looks_like_resume(paragraphs):
            return self._chunk_resume(paragraphs)
        if self._looks_like_contract(paragraphs):
            return self._chunk_contract(paragraphs)

        return self._chunk_paragraphs(paragraphs)

    @staticmethod
    def _looks_like_resume(paragraphs: Sequence[str]) -> bool:
        resume_keywords = {"experience", "education", "skills", "summary"}
        text_sample = " ".join(paragraphs[:3]).lower()
        return any(keyword in text_sample for keyword in resume_keywords)

    @staticmethod
    def _looks_like_contract(paragraphs: Sequence[str]) -> bool:
        contract_keywords = {"agreement", "clause", "party", "terms"}
        text_sample = " ".join(paragraphs[:3]).lower()
        return any(keyword in text_sample for keyword in contract_keywords)

    @staticmethod
    def _chunk_resume(paragraphs: Sequence[str]) -> List[str]:
        chunks: List[str] = []
        current_chunk: List[str] = []
        for paragraph in paragraphs:
            lines = [line.strip() for line in paragraph.splitlines() if line.strip()]
            heading = lines[0] if lines else ""
            if heading.isupper() and len(heading.split()) <= 6:
                if current_chunk:
                    chunks.append("\n".join(current_chunk))
                    current_chunk = []
            current_chunk.append("\n".join(lines))
        if current_chunk:
            chunks.append("\n".join(current_chunk))
        return chunks

    @staticmethod
    def _chunk_contract(paragraphs: Sequence[str]) -> List[str]:
        chunks: List[str] = []
        current_chunk: List[str] = []
        for paragraph in paragraphs:
            if paragraph.lower().startswith("clause") and current_chunk:
                chunks.append("\n".join(current_chunk))
                current_chunk = []
            current_chunk.append(paragraph)
        if current_chunk:
            chunks.append("\n".join(current_chunk))
        return chunks

    @staticmethod
    def _chunk_paragraphs(paragraphs: Sequence[str], target_words: int = 180) -> List[str]:
        chunks: List[str] = []
        current: List[str] = []
        word_count = 0
        for paragraph in paragraphs:
            words = paragraph.split()
            if word_count + len(words) > target_words and current:
                chunks.append("\n".join(current))
                current = []
                word_count = 0
            current.append(paragraph)
            word_count += len(words)
        if current:
            chunks.append("\n".join(current))
        return chunks

    def get_status(self, job_id: str) -> Dict[str, object]:
        if job_id not in self.jobs:
            raise KeyError(f"Unknown job_id: {job_id}")
        return self.jobs[job_id].to_dict()

    def list_jobs(self) -> List[Dict[str, object]]:
        return [status.to_dict() for status in self.jobs.values()]
