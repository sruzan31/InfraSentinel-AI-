import asyncio
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from simulator.engine import simulator_engine
from ...core.database import SessionLocal
from ...models.entities import Equipment
from .telemetry import process_and_broadcast, Telemetry

logger = logging.getLogger("infrasentinel.api.simulator")
router = APIRouter(prefix="/simulator", tags=["Telemetry Simulator Control"])

class ScenarioRequest(BaseModel):
    scenario: str

class TargetEquipmentRequest(BaseModel):
    equipment_id: int

class SpeedRequest(BaseModel):
    interval_seconds: float

# Background simulation worker
_sim_task: Optional[asyncio.Task] = None
_is_active = False

async def _simulation_worker():
    global _is_active
    logger.info("Simulator background worker started.")
    while _is_active:
        try:
            payload = simulator_engine.generate_reading()
            db = SessionLocal()
            try:
                eq = db.query(Equipment).filter(Equipment.id == payload["equipment_id"]).first()
                if eq:
                    t_obj = Telemetry(
                        equipment_id=eq.id,
                        air_temp_k=payload["air_temp_k"],
                        process_temp_k=payload["process_temp_k"],
                        rotational_speed_rpm=payload["rotational_speed_rpm"],
                        torque_nm=payload["torque_nm"],
                        tool_wear_min=payload["tool_wear_min"],
                        vibration_mms=payload["vibration_mms"],
                        pressure_bar=payload["pressure_bar"],
                        scenario=payload["scenario"],
                        is_simulated=True
                    )
                    db.add(t_obj)
                    db.commit()
                    db.refresh(t_obj)
                    await process_and_broadcast(db, eq, t_obj)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Simulator worker tick error: {e}")
        await asyncio.sleep(simulator_engine.interval)

@router.get("/status")
def get_simulator_status():
    global _is_active
    return {
        "is_running": _is_active,
        "current_scenario": simulator_engine.current_scenario,
        "available_scenarios": simulator_engine.SCENARIOS,
        "target_equipment_id": simulator_engine.target_equipment_id,
        "interval_seconds": simulator_engine.interval,
        "total_steps": simulator_engine.step_count
    }

@router.post("/start")
async def start_simulator():
    global _is_active, _sim_task
    if _is_active:
        return {"message": "Simulator is already running."}
    _is_active = True
    _sim_task = asyncio.create_task(_simulation_worker())
    return {"message": "Simulator started successfully.", "scenario": simulator_engine.current_scenario}

@router.post("/pause")
def pause_simulator():
    global _is_active, _sim_task
    _is_active = False
    if _sim_task:
        _sim_task.cancel()
        _sim_task = None
    return {"message": "Simulator paused successfully."}

@router.post("/scenario")
def set_simulator_scenario(req: ScenarioRequest):
    if req.scenario not in simulator_engine.SCENARIOS:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Must be one of {simulator_engine.SCENARIOS}")
    simulator_engine.set_scenario(req.scenario)
    return {"message": f"Scenario changed to {req.scenario}", "scenario": req.scenario}

@router.post("/equipment/{equipment_id}")
def set_simulator_equipment(equipment_id: int):
    simulator_engine.target_equipment_id = equipment_id
    return {"message": f"Target equipment set to {equipment_id}", "equipment_id": equipment_id}

@router.post("/speed")
def set_simulator_speed(req: SpeedRequest):
    if req.interval_seconds < 0.2:
        raise HTTPException(status_code=400, detail="Minimum interval is 0.2 seconds")
    simulator_engine.interval = req.interval_seconds
    return {"message": f"Interval set to {req.interval_seconds}s", "interval_seconds": req.interval_seconds}

@router.post("/tick")
async def trigger_manual_tick():
    payload = simulator_engine.generate_reading()
    db = SessionLocal()
    try:
        eq = db.query(Equipment).filter(Equipment.id == payload["equipment_id"]).first()
        if not eq:
            raise HTTPException(status_code=404, detail="Target equipment not found")
        t_obj = Telemetry(
            equipment_id=eq.id,
            air_temp_k=payload["air_temp_k"],
            process_temp_k=payload["process_temp_k"],
            rotational_speed_rpm=payload["rotational_speed_rpm"],
            torque_nm=payload["torque_nm"],
            tool_wear_min=payload["tool_wear_min"],
            vibration_mms=payload["vibration_mms"],
            pressure_bar=payload["pressure_bar"],
            scenario=payload["scenario"],
            is_simulated=True
        )
        db.add(t_obj)
        db.commit()
        db.refresh(t_obj)
        await process_and_broadcast(db, eq, t_obj)
        return {
            "message": "Manual tick generated successfully",
            "telemetry_id": t_obj.id,
            "scenario": payload["scenario"],
            "measurements": payload
        }
    finally:
        db.close()
