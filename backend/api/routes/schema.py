from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from api.models.dtos import SchemaResponse

router = APIRouter(tags=["schema"])


@router.get("/schema", response_model=SchemaResponse)
async def get_schema(request: Request):
    query_engine = request.app.state.services.get("query_engine")
    if query_engine is None or query_engine.schema is None:
        raise HTTPException(status_code=404, detail="Schema not available")
    return SchemaResponse(**query_engine.schema)
