from __future__ import annotations

import asyncio
from pathlib import Path
import sys
from typing import AsyncIterator, Generator

import numpy as np
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
for path in (str(ROOT_DIR), str(BACKEND_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)

from api.services.document_processor import DocumentProcessor
from backend.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def stub_embeddings(tmp_path: Path) -> AsyncIterator[None]:
    if not hasattr(app.state, "services"):
        await app.router.startup()

    processor: DocumentProcessor = app.state.services["document_processor"]

    class StubModel:
        def encode(self, sentences, **kwargs):
            return np.zeros((len(sentences), 8), dtype=np.float32)

    processor._embedding_model = StubModel()  # type: ignore[attr-defined]
    yield
    processor._embedding_model = None  # reset


@pytest_asyncio.fixture()
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client
