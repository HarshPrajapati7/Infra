from __future__ import annotations

import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class CacheEntry:
    value: Any
    expires_at: float


class QueryCache:
    def __init__(self, ttl_seconds: int = 300, max_size: int = 1_000) -> None:
        self.ttl_seconds = ttl_seconds
        self.max_size = max_size
        self._store: OrderedDict[str, CacheEntry] = OrderedDict()

    def get(self, key: str) -> Optional[Any]:
        self._evict_expired()
        if key not in self._store:
            return None
        entry = self._store.pop(key)
        if entry.expires_at < time.time():
            return None
        self._store[key] = entry
        return entry.value

    def set(self, key: str, value: Any) -> None:
        self._evict_expired()
        if key in self._store:
            self._store.pop(key)
        elif len(self._store) >= self.max_size:
            self._store.popitem(last=False)
        self._store[key] = CacheEntry(value=value, expires_at=time.time() + self.ttl_seconds)

    def clear(self) -> None:
        self._store.clear()

    def _evict_expired(self) -> None:
        now = time.time()
        expired_keys = [key for key, entry in self._store.items() if entry.expires_at < now]
        for key in expired_keys:
            self._store.pop(key)
