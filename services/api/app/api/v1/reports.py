from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Equipment, Alert, Incident, MaintenanceRecord, User

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("/summary")
def get_executive_report_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    equipments = db.query(Equipment).all()
    incidents = db.query(Incident).all()
    maintenance = db.query(MaintenanceRecord).all()
    alerts = db.query(Alert).all()

    eq_summary = [
        {
            "code": e.code,
            "name": e.name,
            "status": e.status,
            "health_score": e.health_score,
            "location": e.location
        }
        for e in equipments
    ]

    inc_summary = [
        {
            "number": inc.incident_number,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "created_at": inc.created_at.isoformat()
        }
        for inc in incidents
    ]

    return {
        "report_id": f"REP-{datetime.utcnow().strftime('%Y%m%d-%H%M')}",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "generated_by": user.full_name,
        "equipment_count": len(equipments),
        "total_incidents": len(incidents),
        "total_maintenance_records": len(maintenance),
        "equipment": eq_summary,
        "incidents": inc_summary
    }

@router.get("/export/csv")
def export_csv_report(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    equipments = db.query(Equipment).all()
    csv_lines = ["Equipment Code,Name,Type,Status,Health Score,Location,Created At"]
    for e in equipments:
        csv_lines.append(
            f'"{e.code}","{e.name}","{e.equipment_type}","{e.status}",{e.health_score},"{e.location}","{e.created_at}"'
        )
    content = "\n".join(csv_lines)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=infrasentinel_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
