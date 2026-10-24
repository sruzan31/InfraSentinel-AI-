from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Sensor, User
from ...schemas.api_schemas import SensorOut, SensorCreate

router = APIRouter(prefix="/sensors", tags=["Sensors"])

@router.get("/", response_model=List[SensorOut])
def list_sensors(
    equipment_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Sensor)
    if equipment_id:
        query = query.filter(Sensor.equipment_id == equipment_id)
    return query.all()

@router.post("/{equipment_id}", response_model=SensorOut, status_code=status.HTTP_201_CREATED)
def add_sensor_to_equipment(
    equipment_id: int,
    payload: SensorCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    sensor = Sensor(
        equipment_id=equipment_id,
        name=payload.name,
        sensor_type=payload.sensor_type,
        unit=payload.unit,
        min_threshold=payload.min_threshold,
        max_threshold=payload.max_threshold,
        warning_threshold=payload.warning_threshold,
        is_active=True
    )
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor
