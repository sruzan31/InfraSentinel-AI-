import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .core.init_db import init_db
from .websocket.manager import ws_manager

# Import API Routers
from .api.v1.auth import router as auth_router
from .api.v1.equipment import router as equipment_router
from .api.v1.sensors import router as sensors_router
from .api.v1.telemetry import router as telemetry_router
from .api.v1.predictions import router as predictions_router
from .api.v1.anomalies import router as anomalies_router
from .api.v1.alerts import router as alerts_router
from .api.v1.incidents import router as incidents_router
from .api.v1.maintenance import router as maintenance_router
from .api.v1.models import router as models_router
from .api.v1.analytics import router as analytics_router
from .api.v1.reports import router as reports_router
from .api.v1.simulator import router as simulator_router

logging.basicConfig(level=settings.LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("infrasentinel.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    init_db()
    yield
    logger.info("Shutting down InfraSentinel AI API...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Enterprise Critical Infrastructure Failure Prediction, Anomaly Detection & Incident Response Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow development and production origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(equipment_router, prefix=api_v1_prefix)
app.include_router(sensors_router, prefix=api_v1_prefix)
app.include_router(telemetry_router, prefix=api_v1_prefix)
app.include_router(predictions_router, prefix=api_v1_prefix)
app.include_router(anomalies_router, prefix=api_v1_prefix)
app.include_router(alerts_router, prefix=api_v1_prefix)
app.include_router(incidents_router, prefix=api_v1_prefix)
app.include_router(maintenance_router, prefix=api_v1_prefix)
app.include_router(models_router, prefix=api_v1_prefix)
app.include_router(analytics_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(simulator_router, prefix=api_v1_prefix)

# WebSocket Real-Time Telemetry Stream
@app.websocket("/ws/telemetry")
async def websocket_telemetry_global(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keepalive receiver
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.websocket("/ws/telemetry/{equipment_id}")
async def websocket_telemetry_equipment(websocket: WebSocket, equipment_id: int):
    await ws_manager.connect(websocket, equipment_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, equipment_id)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "infrasentinel-api",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }
