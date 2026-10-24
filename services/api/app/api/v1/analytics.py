from typing import Dict, Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Equipment, Alert, Incident, Anomaly, Telemetry, User

router = APIRouter(prefix="/analytics", tags=["Analytics & Health Overview"])

@router.get("/overview")
def get_fleet_analytics_overview(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    total_eq = db.query(Equipment).count()
    operational_eq = db.query(Equipment).filter(Equipment.status == "OPERATIONAL").count()
    warning_eq = db.query(Equipment).filter(Equipment.status == "WARNING").count()
    critical_eq = db.query(Equipment).filter(Equipment.status == "CRITICAL").count()

    active_anomalies = db.query(Anomaly).filter(Anomaly.is_anomaly == True).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "CRITICAL", Alert.status == "ACTIVE").count()
    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").count()
    open_incidents = db.query(Incident).filter(Incident.status.in_(["OPEN", "INVESTIGATING", "IN_PROGRESS"])).count()

    # Calculate average fleet health score
    avg_health = db.query(func.avg(Equipment.health_score)).scalar() or 95.0

    return {
        "total_equipment": total_eq,
        "operational_equipment": operational_eq,
        "warning_equipment": warning_eq,
        "critical_equipment": critical_eq,
        "active_anomalies": active_anomalies,
        "critical_alerts": critical_alerts,
        "active_alerts": active_alerts,
        "open_incidents": open_incidents,
        "fleet_health_score": round(float(avg_health), 1),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/trends")
def get_fleet_trends(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Simulated 24-hour fleet trend data points for dashboard charts
    now = datetime.utcnow()
    points = []
    for i in range(12, -1, -1):
        t = now - timedelta(hours=i*2)
        points.append({
            "timestamp": t.strftime("%H:%M"),
            "health_score": round(94.0 + (i % 3) * 1.5 - ((12-i) % 2) * 1.2, 1),
            "anomalies": max(0, int((i * 2 + 1) % 4)),
            "alerts": max(0, int((i + 2) % 3)),
        })

    # Severity distribution
    critical_count = db.query(Alert).filter(Alert.severity == "CRITICAL").count()
    high_count = db.query(Alert).filter(Alert.severity == "HIGH").count()
    warn_count = db.query(Alert).filter(Alert.severity == "WARNING").count()
    info_count = db.query(Alert).filter(Alert.severity == "INFO").count()

    return {
        "timeline": points,
        "alert_distribution": [
            {"name": "Critical", "count": critical_count, "color": "#EF4444"},
            {"name": "High", "count": high_count, "color": "#F97316"},
            {"name": "Warning", "count": warn_count, "color": "#F59E0B"},
            {"name": "Info", "count": info_count, "color": "#3B82F6"},
        ]
    }
