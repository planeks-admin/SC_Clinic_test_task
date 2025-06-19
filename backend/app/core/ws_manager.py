from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_events(self, event: str):
        payload = {"type": "event", "data": event}
        serializable = jsonable_encoder(payload)
        for connection in self.active_connections:
            await connection.send_json(serializable)

manager = ConnectionManager()