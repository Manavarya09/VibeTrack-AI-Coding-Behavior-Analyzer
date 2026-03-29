from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

    async def broadcast(self, message: dict):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                await connection.send_json(message)


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await websocket.send_json(
                    {"type": "pong", "timestamp": message.get("timestamp")}
                )
            elif message.get("type") == "session_update":
                await manager.send_personal_message(
                    {
                        "type": "session_update",
                        "session_id": message.get("session_id"),
                        "data": message.get("data"),
                    },
                    user_id,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
