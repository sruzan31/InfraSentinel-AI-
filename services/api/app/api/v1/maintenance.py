from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import MaintenanceRecord, Equipment, Incident, User, Prediction, Telemetry
from ...schemas.api_schemas import MaintenanceRecordCreate, MaintenanceRecordOut

router = APIRouter(prefix="/maintenance", tags=["Maintenance Intelligence"])

@router.get("/records", response_model=List[MaintenanceRecordOut])
def list_maintenance_records(
    equipment_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(MaintenanceRecord)
    if equipment_id:
        query = query.filter(MaintenanceRecord.equipment_id == equipment_id)
    return query.order_by(MaintenanceRecord.performed_at.desc()).all()

@router.post("/records", response_model=MaintenanceRecordOut, status_code=status.HTTP_201_CREATED)
def create_maintenance_record(
    payload: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    eq = db.query(Equipment).filter(Equipment.id == payload.equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")

    rec = MaintenanceRecord(
        equipment_id=eq.id,
        incident_id=payload.incident_id,
        maintenance_type=payload.maintenance_type or "PREVENTIVE",
        technician_name=payload.technician_name or user.full_name,
        actions_performed=payload.actions_performed,
        parts_replaced=payload.parts_replaced,
        downtime_minutes=payload.downtime_minutes or 0,
        cost=payload.cost or 0.0,
        performed_at=datetime.utcnow()
    )
    db.add(rec)

    # If linked to an incident, resolve it
    if payload.incident_id:
        inc = db.query(Incident).filter(Incident.id == payload.incident_id).first()
        if inc:
            inc.status = "RESOLVED"
            inc.resolved_at = datetime.utcnow()

    # Reset equipment health score after maintenance
    eq.status = "OPERATIONAL"
    eq.health_score = min(100.0, eq.health_score + 25.0)

    db.commit()
    db.refresh(rec)
    return rec

@router.get("/recommendations/{equipment_id}")
def get_ai_recommendations(
    equipment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")

    last_pred = (
        db.query(Prediction)
        .filter(Prediction.equipment_id == equipment_id)
        .order_by(Prediction.timestamp.desc())
        .first()
    )
    last_telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.equipment_id == equipment_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    risk_prob = last_pred.failure_risk_probability if last_pred else 0.05
    failure_mode = last_pred.predicted_failure_mode if last_pred else "NONE"

    tasks = []
    urgency = "LOW"
    
    if risk_prob >= 0.75:
        urgency = "IMMEDIATE"
        tasks = [
            {"task": "Halt operating cycle and conduct visual inspection of casing and impeller.", "priority": "P1", "estimated_hours": 1.5},
            {"task": "Check oil lubrication level and screen for particulate metal contamination.", "priority": "P1", "estimated_hours": 0.5},
            {"task": "Perform infrared thermography scan on bearing housings and motor stator.", "priority": "P1", "estimated_hours": 1.0},
            {"task": "Replace impeller blades if cumulative wear exceeds 200 minutes.", "priority": "P2", "estimated_hours": 3.0},
        ]
    elif risk_prob >= 0.45:
        urgency = "MEDIUM"
        tasks = [
            {"task": "Schedule acoustic vibration analysis during next scheduled shift change.", "priority": "P2", "estimated_hours": 1.0},
            {"task": "Inspect cooling jackets and flush fluid passages to restore thermal gradient.", "priority": "P2", "estimated_hours": 2.0},
            {"task": "Calibrate torque sensor and verify electrical power draw balance.", "priority": "P3", "estimated_hours": 1.0},
        ]
    else:
        urgency = "ROUTINE"
        tasks = [
            {"task": "Standard 500-hour preventive lubrication and seal tightness check.", "priority": "P4", "estimated_hours": 0.5},
            {"task": "Log sensor baseline values into maintenance audit trail.", "priority": "P4", "estimated_hours": 0.25},
        ]

    return {
        "equipment_id": eq.id,
        "equipment_name": eq.name,
        "equipment_code": eq.code,
        "risk_probability": risk_prob,
        "predicted_mode": failure_mode,
        "urgency": urgency,
        "recommended_tasks": tasks,
        "last_inspection": datetime.utcnow().strftime("%Y-%m-%d"),
    }
