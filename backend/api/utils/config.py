from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import yaml
from pydantic import BaseModel, Field


class DatabaseConfig(BaseModel):
    connection_string: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "sqlite+aiosqlite:///./data/company.db",
        )
    )
    pool_size: int = 10


class EmbeddingConfig(BaseModel):
    model: str = "sentence-transformers/all-MiniLM-L6-v2"
    batch_size: int = 32


class CacheConfig(BaseModel):
    ttl_seconds: int = 300
    max_size: int = 1_000


class AppConfig(BaseModel):
    database: DatabaseConfig = DatabaseConfig()
    embeddings: EmbeddingConfig = EmbeddingConfig()
    cache: CacheConfig = CacheConfig()


def _load_yaml(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


@lru_cache(maxsize=1)
def get_config(config_path: Path | None = None) -> AppConfig:
    """Load application configuration, allowing environment overrides."""
    search_paths = [
        config_path,
        Path(os.getenv("APP_CONFIG_PATH", "")) if os.getenv("APP_CONFIG_PATH") else None,
        Path(__file__).resolve().parents[3] / "config.yml",
    ]

    data: Dict[str, Any] = {}
    for path in search_paths:
        if path and path.exists():
            data.update(_load_yaml(path))

    if "database" in data:
        if "connection_string" in data["database"]:
            data["database"]["connection_string"] = os.getenv(
                "DATABASE_URL",
                data["database"]["connection_string"],
            )

    return AppConfig(**data)
