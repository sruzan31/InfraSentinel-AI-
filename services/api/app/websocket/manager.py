import json
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger("infrasentinel.websocket")

class ConnectionManager:
    def __init__(self):
        # Global listeners receiving all equipment telemetry
        self.global_connections: List[WebSocket] = []
        # Listeners filtered by equipment_id
        self.equipment_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, equipment_id: int = None):
        await websocket.accept()
        if equipment_id is None:
            self.global_connections.append(websocket)
            logger.info("New global WebSocket subscriber connected.")
        else:
            if equipment_id not in self.equipment_connections:
                self.equipment_connections[equipment_id] = []
            self.equipment_connections[equipment_id].append(websocket)
            logger.info(f"New WebSocket subscriber connected for Equipment ID {equipment_id}.")

    def disconnect(self, websocket: WebSocket, equipment_id: int = None):
        if equipment_id is None:
            if websocket in self.global_connections:
                self.global_connections.remove(websocket)
        else:
            if equipment_id in self.equipment_connections:
                if websocket in self.equipment_connections[equipment_id]:
                    self.equipment_connections[equipment_id].remove(websocket)

    async def broadcast_telemetry(self, data: Dict[str, Any]):
        message = json.dumps(data)
        equipment_id = data.get("equipment_id")

        # Broadcast to global subscribers
        dead_global = []
        for connection in self.global_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_global.append(connection)
        for dead in dead_global:
            self.disconnect(dead)

        # Broadcast to equipment-specific subscribers
        if equipment_id and equipment_id in self.equipment_connections:
            dead_eq = []
            for connection in self.equipment_connections[equipment_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    dead_eq.append(connection)
            for dead in dead_eq:
                self.disconnect(dead, equipment_id)

ws_manager = ConnectionManager()
