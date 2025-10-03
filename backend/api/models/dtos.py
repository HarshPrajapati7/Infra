from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class DatabaseConnectionRequest(BaseModel):
    connection_string: str = Field(..., example="sqlite+aiosqlite:///./data/company.db")


class DocumentIngestionResponse(BaseModel):
    job_id: str
    status: str


class DocumentStatusResponse(BaseModel):
    job_id: str
    total_files: int
    processed_files: int
    status: str
    errors: List[str] = []


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    query: str
    query_type: str
    table_results: List[dict]
    document_results: List[dict]
    performance: dict
    sql: Optional[str] = None


class SchemaResponse(BaseModel):
    tables: dict
    relationships: List[dict]
    vocabulary: List[str]
