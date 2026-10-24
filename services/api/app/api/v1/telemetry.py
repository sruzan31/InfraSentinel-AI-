from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Equipment, Telemetry, Prediction, Anomaly, User
from ...schemas.api_schemas import TelemetryCreate, TelemetryOut
from ...ml.inference import inference_service
from ...services.alert_engine import AlertEngine
from ...websocket.manager import ws_manager

router = APIRouter(prefix="/telemetry", tags=["Telemetry Stream"])

async def process_and_broadcast(db: Session, eq: Equipment, telemetry_obj: Telemetry):
    # 1. Feature engineering
    feat_payload = {
        "air_temp_k": telemetry_obj.air_temp_k,
        "process_temp_k": telemetry_obj.process_temp_k,
        "rotational_speed_rpm": telemetry_obj.rotational_speed_rpm,
        "torque_nm": telemetry_obj.torque_nm,
        "tool_wear_min": telemetry_obj.tool_wear_min,
    }
    features = inference_service.engineer_features(feat_payload, quality_type=eq.quality_type)

    # 2. Supervised Failure Risk Prediction
    prob, risk_cat, failure_mode, is_flagged = inference_service.predict_failure_risk(features)

    # 3. Unsupervised Anomaly Detection
    anomaly_score, is_anomaly, affected_sensors, anomaly_details = inference_service.detect_anomalies(features)

    # 4. Explainable AI SHAP Attribution
    contributions, explanation_summary = inference_service.compute_explanations(features, prob, failure_mode)

    # 5. Persist Prediction record
    pred = Prediction(
        equipment_id=eq.id,
        timestamp=telemetry_obj.timestamp,
        model_version=inference_service.metadata.get("model_version", "1.0.0"),
        failure_risk_probability=prob,
        risk_category=risk_cat,
        predicted_failure_mode=failure_mode,
        is_flagged=is_flagged,
        feature_importance_json=contributions,
        explanation_summary=explanation_summary
    )
    db.add(pred)

    # 6. Persist Anomaly record
    anom = Anomaly(
        equipment_id=eq.id,
        timestamp=telemetry_obj.timestamp,
        anomaly_score=anomaly_score,
        is_anomaly=is_anomaly,
        affected_sensors=affected_sensors,
        details_json=anomaly_details
    )
    db.add(anom)
    db.flush()

    # 7. Evaluate Alert Rules
    alert = AlertEngine.evaluate_telemetry_and_predictions(
        db, equipment=eq, telemetry=telemetry_obj, prediction=pred, anomaly=anom
    )

    # 8. Broadcast over WebSocket
    broadcast_data = {
        "type": "telemetry_update",
        "equipment_id": eq.id,
        "equipment_code": eq.code,
        "equipment_name": eq.name,
        "equipment_status": eq.status,
        "health_score": eq.health_score,
        "timestamp": telemetry_obj.timestamp.isoformat() + "Z",
        "measurements": {
            "air_temp_k": telemetry_obj.air_temp_k,
            "process_temp_k": telemetry_obj.process_temp_k,
            "temp_diff_k": round(telemetry_obj.process_temp_k - telemetry_obj.air_temp_k, 2),
            "rotational_speed_rpm": telemetry_obj.rotational_speed_rpm,
            "torque_nm": telemetry_obj.torque_nm,
            "tool_wear_min": telemetry_obj.tool_wear_min,
            "vibration_mms": telemetry_obj.vibration_mms,
            "pressure_bar": telemetry_obj.pressure_bar,
        },
        "ai_prediction": {
            "failure_risk_probability": prob,
            "risk_category": risk_cat,
            "predicted_failure_mode": failure_mode,
            "is_flagged": is_flagged,
            "top_drivers": contributions[:3] if contributions else [],
            "explanation": explanation_summary
        },
        "anomaly_detection": {
            "anomaly_score": anomaly_score,
            "is_anomaly": is_anomaly,
            "affected_sensors": affected_sensors
        },
        "alert": {
            "id": alert.id,
            "severity": alert.severity,
            "title": alert.title,
            "message": alert.message
        } if alert else None
    }
    await ws_manager.broadcast_telemetry(broadcast_data)

@router.post("/", response_model=TelemetryOut, status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    payload: TelemetryCreate,
    db: Session = Depends(get_db)
):
    eq = db.query(Equipment).filter(Equipment.id == payload.equipment_id).first()
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")

    t_obj = Telemetry(
        equipment_id=eq.id,
        timestamp=payload.timestamp or datetime.utcnow(),
        air_temp_k=payload.air_temp_k,
        process_temp_k=payload.process_temp_k,
        rotational_speed_rpm=payload.rotational_speed_rpm,
        torque_nm=payload.torque_nm,
        tool_wear_min=payload.tool_wear_min,
        vibration_mms=payload.vibration_mms or 2.5,
        pressure_bar=payload.pressure_bar or 4.0,
        scenario=payload.scenario or "normal",
        is_simulated=payload.is_simulated if payload.is_simulated is not None else True
    )
    db.add(t_obj)
    db.commit()
    db.refresh(t_obj)

    await process_and_broadcast(db, eq, t_obj)
    return t_obj

@router.get("/latest/{equipment_id}", response_model=Optional[TelemetryOut])
def get_latest_telemetry(
    equipment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return (
        db.query(Telemetry)
        .filter(Telemetry.equipment_id == equipment_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

@router.get("/history/{equipment_id}", response_model=List[TelemetryOut])
def get_telemetry_history(
    equipment_id: int,
    limit: int = Query(default=60, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    records = (
        db.query(Telemetry)
        .filter(Telemetry.equipment_id == equipment_id)
        .order_by(Telemetry.timestamp.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(records))
