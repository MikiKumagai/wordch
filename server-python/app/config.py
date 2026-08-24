import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SQLITE_PATH = Path(os.getenv("WORDCH_SQLITE_PATH", REPO_ROOT / "server-python" / "wordch.sqlite3"))
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
ROOM_EXPIRATION_SECONDS = 60 * 60
