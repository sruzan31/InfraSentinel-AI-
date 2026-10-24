from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Anomaly, User
from ...schemas.api_schemas import AnomalyOut

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection"])

@router.get("/history/{equipment_id}", response_model=List[AnomalyOut])
def get_anomaly_history(
    equipment_id: int,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    anoms = (
        db.query(Anomaly)
        .filter(Anomaly.equipment_id == equipment_id)
        .order_by(Anomaly.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        AnomalyOut(
            id=a.id,
            equipment_id=a.equipment_id,
            timestamp=a.timestamp,
            anomaly_score=a.anomaly_score,
            is_anomaly=a.is_anomaly,
            affected_sensors=a.affected_sensors,
            details=a.details_json
        ) for a in reversed(anoms)
    ]

@router.get("/recent", response_model=List[AnomalyOut])
def get_recent_anomalies(
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    anoms = (
        db.query(Anomaly)
        .filter(Anomaly.is_anomaly == True)
        .order_by(Anomaly.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        AnomalyOut(
            id=a.id,
            equipment_id=a.equipment_id,
            timestamp=a.timestamp,
            anomaly_score=a.anomaly_score,
            is_anomaly=a.is_anomaly,
            affected_sensors=a.affected_sensors,
            details=a.details_json
        ) for a in anoms
    ]
