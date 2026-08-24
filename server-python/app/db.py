from contextlib import contextmanager
from datetime import datetime
from typing import Any

import psycopg

from app.config import DATABASE_URL


@contextmanager
def db_connection():
    with psycopg.connect(DATABASE_URL) as conn:
        yield conn


def row_to_theme(row: tuple[Any, ...]) -> dict[str, Any]:
    created_at = row[3]
    return {
        "id": row[0],
        "theme": row[1],
        "active": row[2],
        "createdAt": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
        "createdBy": row[4],
    }


def get_theme_list() -> list[dict[str, Any]]:
    with db_connection() as conn:
        rows = conn.execute(
            "select id, theme, active, created_at, created_by from theme order by id"
        ).fetchall()
    return [row_to_theme(row) for row in rows]


def toggle_theme(theme_id: int) -> str | None:
    with db_connection() as conn:
        row = conn.execute(
            "update theme set active = not active where id = %s returning theme",
            (theme_id,),
        ).fetchone()
        if row is None:
            return None
        conn.commit()
    return row[0]


def delete_theme(theme_id: int) -> bool:
    with db_connection() as conn:
        row = conn.execute("delete from theme where id = %s returning id", (theme_id,)).fetchone()
        if row is None:
            return False
        conn.commit()
    return True


def select_random_themes() -> list[str]:
    with db_connection() as conn:
        rows = conn.execute(
            "select theme from theme where active = true order by random() limit 2"
        ).fetchall()
    return [row[0] for row in rows]


def select_random_default_values() -> list[str]:
    with db_connection() as conn:
        rows = conn.execute(
            "select value from default_value where active = true order by random() limit 2"
        ).fetchall()
    return [row[0] for row in rows]


def insert_user_theme(theme: str) -> None:
    with db_connection() as conn:
        conn.execute(
            "insert into theme (theme, created_by) values (%s, %s) on conflict (theme) do nothing",
            (theme, "user"),
        )
        conn.commit()
