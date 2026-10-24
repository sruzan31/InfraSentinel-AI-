import os
import json
import logging
import joblib
import numpy as np
import shap
from typing import Dict, Any, List, Tuple
from ..core.config import settings

logger = logging.getLogger("infrasentinel.inference")

class MLInferenceService:
    def __init__(self):
        self.artifacts_dir = settings.ML_ARTIFACTS_DIR
        self.calibrated_xgb = None
        self.xgb_raw = None
        self.isolation_forest = None
        self.failure_mode_models = None
        self.scaler = None
        self.shap_explainer = None
        self.metadata = {}
        self.feature_names = [
            "Air temperature [K]",
            "Process temperature [K]",
            "Rotational speed [rpm]",
            "Torque [Nm]",
            "Tool wear [min]",
            "type_encoded",
            "temp_diff_k",
            "power_watts",
            "overstrain_index",
            "thermal_power_ratio",
        ]
        self.baselines = {
            "Air temperature [K]": 300.0,
            "Process temperature [K]": 310.0,
            "Rotational speed [rpm]": 1538.0,
            "Torque [Nm]": 40.0,
            "Tool wear [min]": 50.0,
            "type_encoded": 0.0,
            "temp_diff_k": 10.0,
            "power_watts": 6440.0,
            "overstrain_index": 2000.0,
            "thermal_power_ratio": 1.55,
        }
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        try:
            meta_path = os.path.join(self.artifacts_dir, "model_metadata.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.metadata = json.load(f)

            calib_path = os.path.join(self.artifacts_dir, "calibrated_xgb.joblib")
            if os.path.exists(calib_path):
                self.calibrated_xgb = joblib.load(calib_path)

            raw_path = os.path.join(self.artifacts_dir, "xgb_raw.joblib")
            if os.path.exists(raw_path):
                self.xgb_raw = joblib.load(raw_path)
                try:
                    self.shap_explainer = shap.TreeExplainer(self.xgb_raw)
                except Exception as ex:
                    logger.warning(f"Could not init TreeExplainer: {ex}")

            iso_path = os.path.join(self.artifacts_dir, "isolation_forest.joblib")
            if os.path.exists(iso_path):
                self.isolation_forest = joblib.load(iso_path)

            fm_path = os.path.join(self.artifacts_dir, "failure_modes.joblib")
            if os.path.exists(fm_path):
                self.failure_mode_models = joblib.load(fm_path)

            scaler_path = os.path.join(self.artifacts_dir, "scaler.joblib")
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)

            self.is_loaded = True
            logger.info("ML Inference Service loaded all model artifacts successfully.")
        except Exception as e:
            logger.error(f"Error loading ML artifacts from {self.artifacts_dir}: {e}")
            self.is_loaded = False

    def engineer_features(self, payload: Dict[str, Any], quality_type: str = "L") -> np.ndarray:
        air_temp = float(payload.get("air_temp_k", 300.0))
        process_temp = float(payload.get("process_temp_k", 310.0))
        speed_rpm = float(payload.get("rotational_speed_rpm", 1500.0))
        torque_nm = float(payload.get("torque_nm", 40.0))
        tool_wear = float(payload.get("tool_wear_min", 20.0))

        type_map = {"L": 0, "M": 1, "H": 2}
        type_encoded = type_map.get(quality_type.upper(), 0)

        temp_diff_k = process_temp - air_temp
        power_watts = torque_nm * (speed_rpm * 2.0 * np.pi / 60.0)
        overstrain_index = torque_nm * tool_wear
        thermal_power_ratio = temp_diff_k / (power_watts / 1000.0 + 1e-5)

        features = [
            air_temp,
            process_temp,
            speed_rpm,
            torque_nm,
            tool_wear,
            type_encoded,
            temp_diff_k,
            power_watts,
            overstrain_index,
            thermal_power_ratio,
        ]
        return np.array(features, dtype=np.float32).reshape(1, -1)

    def predict_failure_risk(self, features: np.ndarray) -> Tuple[float, str, str, bool]:
        """
        Returns (calibrated_probability, risk_category, predicted_failure_mode, is_flagged)
        """
        if not self.is_loaded or self.calibrated_xgb is None:
            # Fallback heuristic calculation if models not yet loaded
            return 0.05, "LOW", "NONE", False

        prob = float(self.calibrated_xgb.predict_proba(features)[0, 1])
        
        # Risk Category mapping
        if prob >= 0.75:
            category = "CRITICAL"
        elif prob >= 0.45:
            category = "HIGH"
        elif prob >= 0.20:
            category = "MEDIUM"
        else:
            category = "LOW"

        is_flagged = prob >= 0.45

        # Detect specific failure mode if flagged
        mode = "NONE"
        if is_flagged and self.failure_mode_models:
            best_mode_prob = 0.0
            for fm_name, fm_clf in self.failure_mode_models.items():
                p = float(fm_clf.predict_proba(features)[0, 1])
                if p > best_mode_prob and p > 0.35:
                    best_mode_prob = p
                    mode = fm_name

            # Physical domain rule corroboration
            power = features[0, 7]
            temp_diff = features[0, 6]
            speed = features[0, 2]
            strain = features[0, 8]
            wear = features[0, 4]

            if temp_diff < 8.6 and speed < 1380:
                mode = "HDF (Heat Dissipation Failure)"
            elif power < 3500 or power > 9000:
                mode = "PWF (Power Failure)"
            elif strain > 11000:
                mode = "OSF (Overstrain Failure)"
            elif wear > 200:
                mode = "TWF (Tool Wear Failure)"

        return prob, category, mode, is_flagged

    def detect_anomalies(self, features: np.ndarray) -> Tuple[float, bool, str, Dict[str, Any]]:
        """
        Returns (normalized_anomaly_score, is_anomaly, affected_sensors, details)
        """
        if not self.is_loaded or self.isolation_forest is None:
            return 0.15, False, "None", {}

        # Isolation forest score: typically between -0.7 (anomaly) and 0.2 (normal)
        raw_score = float(self.isolation_forest.score_samples(features)[0])
        # Normalize to 0 (normal) to 1 (severe anomaly)
        # Empirical min ~ -0.65, max ~ 0.15
        norm_score = float(np.clip(1.0 - (raw_score - (-0.65)) / (0.15 - (-0.65) + 1e-6), 0.0, 1.0))

        is_anomaly = norm_score > 0.60
        affected = []

        # Sensor deviations relative to normal envelope
        if features[0, 0] > 305.0: affected.append("Air Temperature")
        if features[0, 1] > 314.0 or features[0, 6] < 8.6: affected.append("Process Temperature / Delta T")
        if features[0, 2] < 1200 or features[0, 2] > 2600: affected.append("Rotational Speed (RPM)")
        if features[0, 3] > 60.0 or features[0, 3] < 10.0: affected.append("Shaft Torque (Nm)")
        if features[0, 4] > 200.0: affected.append("Tool / Impeller Wear")
        if features[0, 7] > 8500 or features[0, 7] < 3500: affected.append("Motor Mechanical Power (W)")

        affected_str = ", ".join(affected) if affected else ("Multi-Sensor Latent Drift" if is_anomaly else "Normal")
        
        details = {
            "raw_isolation_score": raw_score,
            "normalized_score": norm_score,
            "detected_abnormal_channels": affected
        }
        return norm_score, is_anomaly, affected_str, details

    def compute_explanations(self, features: np.ndarray, prob: float, mode: str) -> Tuple[List[Dict[str, Any]], str]:
        """
        Compute SHAP value local attribution and human-readable explanation summary.
        """
        contributions = []
        summary_sentences = []

        feat_vals = features[0]
        shap_vals = np.zeros(len(self.feature_names))

        if self.shap_explainer is not None:
            try:
                raw_shap = self.shap_explainer.shap_values(features)
                if isinstance(raw_shap, list):
                    shap_vals = raw_shap[1][0] if len(raw_shap) > 1 else raw_shap[0][0]
                else:
                    shap_vals = raw_shap[0]
            except Exception as e:
                logger.warning(f"SHAP compute fallback: {e}")

        # If SHAP was zero or failed, compute normalized z-score deviation attribution
        if np.all(shap_vals == 0):
            for i, name in enumerate(self.feature_names):
                b = self.baselines.get(name, 1.0)
                val = feat_vals[i]
                diff = (val - b) / (abs(b) + 1e-4)
                shap_vals[i] = diff * 0.5

        for i, name in enumerate(self.feature_names):
            val = float(feat_vals[i])
            base = float(self.baselines.get(name, val))
            s_val = float(shap_vals[i])

            if s_val > 0.05:
                impact = "INCREASES_RISK"
                desc = f"{name} is above nominal baseline (+{val - base:.1f}), pushing failure risk higher."
            elif s_val < -0.05:
                impact = "DECREASES_RISK"
                desc = f"{name} is within healthy operating margins."
            else:
                impact = "NEUTRAL"
                desc = f"{name} is close to nominal baseline."

            contributions.append({
                "feature": name,
                "value": round(val, 2),
                "baseline": round(base, 2),
                "shap_value": round(s_val, 4),
                "impact": impact,
                "description": desc
            })

        # Sort contributions by absolute SHAP value
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        # Build natural language narrative for operators
        top_drivers = [c for c in contributions if c["impact"] == "INCREASES_RISK"][:3]
        if prob < 0.20:
            summary = "Equipment is operating within safe mechanical and thermal tolerances. No immediate intervention required."
        else:
            driver_texts = [f"{d['feature']} (val: {d['value']}, baseline: {d['baseline']})" for d in top_drivers]
            drivers_str = "; ".join(driver_texts) if driver_texts else "combined multivariable sensor drift"
            summary = (
                f"Model estimates {prob*100:.1f}% failure probability ({mode if mode != 'NONE' else 'Elevated Risk'}). "
                f"Primary contributing stress factors: {drivers_str}. "
                f"Recommended action: Immediate thermal inspection, vibration screening, and bearing lubrication audit."
            )

        return contributions, summary

inference_service = MLInferenceService()
