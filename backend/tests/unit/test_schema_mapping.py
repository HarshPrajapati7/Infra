from __future__ import annotations

import pytest

from api.services.schema_discovery import SchemaDiscovery


@pytest.mark.asyncio
async def test_schema_mapping_identifies_tables_and_columns():
    schema_discovery = SchemaDiscovery()
    schema = {
        "tables": {
            "employees": {
                "columns": [
                    {"name": "full_name", "type": "TEXT", "nullable": False},
                    {"name": "department", "type": "TEXT", "nullable": False},
                    {"name": "annual_salary", "type": "INTEGER", "nullable": False},
                ],
                "sample_rows": [],
            }
        },
        "relationships": [],
        "vocabulary": ["employees", "full", "name", "department", "annual", "salary"],
    }

    mapping = await schema_discovery.map_natural_language_to_schema(
        "Average salary by department", schema
    )
    assert mapping["primary_table"] == "employees"
    assert any(col for col, _ in mapping["candidate_columns"]["employees"] if col == "annual_salary")
