import os


DATABASE_URL = os.getenv(
    "WORDCH_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql://kmmk:uwfyzcyr@localhost:5432/wordch"),
)
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
ROOM_EXPIRATION_SECONDS = 60 * 60
