import asyncio
import time
from typing import Any

from app.config import ROOM_EXPIRATION_SECONDS


class RoomRoles:
    # 部屋ごとの親と参加プレイヤー一覧を初期化する。
    def __init__(self) -> None:
        self.dealer = ""
        self.players: set[str] = set()
        self.last_update = time.time()


room_roles: dict[str, RoomRoles] = {}
room_lock = asyncio.Lock()


# 一定時間更新されていない部屋の役職状態を削除する。
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


# 役職選択メッセージを反映し、現在の親とプレイヤー一覧を返す。
async def update_role_amount(room_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    async with room_lock:
        room = room_roles.setdefault(room_id, RoomRoles())
        room.last_update = time.time()
        user = payload.get("user", "")
        role = payload.get("role", "")

        # 同じ役職の再選択は解除扱いにし、親は1人だけにする。
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
