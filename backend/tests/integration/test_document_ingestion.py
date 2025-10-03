from __future__ import annotations

import asyncio

import pytest


@pytest.mark.asyncio
async def test_document_ingestion_flow(client):
    files = {
        "files": ("resume.txt", b"SUMMARY\nExperienced engineer", "text/plain")
    }
    response = await client.post("/api/upload-documents", files=files)
    assert response.status_code == 200
    job_info = response.json()
    job_id = job_info["job_id"]

    # poll for completion
    for _ in range(10):
        status_response = await client.get(f"/api/ingestion-status/{job_id}")
        assert status_response.status_code == 200
        status = status_response.json()
        if status["status"].startswith("completed"):
            break
        await asyncio.sleep(0.2)
    else:
        pytest.fail("Ingestion job did not complete in time")
