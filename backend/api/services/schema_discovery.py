from __future__ import annotations

import logging
import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, List

from rapidfuzz import fuzz, process
from sqlalchemy import inspect, text
from sqlalchemy.engine import Inspector

from .database import DatabaseManager, database_manager

logger = logging.getLogger(__name__)


@dataclass
class SchemaDiscovery:
    db: DatabaseManager = database_manager

    async def analyze_database(self, connection_string: str) -> Dict[str, Any]:
        """Reflect schema information dynamically."""
        await self.db.connect(connection_string)
        engine = self.db.engine
        if engine is None:
            raise RuntimeError("Database engine not initialized")

        schema: Dict[str, Any] = {
            "tables": {},
            "relationships": [],
            "vocabulary": set(),
        }

        async with engine.begin() as conn:
            def gather(sync_conn):
                inspector: Inspector = inspect(sync_conn)
                for table_name in inspector.get_table_names():
                    columns = []
                    for column in inspector.get_columns(table_name):
                        columns.append(
                            {
                                "name": column["name"],
                                "type": str(column["type"]),
                                "nullable": column.get("nullable", True),
                            }
                        )
                    schema["tables"][table_name] = {
                        "columns": columns,
                        "sample_rows": [],
                    }

                    words = re.split(r"[_\s]+", table_name)
                    schema["vocabulary"].update(w.lower() for w in words if w)
                    for column in columns:
                        schema["vocabulary"].update(
                            w.lower()
                            for w in re.split(r"[_\s]+", column["name"])
                            if w
                        )

                # relationships
                for table_name in inspector.get_table_names():
                    for fk in inspector.get_foreign_keys(table_name):
                        schema["relationships"].append(
                            {
                                "source_table": table_name,
                                "target_table": fk.get("referred_table"),
                                "constrained_columns": fk.get("constrained_columns", []),
                                "referred_columns": fk.get("referred_columns", []),
                            }
                        )

            await conn.run_sync(gather)

            # Sample data per table
            for table_name in schema["tables"].keys():
                query = text(f"SELECT * FROM {table_name} LIMIT 5")
                result = await conn.execute(query)
                rows = [dict(row._mapping) for row in result]
                schema["tables"][table_name]["sample_rows"] = rows

        schema["vocabulary"] = sorted(schema["vocabulary"])
        logger.info(
            "Discovered %d tables, %d relationships",
            len(schema["tables"]),
            len(schema["relationships"]),
        )
        return schema

    async def map_natural_language_to_schema(self, query: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        """Map NL tokens to schema elements."""
        tokens = re.findall(r"\w+", query.lower())
        table_scores: Dict[str, int] = defaultdict(int)
        column_scores: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

        vocabulary = schema.get("vocabulary", [])
        table_names = list(schema.get("tables", {}).keys())

        for token in tokens:
            if not token.isalpha():
                continue
            if vocabulary:
                best_match, score, *_ = process.extractOne(
                    token, vocabulary, scorer=fuzz.partial_ratio
                )
                if score > 80:
                    token = best_match

            for table in table_names:
                similarity = fuzz.partial_ratio(token, table.lower())
                if similarity > 60:
                    table_scores[table] += similarity

                for column in schema["tables"][table]["columns"]:
                    col_name = column["name"].lower()
                    similarity = fuzz.partial_ratio(token, col_name)
                    if similarity > 60:
                        column_scores[table][column["name"]] += similarity

        sorted_tables = sorted(table_scores.items(), key=lambda x: x[1], reverse=True)

        if not sorted_tables and column_scores:
            sorted_tables = sorted(
                (
                    (table, sum(score for _col, score in columns.items()))
                    for table, columns in column_scores.items()
                ),
                key=lambda x: x[1],
                reverse=True,
            )

        return {
            "query": query,
            "primary_table": sorted_tables[0][0] if sorted_tables else None,
            "candidate_tables": [name for name, _ in sorted_tables],
            "candidate_columns": {
                table: sorted(cols.items(), key=lambda x: x[1], reverse=True)
                for table, cols in column_scores.items()
            },
        }
