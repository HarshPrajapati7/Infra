from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

from sqlalchemy import text

from .document_processor import DocumentProcessor
from .document_store import document_store
from .query_cache import QueryCache
from .schema_discovery import SchemaDiscovery

logger = logging.getLogger(__name__)


class QueryType(str, Enum):
    SQL = "sql"
    DOCUMENT = "document"
    HYBRID = "hybrid"


@dataclass
class QueryEngine:
    connection_string: str
    schema_discovery: SchemaDiscovery
    cache: QueryCache
    document_processor: DocumentProcessor

    schema: Optional[Dict[str, Any]] = None

    async def initialize(self) -> Dict[str, Any]:
        self.schema = await self.schema_discovery.analyze_database(self.connection_string)
        return self.schema

    async def process_query(self, user_query: str) -> Dict[str, Any]:
        cache_key = user_query.strip().lower()
        cached = self.cache.get(cache_key)
        if cached is not None:
            logger.info("Cache hit for query '%s'", user_query)
            cached.setdefault("performance", {})["cache_hit"] = True
            return cached

        if not self.schema:
            await self.initialize()

        start = time.perf_counter()
        query_type = self._classify_query(user_query)

        sql_task = (
            self._run_sql_query(user_query)
            if query_type in {QueryType.SQL, QueryType.HYBRID}
            else self._empty_sql_result()
        )
        doc_task = (
            self._run_document_query(user_query)
            if query_type in {QueryType.DOCUMENT, QueryType.HYBRID}
            else self._empty_doc_result()
        )

        sql_result, doc_result = await asyncio.gather(sql_task, doc_task)

        elapsed = time.perf_counter() - start
        response = {
            "query": user_query,
            "query_type": query_type.value,
            "sql": sql_result.get("sql") if sql_result else None,
            "table_results": sql_result.get("rows") if sql_result else [],
            "document_results": doc_result.get("documents") if doc_result else [],
            "performance": {
                "elapsed_seconds": round(elapsed, 3),
                "cache_hit": False,
                "rows_returned": len(sql_result.get("rows", [])) if sql_result else 0,
                "documents_returned": len(doc_result.get("documents", [])) if doc_result else 0,
            },
        }

        self.cache.set(cache_key, response.copy())
        return response

    def _classify_query(self, query: str) -> QueryType:
        q = query.lower()
        doc_keywords = {"document", "resume", "policy", "review"}
        sql_keywords = {"count", "average", "list", "show", "sum", "salary", "department"}

        doc_score = sum(1 for word in doc_keywords if word in q)
        sql_score = sum(1 for word in sql_keywords if word in q)

        if doc_score and sql_score:
            return QueryType.HYBRID
        if doc_score:
            return QueryType.DOCUMENT
        return QueryType.SQL

    async def _run_sql_query(self, query: str) -> Dict[str, Any]:
        if not self.schema:
            raise RuntimeError("Schema not initialized")

        mapping = await self.schema_discovery.map_natural_language_to_schema(query, self.schema)
        primary_table = mapping.get("primary_table")
        if not primary_table:
            return {"sql": None, "rows": []}

        statement = self._generate_sql(query, mapping)
        if not statement:
            return {"sql": None, "rows": []}

        engine = self.schema_discovery.db.engine
        if engine is None:
            raise RuntimeError("Database engine unavailable")

        async with engine.connect() as conn:
            result = await conn.execute(text(statement["sql"]), statement["params"])
            rows = [dict(row._mapping) for row in result]

        optimized_sql = self.optimize_sql_query(statement["sql"])

        if optimized_sql != statement["sql"]:
            async with engine.connect() as conn:
                result = await conn.execute(text(optimized_sql), statement["params"])
                rows = [dict(row._mapping) for row in result]
        return {"sql": optimized_sql, "rows": rows}

    def _generate_sql(self, query: str, mapping: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        table = mapping.get("primary_table")
        if not table:
            return None

        tokens = query.lower()
        candidate_columns = mapping.get("candidate_columns", {}).get(table, [])
        selected_columns = [col for col, _ in candidate_columns[:4]] or ["*"]

        if "count" in tokens or "how many" in tokens:
            return {"sql": f"SELECT COUNT(*) AS count FROM {table}", "params": {} }

        if "average" in tokens or "avg" in tokens:
            target_col = self._find_numeric_column(candidate_columns)
            if target_col:
                return {
                    "sql": f"SELECT AVG({target_col}) AS average_{target_col} FROM {table}",
                    "params": {},
                }

        where_clause, params = self._build_where_clause(tokens, candidate_columns)
        column_list = ", ".join(selected_columns)
        sql = f"SELECT {column_list} FROM {table}"
        if where_clause:
            sql += f" WHERE {where_clause}"
        sql += " LIMIT 100"
        return {"sql": sql, "params": params}

    def _find_numeric_column(self, columns: List[Any]) -> Optional[str]:
        numeric_keywords = {"salary", "pay", "compensation", "rate", "amount"}
        for name, _score in columns:
            if any(keyword in name.lower() for keyword in numeric_keywords):
                return name
        return None

    def _build_where_clause(self, tokens: str, columns: List[Any]) -> tuple[str, Dict[str, Any]]:
        filters = []
        params: Dict[str, Any] = {}
        for column, _score in columns:
            column_lower = column.lower()
            if column_lower in tokens:
                continue
            if column_lower in {"department", "dept", "division"}:
                value = self._extract_value(tokens, "department")
                if value:
                    param_name = f"param_{column_lower}_dept"
                    filters.append(f"LOWER({column}) LIKE :{param_name}")
                    params[param_name] = f"%{value.lower()}%"
            elif column_lower in {"role", "position", "title"}:
                value = self._extract_value(tokens, "role")
                if value:
                    param_name = f"param_{column_lower}_role"
                    filters.append(f"LOWER({column}) LIKE :{param_name}")
                    params[param_name] = f"%{value.lower()}%"
        return " AND ".join(filter for filter in filters if filter), params

    def _extract_value(self, tokens: str, keyword: str) -> str:
        if keyword not in tokens:
            return ""
        parts = tokens.split(keyword, 1)[1].split()
        return parts[0] if parts else ""

    async def _run_document_query(self, query: str) -> Dict[str, Any]:
        embedding = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.document_processor.embedding_model.encode(
                [query],
                convert_to_numpy=True,
                normalize_embeddings=True,
            )[0],
        )
        results = await document_store.similarity_search(embedding)
        documents = [
            {
                "file_name": item["file_name"],
                "chunk_index": item["chunk_index"],
                "content": item["content"],
                "similarity": round(item["similarity"], 3),
            }
            for item in results
        ]
        return {"documents": documents}

    def optimize_sql_query(self, sql: str) -> str:
        optimized = sql.strip()
        if "limit" not in optimized.lower():
            optimized += " LIMIT 100"
        return optimized

    async def _empty_sql_result(self) -> Dict[str, Any]:
        return {"sql": None, "rows": []}

    async def _empty_doc_result(self) -> Dict[str, Any]:
        return {"documents": []}
