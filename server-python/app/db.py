import csv
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from app.config import REPO_ROOT, SQLITE_PATH


THEME_CSV = REPO_ROOT / "db" / "initdb.d" / "csv" / "theme.csv"
DEFAULT_VALUE_CSV = REPO_ROOT / "db" / "initdb.d" / "csv" / "default_value.csv"


# SQLite接続を開き、処理後に必ず閉じる。
@contextmanager
def db_connection():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


# 必要なテーブルを作成し、空の場合だけCSV初期データを投入する。
def init_database() -> None:
    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db_connection() as conn:
        conn.execute(
            """
            create table if not exists theme (
              id integer primary key autoincrement,
              theme text not null unique,
              active integer default 0,
              created_at text default current_timestamp,
              created_by text not null
            )
            """
        )
        conn.execute(
            """
            create table if not exists default_value (
              id integer primary key autoincrement,
              value text not null unique,
              active integer default 0,
              created_at text default current_timestamp
            )
            """
        )
        seed_table(conn, "theme", THEME_CSV, ("id", "theme", "active", "created_at", "created_by"))
        seed_table(conn, "default_value", DEFAULT_VALUE_CSV, ("id", "value", "active", "created_at"))
        conn.commit()


# CSVファイルの内容を指定テーブルへ初期投入する。
def seed_table(conn: sqlite3.Connection, table: str, csv_path: Path, columns: tuple[str, ...]) -> None:
    row_count = conn.execute(f"select count(*) from {table}").fetchone()[0]
    if row_count > 0 or not csv_path.exists():
        return

    placeholders = ", ".join("?" for _ in columns)
    column_list = ", ".join(columns)
    with csv_path.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        rows = [
            tuple(normalize_csv_value(row[column]) for column in columns)
            for row in reader
        ]
    conn.executemany(f"insert or ignore into {table} ({column_list}) values ({placeholders})", rows)


# CSV上の値をSQLiteに保存しやすい値へ変換する。
def normalize_csv_value(value: str) -> Any:
    stripped = value.strip()
    if stripped in {"t", "true", "TRUE"}:
        return 1
    if stripped in {"f", "false", "FALSE"}:
        return 0
    return stripped


# SQLiteのテーマ行をJava版互換のJSONキーへ変換する。
def row_to_theme(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "theme": row["theme"],
        "active": bool(row["active"]),
        "createdAt": row["created_at"],
        "createdBy": row["created_by"],
    }


# 管理画面向けに全テーマをID順で取得する。
def get_theme_list() -> list[dict[str, Any]]:
    with db_connection() as conn:
        rows = conn.execute(
            "select id, theme, active, created_at, created_by from theme order by id"
        ).fetchall()
    return [row_to_theme(row) for row in rows]


# 指定テーマのactiveフラグを反転し、対象テーマ名を返す。
def toggle_theme(theme_id: int) -> str | None:
    with db_connection() as conn:
        row = conn.execute("select theme from theme where id = ?", (theme_id,)).fetchone()
        if row is None:
            return None
        conn.execute("update theme set active = case active when 0 then 1 else 0 end where id = ?", (theme_id,))
        conn.commit()
    return row["theme"]


# 指定テーマを削除し、削除できたかどうかを返す。
def delete_theme(theme_id: int) -> bool:
    with db_connection() as conn:
        row = conn.execute("select id from theme where id = ?", (theme_id,)).fetchone()
        if row is None:
            return False
        conn.execute("delete from theme where id = ?", (theme_id,))
        conn.commit()
    return True


# ゲーム開始時に使う有効テーマをランダムに2件取得する。
def select_random_themes() -> list[str]:
    with db_connection() as conn:
        rows = conn.execute(
            "select theme from theme where active = true order by random() limit 2"
        ).fetchall()
    return [row[0] for row in rows]


# ゲーム開始時に使う初期ワードをランダムに2件取得する。
def select_random_default_values() -> list[str]:
    with db_connection() as conn:
        rows = conn.execute(
            "select value from default_value where active = true order by random() limit 2"
        ).fetchall()
    return [row[0] for row in rows]


# ユーザー入力テーマを重複させずに保存する。
def insert_user_theme(theme: str) -> None:
    with db_connection() as conn:
        conn.execute(
            "insert or ignore into theme (theme, created_by) values (?, ?)",
            (theme, "user"),
        )
        conn.commit()
