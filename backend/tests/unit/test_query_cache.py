from __future__ import annotations

import time

from api.services.query_cache import QueryCache


def test_cache_set_and_get():
    cache = QueryCache(ttl_seconds=10, max_size=2)
    cache.set("hello", {"value": 1})
    assert cache.get("hello") == {"value": 1}


def test_cache_eviction_lru():
    cache = QueryCache(ttl_seconds=10, max_size=2)
    cache.set("a", 1)
    cache.set("b", 2)
    cache.set("c", 3)
    assert cache.get("a") is None
    assert cache.get("b") == 2
    assert cache.get("c") == 3


def test_cache_expiration():
    cache = QueryCache(ttl_seconds=0, max_size=2)
    cache.set("key", 123)
    time.sleep(0.01)
    assert cache.get("key") is None
