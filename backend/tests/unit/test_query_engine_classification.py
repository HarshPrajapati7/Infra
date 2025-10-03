from __future__ import annotations

from api.services.query_cache import QueryCache
from api.services.query_engine import QueryEngine, QueryType
from api.services.schema_discovery import SchemaDiscovery


class DummyProcessor:
    pass


def make_engine() -> QueryEngine:
    return QueryEngine(
        connection_string="sqlite+aiosqlite:///./data/company.db",
        schema_discovery=SchemaDiscovery(),
        cache=QueryCache(),
        document_processor=DummyProcessor(),
    )


def test_classifies_sql_queries():
    engine = make_engine()
    assert engine._classify_query("Count employees by department") is QueryType.SQL


def test_classifies_document_queries():
    engine = make_engine()
    assert engine._classify_query("Find documents mentioning remote work") is QueryType.DOCUMENT


def test_classifies_hybrid_queries():
    engine = make_engine()
    assert engine._classify_query("Show resumes and salaries for Python developers") is QueryType.HYBRID
