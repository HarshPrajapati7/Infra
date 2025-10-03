from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncIterator, Optional

from sqlalchemy import URL
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (AsyncEngine, AsyncSession,
                                   async_sessionmaker, create_async_engine)

logger = logging.getLogger(__name__)


SUPPORTED_DIALECTS = {
    "postgresql": "postgresql+asyncpg",
    "mysql": "mysql+aiomysql",
    "sqlite": "sqlite+aiosqlite",
}


@dataclass
class DatabaseManager:
    """Manage async database connections and sessions."""

    engine: Optional[AsyncEngine] = None
    session_factory: Optional[async_sessionmaker[AsyncSession]] = None
    _lock: asyncio.Lock = asyncio.Lock()

    async def connect(self, connection_string: str, pool_size: int = 10) -> None:
        async with self._lock:
            normalized = self._normalize_connection_string(connection_string)
            if self.engine and str(self.engine.url) == normalized:
                logger.info("Reusing existing engine for %s", normalized)
                return

            if self.engine:
                await self.engine.dispose()

            logger.info("Creating engine for %s", normalized)
            self.engine = create_async_engine(
                normalized,
                pool_size=pool_size,
                max_overflow=pool_size,
                pool_pre_ping=True,
                future=True,
            )
            self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)

    @staticmethod
    def _normalize_connection_string(raw: str) -> str:
        url: URL = make_url(raw)
        dialect = url.get_backend_name()
        driver = url.get_driver_name()

        if dialect not in SUPPORTED_DIALECTS:
            raise ValueError(f"Unsupported dialect '{dialect}'. Supported: {list(SUPPORTED_DIALECTS)}")

        async_driver = SUPPORTED_DIALECTS[dialect]

        if "+" in async_driver:
            dialect_name, driver_name = async_driver.split("+", 1)
        else:
            dialect_name, driver_name = async_driver, ""

        if dialect == "sqlite" and not url.database:
            # Ensure SQLite connects to file (default) or memory
            database = url.database or "./data/company.db"
        else:
            database = url.database

        async_url = URL.create(
            dialect_name,
            username=url.username,
            password=url.password,
            host=url.host,
            port=url.port,
            database=database,
            query=url.query,
        )

        if driver_name:
            async_url = async_url.set(drivername=f"{dialect_name}+{driver_name}")

        return str(async_url)

    @asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        if not self.session_factory:
            raise RuntimeError("Database engine is not initialized. Call connect() first.")
        session = self.session_factory()
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


database_manager = DatabaseManager()
