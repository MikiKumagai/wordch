import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ALLOWED_ORIGINS
from app.db import init_database
from app.routes import router
from app.rooms import cleanup_rooms


app = FastAPI(title="wordch")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


# アプリ起動時にSQLite初期化とルーム掃除タスクを開始する。
@app.on_event("startup")
async def startup() -> None:
    init_database()
    asyncio.create_task(cleanup_rooms())
