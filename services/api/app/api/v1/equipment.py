from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Equipment, Sensor, User
from ...schemas.api_schemas import EquipmentCreate, EquipmentUpdate, EquipmentOut, SensorOut

router = APIRouter(prefix="/equipment", tags=["Equipment Management"])

@router.get("/", response_model=List[EquipmentOut])
def list_equipment(
    status: Optional[str] = None,
    equipment_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Equipment)
    if status:
        query = query.filter(Equipment.status == status.upper())
    if equipment_type:
        query = query.filter(Equipment.equipment_type == equipment_type.lower())
    if search:
        query = query.filter(
            (Equipment.name.ilike(f"%{search}%")) | (Equipment.code.ilike(f"%{search}%"))
        )
    return query.order_by(Equipment.id.asc()).all()

@router.post("/", response_model=EquipmentOut, status_code=status.HTTP_201_CREATED)
def create_equipment(
    payload: EquipmentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    existing = db.query(Equipment).filter(Equipment.code == payload.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Equipment with code '{payload.code}' already exists."
        )

    eq = Equipment(
        org_id=user.org_id,
        name=payload.name,
        code=payload.code,
        equipment_type=payload.equipment_type or "pump",
        quality_type=payload.quality_type or "L",
        model_number=payload.model_number or "IS-PUMP-4000",
        location=payload.location or "Plant Sector A",
        status="OPERATIONAL",
        health_score=99.0,
        created_at=datetime.utcnow()
    )
    db.add(eq)
    db.flush()

    # Automatically provision standard sensor telemetry suite
    default_sensors = [
        {"name": "Ambient Air Temperature", "sensor_type": "temperature_air", "unit": "K", "min": 290.0, "max": 310.0, "warn": 305.0},
        {"name": "Process Fluid Temperature", "sensor_type": "temperature_process", "unit": "K", "min": 300.0, "max": 320.0, "warn": 315.0},
        {"name": "Drive Shaft Speed", "sensor_type": "rotational_speed", "unit": "rpm", "min": 1100.0, "max": 2900.0, "warn": 2700.0},
        {"name": "Drive Shaft Torque", "sensor_type": "torque", "unit": "Nm", "min": 3.0, "max": 80.0, "warn": 65.0},
        {"name": "Impeller / Blade Wear", "sensor_type": "tool_wear", "unit": "min", "min": 0.0, "max": 250.0, "warn": 200.0},
        {"name": "Casing Radial Vibration", "sensor_type": "vibration", "unit": "mm/s", "min": 0.5, "max": 15.0, "warn": 7.0},
        {"name": "Discharge Hydraulic Pressure", "sensor_type": "pressure", "unit": "bar", "min": 1.0, "max": 10.0, "warn": 7.5},
    ]

    for s in default_sensors:
        sensor = Sensor(
            equipment_id=eq.id,
            name=s["name"],
            sensor_type=s["sensor_type"],
            unit=s["unit"],
            min_threshold=s["min"],
            max_threshold=s["max"],
            warning_threshold=s["warn"],
            is_active=True
        )
        db.add(sensor)

    db.commit()
    db.refresh(eq)
    return eq

@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment_detail(
    equipment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")
    return eq

@router.patch("/{equipment_id}", response_model=EquipmentOut)
def update_equipment(
    equipment_id: int,
    payload: EquipmentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")

    if payload.name is not None: eq.name = payload.name
    if payload.status is not None: eq.status = payload.status
    if payload.health_score is not None: eq.health_score = payload.health_score
    if payload.location is not None: eq.location = payload.location

    eq.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(eq)
    return eq

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")
    db.delete(eq)
    db.commit()
    return None
