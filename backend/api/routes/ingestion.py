from __future__ import annotations

from pathlib import Path
from typing import List

import aiofiles
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, UploadFile

from api.models.dtos import (
    DatabaseConnectionRequest,
    DocumentIngestionResponse,
    DocumentStatusResponse,
)
from api.services.query_engine import QueryEngine

router = APIRouter(tags=["ingestion"])


@router.post("/connect-database")
async def connect_database(request: Request, payload: DatabaseConnectionRequest):
    services = request.app.state.services
    schema_discovery = services["schema_discovery"]
    cache = services["cache"]
    document_processor = services["document_processor"]

    query_engine = QueryEngine(
        connection_string=payload.connection_string,
        schema_discovery=schema_discovery,
        cache=cache,
        document_processor=document_processor,
    )
    schema = await query_engine.initialize()
    services["query_engine"] = query_engine
    services["query_history"].clear()
    return {"message": "Connection successful", "schema": schema}


@router.post("/upload-documents", response_model=DocumentIngestionResponse)
async def upload_documents(
    request: Request,
    files: List[UploadFile],
    background_tasks: BackgroundTasks,
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    services = request.app.state.services
    document_processor = services["document_processor"]
    uploads_dir: Path = request.app.state.uploads_dir

    saved_paths: List[Path] = []
    for upload in files:
        destination = uploads_dir / upload.filename
        async with aiofiles.open(destination, "wb") as out_file:  # type: ignore[name-defined]
            content = await upload.read()
            await out_file.write(content)
        saved_paths.append(destination)

    job_id = await document_processor.process_documents(saved_paths)

    def cleanup_paths(paths: List[Path]) -> None:
        for path in paths:
            try:
                path.unlink(missing_ok=True)
            except Exception:  # noqa: BLE001
                pass

    background_tasks.add_task(cleanup_paths, saved_paths)
    return DocumentIngestionResponse(job_id=job_id, status="queued")


@router.get("/ingestion-status/{job_id}", response_model=DocumentStatusResponse)
async def get_status(request: Request, job_id: str):
    document_processor = request.app.state.services["document_processor"]
    try:
        status = document_processor.get_status(job_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return DocumentStatusResponse(**status)


@router.get("/ingestion/jobs")
async def list_jobs(request: Request):
    document_processor = request.app.state.services["document_processor"]
    return document_processor.list_jobs()
