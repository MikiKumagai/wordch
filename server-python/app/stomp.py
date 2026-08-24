import asyncio
import json
import time
from collections import defaultdict
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from app.db import insert_user_theme, select_random_default_values, select_random_themes
from app.rooms import update_role_amount


class StompMessage(BaseModel):
    command: str
    headers: dict[str, str] = Field(default_factory=dict)
    body: str = ""


class ClientConnection:
    # WebSocket接続とSockJS利用有無、購読先を保持する。
    def __init__(self, websocket: WebSocket, use_sockjs: bool) -> None:
        self.websocket = websocket
        self.use_sockjs = use_sockjs
        self.subscriptions: dict[str, str] = {}


class Broker:
    # 接続中クライアントとtopic購読状態を初期化する。
    def __init__(self) -> None:
        self._clients: set[ClientConnection] = set()
        self._topics: dict[str, set[ClientConnection]] = defaultdict(set)
        self._lock = asyncio.Lock()

    # クライアントをブローカーに登録する。
    async def connect(self, client: ClientConnection) -> None:
        async with self._lock:
            self._clients.add(client)

    # 切断されたクライアントと購読情報をブローカーから外す。
    async def disconnect(self, client: ClientConnection) -> None:
        async with self._lock:
            self._clients.discard(client)
            for destination in list(client.subscriptions.values()):
                self._topics[destination].discard(client)
            client.subscriptions.clear()

    # クライアントを指定topicに購読登録する。
    async def subscribe(self, client: ClientConnection, subscription_id: str, destination: str) -> None:
        async with self._lock:
            client.subscriptions[subscription_id] = destination
            self._topics[destination].add(client)

    # クライアントの指定購読を解除する。
    async def unsubscribe(self, client: ClientConnection, subscription_id: str) -> None:
        async with self._lock:
            destination = client.subscriptions.pop(subscription_id, None)
            if destination is not None:
                self._topics[destination].discard(client)

    # 指定topicを購読している全クライアントへメッセージを配信する。
    async def publish(self, destination: str, body: str) -> None:
        async with self._lock:
            subscribers = list(self._topics.get(destination, set()))
        await asyncio.gather(
            *(send_message_to_client(client, destination, body) for client in subscribers),
            return_exceptions=True,
        )


broker = Broker()


# WebSocket接続を受け取り、STOMPフレームを読み続ける。
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


# STOMPコマンドごとの処理へ振り分ける。
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


# /app/... 宛ての送信内容をゲーム処理へ変換する。
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
        await publish_json(f"/topic/answer/{room_id}", {"answer": payload.get("answer", "")})
    elif action == "winner":
        await publish_json(f"/topic/winner/{room_id}", {"winner": payload.get("winner", "")})
    elif action == "prepared":
        await handle_prepared(room_id, payload)
    elif action == "role":
        role_amount = await update_role_amount(room_id, payload)
        await publish_json(f"/topic/role_amount/{room_id}", role_amount)
    elif action == "final" and parts[2] == "select":
        await publish_json(
            f"/topic/final/select/{room_id}",
            {"finalWinner": payload.get("finalWinner", "")},
        )
    elif action == "final" and parts[2] == "theme":
        await broker.publish(f"/topic/final/theme/{room_id}", json.dumps(True))
    elif action == "final":
        await publish_json(
            f"/topic/final/{room_id}",
            {
                "finalAnswer": payload.get("finalAnswer", ""),
                "user": payload.get("user", ""),
            },
        )


# テーマ選択完了メッセージを処理し、必要ならユーザー入力テーマを保存する。
async def handle_prepared(room_id: str, payload: dict[str, Any]) -> None:
    theme = payload.get("theme", "")
    if payload.get("isUserInput") is True and theme:
        insert_user_theme(theme)
    await broker.publish(f"/topic/prepared/{room_id}", theme)


# dictをJSON文字列にしてtopicへ配信する。
async def publish_json(destination: str, payload: dict[str, Any]) -> None:
    await broker.publish(destination, json.dumps(payload, ensure_ascii=False))


# STOMP bodyをJSON dictとして読み取る。
def parse_json_body(body: str) -> dict[str, Any]:
    if not body:
        return {}
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


# SockJS形式または素のWebSocket形式の受信データからSTOMPペイロードを取り出す。
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


# STOMPペイロード文字列をフレーム単位に分解する。
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


# STOMP送信用のフレーム文字列を組み立てる。
def build_frame(command: str, headers: dict[str, str] | None = None, body: str = "") -> str:
    header_lines = [command]
    for key, value in (headers or {}).items():
        header_lines.append(f"{key}:{value}")
    return "\n".join(header_lines) + "\n\n" + body + "\x00"


# 接続方式に合わせてSTOMPフレームをWebSocketへ送信する。
async def send_sockjs_message(websocket: WebSocket, frame: str, use_sockjs: bool = True) -> None:
    if use_sockjs:
        await websocket.send_text("a" + json.dumps([frame]))
    else:
        await websocket.send_text(frame)


# クライアントの購読IDを付けてMESSAGEフレームを送信する。
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
