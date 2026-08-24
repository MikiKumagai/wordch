import asyncio
import json
import os
import time
from collections import defaultdict
from contextlib import contextmanager
from datetime import datetime
from typing import Any

import psycopg
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


DATABASE_URL = os.getenv(
    "WORDCH_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql://kmmk:uwfyzcyr@localhost:5432/wordch"),
)
ROOM_EXPIRATION_SECONDS = 60 * 60


app = FastAPI(title="wordch")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StompMessage(BaseModel):
    command: str
    headers: dict[str, str] = Field(default_factory=dict)
    body: str = ""


class ClientConnection:
    def __init__(self, websocket: WebSocket, use_sockjs: bool) -> None:
        self.websocket = websocket
        self.use_sockjs = use_sockjs
        self.subscriptions: dict[str, str] = {}


class Broker:
    def __init__(self) -> None:
        self._clients: set[ClientConnection] = set()
        self._topics: dict[str, set[ClientConnection]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, client: ClientConnection) -> None:
        async with self._lock:
            self._clients.add(client)

    async def disconnect(self, client: ClientConnection) -> None:
        async with self._lock:
            self._clients.discard(client)
            for destination in list(client.subscriptions.values()):
                self._topics[destination].discard(client)
            client.subscriptions.clear()

    async def subscribe(self, client: ClientConnection, subscription_id: str, destination: str) -> None:
        async with self._lock:
            client.subscriptions[subscription_id] = destination
            self._topics[destination].add(client)

    async def unsubscribe(self, client: ClientConnection, subscription_id: str) -> None:
        async with self._lock:
            destination = client.subscriptions.pop(subscription_id, None)
            if destination is not None:
                self._topics[destination].discard(client)

    async def publish(self, destination: str, body: str) -> None:
        async with self._lock:
            subscribers = list(self._topics.get(destination, set()))
        await asyncio.gather(
            *(send_message_to_client(client, destination, body) for client in subscribers),
            return_exceptions=True,
        )


class RoomRoles:
    def __init__(self) -> None:
        self.dealer = ""
        self.players: set[str] = set()
        self.last_update = time.time()


broker = Broker()
room_roles: dict[str, RoomRoles] = {}
room_lock = asyncio.Lock()


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


async def cleanup_rooms() -> None:
    while True:
        await asyncio.sleep(ROOM_EXPIRATION_SECONDS)
        now = time.time()
        async with room_lock:
            stale_room_ids = [
                room_id
                for room_id, room in room_roles.items()
                if now - room.last_update > ROOM_EXPIRATION_SECONDS
            ]
            for room_id in stale_room_ids:
                room_roles.pop(room_id, None)


@app.on_event("startup")
async def startup() -> None:
    asyncio.create_task(cleanup_rooms())


@app.get("/ping")
def ping() -> str:
    return "ping"


@app.get("/api/admin")
def get_theme_list() -> list[dict[str, Any]]:
    with db_connection() as conn:
        rows = conn.execute(
            "select id, theme, active, created_at, created_by from theme order by id"
        ).fetchall()
    return [row_to_theme(row) for row in rows]


@app.get("/api/admin/edit/{theme_id}")
def edit_theme(theme_id: int) -> str:
    with db_connection() as conn:
        row = conn.execute(
            "update theme set active = not active where id = %s returning theme",
            (theme_id,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="theme not found")
        conn.commit()
    return f"edit theme{row[0]}"


@app.get("/api/admin/delete/{theme_id}")
def delete_theme(theme_id: int) -> str:
    with db_connection() as conn:
        row = conn.execute("delete from theme where id = %s returning id", (theme_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="theme not found")
        conn.commit()
    return f"delete theme{theme_id}"


@app.get("/gs-guide-websocket/info")
def sockjs_info() -> dict[str, Any]:
    return {
        "websocket": True,
        "origins": ["*:*"],
        "cookie_needed": False,
        "entropy": int(time.time() * 1000),
    }


@app.websocket("/gs-guide-websocket/{server_id}/{session_id}/websocket")
async def sockjs_websocket(websocket: WebSocket, server_id: str, session_id: str) -> None:
    await handle_stomp_websocket(websocket, use_sockjs=True)


@app.websocket("/gs-guide-websocket/websocket")
async def direct_websocket(websocket: WebSocket) -> None:
    await handle_stomp_websocket(websocket, use_sockjs=False)


async def handle_stomp_websocket(websocket: WebSocket, use_sockjs: bool) -> None:
    await websocket.accept()
    client = ClientConnection(websocket, use_sockjs)
    await broker.connect(client)
    if use_sockjs:
        await websocket.send_text("o")
    try:
        while True:
            raw = await websocket.receive_text()
            for payload in parse_sockjs_payload(raw, use_sockjs):
                for message in parse_stomp_messages(payload):
                    await handle_stomp_message(client, message, use_sockjs)
    except WebSocketDisconnect:
        pass
    finally:
        await broker.disconnect(client)


async def handle_stomp_message(client: ClientConnection, message: StompMessage, use_sockjs: bool) -> None:
    if message.command in {"CONNECT", "STOMP"}:
        await send_sockjs_message(
            client.websocket,
            build_frame(
                "CONNECTED",
                {"version": "1.2", "heart-beat": "0,0", "server": "wordch-fastapi"},
            ),
            use_sockjs,
        )
        return

    if message.command == "SUBSCRIBE":
        destination = message.headers.get("destination")
        subscription_id = message.headers.get("id", destination or "")
        if destination:
            await broker.subscribe(client, subscription_id, destination)
        return

    if message.command == "UNSUBSCRIBE":
        subscription_id = message.headers.get("id")
        if subscription_id:
            await broker.unsubscribe(client, subscription_id)
        return

    if message.command == "SEND":
        destination = message.headers.get("destination", "")
        await route_app_message(destination, message.body)
        return

    if message.command == "DISCONNECT":
        await client.websocket.close()


async def route_app_message(destination: str, body: str) -> None:
    parts = destination.strip("/").split("/")
    if len(parts) < 3 or parts[0] != "app":
        return

    action = parts[1]
    room_id = parts[-1]
    payload = parse_json_body(body)

    if action == "start":
        themes = select_random_themes()
        values = select_random_default_values()
        await broker.publish(
            f"/topic/start/{room_id}",
            json.dumps(
                {
                    "theme": themes,
                    "defaultWinner": values[0] if len(values) > 0 else "",
                    "defaultChallenger": values[1] if len(values) > 1 else "",
                },
                ensure_ascii=False,
            ),
        )
    elif action == "answer":
        await broker.publish(
            f"/topic/answer/{room_id}",
            json.dumps({"answer": payload.get("answer", "")}, ensure_ascii=False),
        )
    elif action == "winner":
        await broker.publish(
            f"/topic/winner/{room_id}",
            json.dumps({"winner": payload.get("winner", "")}, ensure_ascii=False),
        )
    elif action == "prepared":
        theme = payload.get("theme", "")
        if payload.get("isUserInput") is True and theme:
            insert_user_theme(theme)
        await broker.publish(f"/topic/prepared/{room_id}", theme)
    elif action == "role":
        role_amount = await update_role_amount(room_id, payload)
        await broker.publish(
            f"/topic/role_amount/{room_id}",
            json.dumps(role_amount, ensure_ascii=False),
        )
    elif action == "final" and parts[2] == "select":
        await broker.publish(
            f"/topic/final/select/{room_id}",
            json.dumps({"finalWinner": payload.get("finalWinner", "")}, ensure_ascii=False),
        )
    elif action == "final" and parts[2] == "theme":
        await broker.publish(f"/topic/final/theme/{room_id}", json.dumps(True))
    elif action == "final":
        await broker.publish(
            f"/topic/final/{room_id}",
            json.dumps(
                {
                    "finalAnswer": payload.get("finalAnswer", ""),
                    "user": payload.get("user", ""),
                },
                ensure_ascii=False,
            ),
        )


async def update_role_amount(room_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    async with room_lock:
        room = room_roles.setdefault(room_id, RoomRoles())
        room.last_update = time.time()
        user = payload.get("user", "")
        role = payload.get("role", "")

        if role == "player":
            if user in room.players:
                room.players.remove(user)
            elif user == room.dealer:
                room.dealer = ""
                room.players.add(user)
            else:
                room.players.add(user)
        elif role == "dealer":
            if not room.dealer:
                room.players.discard(user)
                room.dealer = user
            elif room.dealer == user:
                room.dealer = ""

        return {"dealer": room.dealer, "playerList": list(room.players)}


def parse_json_body(body: str) -> dict[str, Any]:
    if not body:
        return {}
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def parse_sockjs_payload(raw: str, use_sockjs: bool) -> list[str]:
    if not use_sockjs:
        return [raw]
    if raw == "h":
        return []
    try:
        decoded = json.loads(raw)
    except json.JSONDecodeError:
        return [raw]
    if isinstance(decoded, list):
        return [str(item) for item in decoded]
    return [raw]


def parse_stomp_messages(payload: str) -> list[StompMessage]:
    messages: list[StompMessage] = []
    for frame in payload.split("\x00"):
        if not frame.strip():
            continue
        head, separator, body = frame.partition("\n\n")
        if not separator:
            continue
        lines = head.split("\n")
        command = lines[0].strip()
        headers: dict[str, str] = {}
        for line in lines[1:]:
            if ":" in line:
                key, value = line.split(":", 1)
                headers[key.strip()] = value.strip()
        messages.append(StompMessage(command=command, headers=headers, body=body))
    return messages


def build_frame(command: str, headers: dict[str, str] | None = None, body: str = "") -> str:
    header_lines = [command]
    for key, value in (headers or {}).items():
        header_lines.append(f"{key}:{value}")
    return "\n".join(header_lines) + "\n\n" + body + "\x00"


async def send_sockjs_message(websocket: WebSocket, frame: str, use_sockjs: bool = True) -> None:
    if use_sockjs:
        await websocket.send_text("a" + json.dumps([frame]))
    else:
        await websocket.send_text(frame)


async def send_message_to_client(client: ClientConnection, destination: str, body: str) -> None:
    subscription_id = next(
        (
            subscription_id
            for subscription_id, subscribed_destination in client.subscriptions.items()
            if subscribed_destination == destination
        ),
        "",
    )
    frame = build_frame(
        "MESSAGE",
        {
            "destination": destination,
            "content-type": "application/json;charset=UTF-8",
            "subscription": subscription_id,
            "message-id": f"msg-{int(time.time() * 1000)}",
        },
        body,
    )
    await send_sockjs_message(client.websocket, frame, client.use_sockjs)
