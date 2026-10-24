from datetime import datetime, timedelta
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models.entities import Alert, Incident, Equipment, Telemetry, Prediction, Anomaly

logger = logging.getLogger("infrasentinel.alert_engine")

class AlertEngine:
    COOLDOWN_MINUTES = 3 # Suppress duplicate alerts for same rule on same equipment within 3 mins

    @classmethod
    def evaluate_telemetry_and_predictions(
        cls,
        db: Session,
        equipment: Equipment,
        telemetry: Telemetry,
        prediction: Optional[Prediction] = None,
        anomaly: Optional[Anomaly] = None
    ) -> Optional[Alert]:
        alerts_generated = []

        now = datetime.utcnow()
        cooldown_threshold = now - timedelta(minutes=cls.COOLDOWN_MINUTES)

        # 1. Supervised Failure Risk Rule
        if prediction and prediction.failure_risk_probability >= 0.45:
            severity = "CRITICAL" if prediction.failure_risk_probability >= 0.75 else "HIGH"
            rule_code = "RISK_THRESHOLD"
            title = f"Elevated Failure Risk: {equipment.name} ({prediction.failure_risk_probability*100:.1f}%)"
            msg = (
                f"ML model flagged {equipment.name} ({equipment.code}) with {prediction.risk_category} failure risk. "
                f"Predicted Mode: {prediction.predicted_failure_mode}. {prediction.explanation_summary or ''}"
            )
            val = f"{prediction.failure_risk_probability*100:.1f}% risk"
            alert = cls._create_alert_if_not_duplicate(
                db, equipment.id, rule_code, severity, title, msg, val, cooldown_threshold
            )
            if alert: alerts_generated.append(alert)

        # 2. Unsupervised Anomaly Spike Rule
        if anomaly and anomaly.is_anomaly and anomaly.anomaly_score >= 0.65:
            rule_code = "ANOMALY_SPIKE"
            severity = "HIGH" if anomaly.anomaly_score >= 0.80 else "WARNING"
            title = f"Multivariate Anomaly Detected: {equipment.name}"
            msg = f"Isolation Forest detected abnormal sensor divergence (score: {anomaly.anomaly_score:.2f}). Affected: {anomaly.affected_sensors}"
            val = f"Score: {anomaly.anomaly_score:.2f}"
            alert = cls._create_alert_if_not_duplicate(
                db, equipment.id, rule_code, severity, title, msg, val, cooldown_threshold
            )
            if alert: alerts_generated.append(alert)

        # 3. Process Temperature Thermal Runaway Rule
        temp_diff = telemetry.process_temp_k - telemetry.air_temp_k
        if temp_diff < 8.6 and telemetry.rotational_speed_rpm < 1380:
            rule_code = "TEMP_RUNAWAY"
            severity = "CRITICAL"
            title = f"Heat Dissipation Failure Warning: {equipment.name}"
            msg = f"Thermal gradient ({temp_diff:.1f} K) below safe dissipation threshold (8.6 K) at low RPM ({telemetry.rotational_speed_rpm:.0f} RPM)."
            val = f"Delta T: {temp_diff:.1f} K"
            alert = cls._create_alert_if_not_duplicate(
                db, equipment.id, rule_code, severity, title, msg, val, cooldown_threshold
            )
            if alert: alerts_generated.append(alert)

        # 4. Severe Vibration Spike Rule
        if telemetry.vibration_mms >= 7.0:
            rule_code = "VIB_EXCESS"
            severity = "CRITICAL" if telemetry.vibration_mms >= 10.0 else "HIGH"
            title = f"Excessive Mechanical Vibration: {equipment.name}"
            msg = f"Vibration level is {telemetry.vibration_mms:.2f} mm/s, exceeding ISO 10816 Zone D (Dangerous) limit."
            val = f"{telemetry.vibration_mms:.2f} mm/s"
            alert = cls._create_alert_if_not_duplicate(
                db, equipment.id, rule_code, severity, title, msg, val, cooldown_threshold
            )
            if alert: alerts_generated.append(alert)

        # Update Equipment Status & Health Score based on alerts
        if any(a.severity == "CRITICAL" for a in alerts_generated):
            equipment.status = "CRITICAL"
            equipment.health_score = max(20.0, equipment.health_score - 25.0)
        elif any(a.severity == "HIGH" for a in alerts_generated):
            if equipment.status != "CRITICAL": equipment.status = "WARNING"
            equipment.health_score = max(50.0, equipment.health_score - 10.0)
        elif prediction and prediction.failure_risk_probability < 0.20 and (not anomaly or not anomaly.is_anomaly):
            # Recovery trend
            if equipment.status not in ["MAINTENANCE", "CRITICAL"]:
                equipment.status = "OPERATIONAL"
            equipment.health_score = min(100.0, equipment.health_score + 0.5)

        db.commit()

        # If a CRITICAL alert was generated, auto-escalate to an Incident!
        for alert in alerts_generated:
            if alert.severity == "CRITICAL":
                cls._auto_escalate_incident(db, equipment, alert)

        return alerts_generated[0] if alerts_generated else None

    @classmethod
    def _create_alert_if_not_duplicate(
        cls, db: Session, equipment_id: int, rule_code: str, severity: str,
        title: str, message: str, val: str, cooldown_threshold: datetime
    ) -> Optional[Alert]:
        existing = db.query(Alert).filter(
            Alert.equipment_id == equipment_id,
            Alert.rule_code == rule_code,
            Alert.status == "ACTIVE",
            Alert.timestamp >= cooldown_threshold
        ).first()

        if existing:
            # Suppress duplicate
            return None

        alert = Alert(
            equipment_id=equipment_id,
            rule_code=rule_code,
            severity=severity,
            title=title,
            message=message,
            triggered_value=val,
            status="ACTIVE",
            timestamp=datetime.utcnow()
        )
        db.add(alert)
        db.flush()
        logger.info(f"Generated {severity} Alert: {title} for Equipment ID {equipment_id}")
        return alert

    @classmethod
    def _auto_escalate_incident(cls, db: Session, equipment: Equipment, alert: Alert):
        existing_incident = db.query(Incident).filter(
            Incident.equipment_id == equipment.id,
            Incident.status.in_(["OPEN", "INVESTIGATING", "IN_PROGRESS"])
        ).first()

        if existing_incident:
            return existing_incident

        inc_count = db.query(Incident).count() + 1
        incident_number = f"INC-{equipment.code}-{inc_count:04d}"

        incident = Incident(
            equipment_id=equipment.id,
            alert_id=alert.id,
            incident_number=incident_number,
            title=f"Critical Incident: {alert.title}",
            description=f"Auto-escalated from critical alert {alert.id}. {alert.message}",
            severity="CRITICAL",
            priority="P1",
            status="OPEN",
            created_at=datetime.utcnow()
        )
        db.add(incident)
        db.flush()
        logger.info(f"Auto-escalated Incident {incident_number} for Equipment {equipment.name}")
        return incident
