from __future__ import annotations

import time
from typing import List

from fastapi import APIRouter, HTTPException, Request

from api.models.dtos import QueryRequest, QueryResponse

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def process_query(request: Request, payload: QueryRequest):
    services = request.app.state.services
    query_engine = services.get("query_engine")
    if query_engine is None:
        raise HTTPException(status_code=400, detail="Database connection not initialized")

    response = await query_engine.process_query(payload.query)

    history_entry = {
        "query": payload.query,
        "timestamp": time.time(),
        "query_type": response["query_type"],
        "performance": response["performance"],
    }
    services["query_history"].insert(0, history_entry)
    services["query_history"] = services["query_history"][:50]

    return QueryResponse(**response)


@router.get("/query/history")
async def get_history(request: Request) -> List[dict]:
    return request.app.state.services["query_history"]
