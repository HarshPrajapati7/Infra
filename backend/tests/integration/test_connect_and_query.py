from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from api.services.schema_discovery import SchemaDiscovery


@pytest.mark.asyncio
async def test_connect_and_run_query(client, tmp_path):
    db_path = tmp_path / "company.db"
    create_demo_database(db_path)
    response = await client.post(
        "/api/connect-database",
        json={"connection_string": f"sqlite:///{db_path}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["schema"]["tables"]

    query_response = await client.post(
        "/api/query",
        json={"query": "How many employees do we have"},
    )
    assert query_response.status_code == 200
    payload = query_response.json()
    assert payload["query_type"] == "sql"
    assert payload["table_results"][0]["count"] == 3


def create_demo_database(path: Path) -> None:
    conn = sqlite3.connect(path)
    try:
        conn.executescript(
            """
            CREATE TABLE employees (
                emp_id INTEGER PRIMARY KEY,
                full_name TEXT,
                dept_id INTEGER,
                annual_salary INTEGER
            );
            INSERT INTO employees (full_name, dept_id, annual_salary) VALUES
                ('Alice', 1, 90000),
                ('Bob', 1, 95000),
                ('Charlie', 2, 88000);
            """
        )
        conn.commit()
    finally:
        conn.close()
