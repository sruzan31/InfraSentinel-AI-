from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.entities import Prediction, Equipment, User, Telemetry
from ...schemas.api_schemas import PredictionOut
from ...ml.inference import inference_service

router = APIRouter(prefix="/predictions", tags=["AI Predictions & Explainability"])

@router.get("/history/{equipment_id}", response_model=List[PredictionOut])
def get_prediction_history(
    equipment_id: int,
    limit: int = Query(default=30, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    preds = (
        db.query(Prediction)
        .filter(Prediction.equipment_id == equipment_id)
        .order_by(Prediction.timestamp.desc())
        .limit(limit)
        .all()
    )

    out = []
    for p in reversed(preds):
        contributions = p.feature_importance_json or []
        out.append(
            PredictionOut(
                id=p.id,
                equipment_id=p.equipment_id,
                timestamp=p.timestamp,
                model_version=p.model_version,
                failure_risk_probability=p.failure_risk_probability,
                risk_category=p.risk_category,
                predicted_failure_mode=p.predicted_failure_mode,
                is_flagged=p.is_flagged,
                feature_contributions=contributions,
                explanation_summary=p.explanation_summary
            )
        )
    return out

@router.get("/latest/{equipment_id}", response_model=Optional[PredictionOut])
def get_latest_prediction(
    equipment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    p = (
        db.query(Prediction)
        .filter(Prediction.equipment_id == equipment_id)
        .order_by(Prediction.timestamp.desc())
        .first()
    )
    if not p:
        return None

    return PredictionOut(
        id=p.id,
        equipment_id=p.equipment_id,
        timestamp=p.timestamp,
        model_version=p.model_version,
        failure_risk_probability=p.failure_risk_probability,
        risk_category=p.risk_category,
        predicted_failure_mode=p.predicted_failure_mode,
        is_flagged=p.is_flagged,
        feature_contributions=p.feature_importance_json or [],
        explanation_summary=p.explanation_summary
    )
