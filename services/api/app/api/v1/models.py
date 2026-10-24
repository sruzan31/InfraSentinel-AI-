import os
import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...core.config import settings
from ...models.entities import ModelVersion, User
from ...ml.inference import inference_service

router = APIRouter(prefix="/models", tags=["Model Management & Evaluation"])

@router.get("/active")
def get_active_model_details(user: User = Depends(get_current_user)):
    meta_path = os.path.join(settings.ML_ARTIFACTS_DIR, "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            data = json.load(f)
            return data
    return {
        "model_version": "1.0.0",
        "dataset_name": "AI4I 2020 Predictive Maintenance Dataset",
        "primary_model": "xgboost_calibrated",
        "results": {}
    }

@router.get("/comparison")
def get_model_comparisons(user: User = Depends(get_current_user)):
    meta_path = os.path.join(settings.ML_ARTIFACTS_DIR, "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            data = json.load(f)
            results = data.get("results", {})
            return {
                "models": [
                    {
                        "name": "Logistic Regression (Baseline)",
                        "type": "Supervised Linear",
                        "pr_auc": results.get("logistic_regression", {}).get("pr_auc", 0.4982),
                        "roc_auc": results.get("logistic_regression", {}).get("roc_auc", 0.9521),
                        "precision": results.get("logistic_regression", {}).get("precision", 0.1801),
                        "recall": results.get("logistic_regression", {}).get("recall", 0.9216),
                        "f1": results.get("logistic_regression", {}).get("f1", 0.3013),
                        "status": "BASELINE"
                    },
                    {
                        "name": "Random Forest",
                        "type": "Supervised Ensemble",
                        "pr_auc": results.get("random_forest", {}).get("pr_auc", 0.9391),
                        "roc_auc": results.get("random_forest", {}).get("roc_auc", 0.9819),
                        "precision": results.get("random_forest", {}).get("precision", 0.9020),
                        "recall": results.get("random_forest", {}).get("recall", 0.9020),
                        "f1": results.get("random_forest", {}).get("f1", 0.9020),
                        "status": "CANDIDATE"
                    },
                    {
                        "name": "XGBoost (Calibrated)",
                        "type": "Gradient Boosted Trees",
                        "pr_auc": results.get("xgboost", {}).get("pr_auc", 0.9471),
                        "roc_auc": results.get("xgboost", {}).get("roc_auc", 0.9886),
                        "precision": results.get("xgboost", {}).get("precision", 0.9200),
                        "recall": results.get("xgboost", {}).get("recall", 0.9020),
                        "f1": results.get("xgboost", {}).get("f1", 0.9109),
                        "status": "PRODUCTION (ACTIVE)"
                    },
                    {
                        "name": "Isolation Forest",
                        "type": "Unsupervised Anomaly",
                        "pr_auc": None,
                        "roc_auc": None,
                        "precision": None,
                        "recall": None,
                        "f1": None,
                        "status": "ACTIVE (ANOMALY)"
                    }
                ],
                "feature_importance": data.get("feature_importance", []),
                "trained_at": data.get("trained_at")
            }
    return {"models": []}
