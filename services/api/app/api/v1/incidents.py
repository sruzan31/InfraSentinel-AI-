from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Incident, Equipment, User
from ...schemas.api_schemas import IncidentCreate, IncidentUpdate, IncidentOut

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.get("/", response_model=List[IncidentOut])
def list_incidents(
    equipment_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Incident)
    if equipment_id:
        query = query.filter(Incident.equipment_id == equipment_id)
    if status_filter:
        query = query.filter(Incident.status == status_filter.upper())
    if severity:
        query = query.filter(Incident.severity == severity.upper())
    return query.order_by(Incident.created_at.desc()).all()

@router.post("/", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    eq = db.query(Equipment).filter(Equipment.id == payload.equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")

    count = db.query(Incident).count() + 1
    incident_number = f"INC-{eq.code}-{count:04d}"

    inc = Incident(
        equipment_id=eq.id,
        alert_id=payload.alert_id,
        incident_number=incident_number,
        title=payload.title,
        description=payload.description or f"Manual incident created by {user.full_name}",
        severity=payload.severity or "HIGH",
        priority=payload.priority or "P2",
        status="OPEN",
        assigned_to_user_id=payload.assigned_to_user_id or user.id,
        created_at=datetime.utcnow()
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)
    return inc

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    return inc

@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    if payload.title is not None: inc.title = payload.title
    if payload.description is not None: inc.description = payload.description
    if payload.severity is not None: inc.severity = payload.severity.upper()
    if payload.priority is not None: inc.priority = payload.priority.upper()
    if payload.assigned_to_user_id is not None: inc.assigned_to_user_id = payload.assigned_to_user_id

    if payload.status is not None:
        new_status = payload.status.upper()
        inc.status = new_status
        if new_status in ["RESOLVED", "CLOSED"] and not inc.resolved_at:
            inc.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)
    return inc
