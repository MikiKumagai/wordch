import time
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket

from app.db import delete_theme, get_theme_list, toggle_theme
from app.stomp import handle_stomp_websocket


router = APIRouter()


@router.get("/ping")
def ping() -> str:
    return "ping"


@router.get("/api/admin")
def admin_theme_list() -> list[dict[str, Any]]:
    return get_theme_list()


@router.get("/api/admin/edit/{theme_id}")
def edit_theme(theme_id: int) -> str:
    theme = toggle_theme(theme_id)
    if theme is None:
        raise HTTPException(status_code=404, detail="theme not found")
    return f"edit theme{theme}"


@router.get("/api/admin/delete/{theme_id}")
def remove_theme(theme_id: int) -> str:
    if not delete_theme(theme_id):
        raise HTTPException(status_code=404, detail="theme not found")
    return f"delete theme{theme_id}"


@router.get("/gs-guide-websocket/info")
def sockjs_info() -> dict[str, Any]:
    return {
        "websocket": True,
        "origins": ["*:*"],
        "cookie_needed": False,
        "entropy": int(time.time() * 1000),
    }


@router.websocket("/gs-guide-websocket/{server_id}/{session_id}/websocket")
async def sockjs_websocket(websocket: WebSocket, server_id: str, session_id: str) -> None:
    await handle_stomp_websocket(websocket, use_sockjs=True)


@router.websocket("/gs-guide-websocket/websocket")
async def direct_websocket(websocket: WebSocket) -> None:
    await handle_stomp_websocket(websocket, use_sockjs=False)
