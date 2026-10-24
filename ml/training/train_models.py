import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    brier_score_loss,
    classification_report
)
import xgboost as xgb
import shap

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_PATH = os.path.join(BASE_DIR, "ml", "datasets", "ai4i2020.csv")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "ml", "artifacts")

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply domain-specific industrial physical equations.
    """
    df = df.copy()
    
    # Map Type: L=0, M=1, H=2
    type_map = {"L": 0, "M": 1, "H": 2}
    if "Type" in df.columns:
        df["type_encoded"] = df["Type"].map(type_map).fillna(0).astype(int)
    
    # Temperature difference [K]
    df["temp_diff_k"] = df["Process temperature [K]"] - df["Air temperature [K]"]
    
    # Mechanical Power [W] = Torque [Nm] * (Rotational speed [rpm] * 2 * pi / 60)
    df["power_watts"] = df["Torque [Nm]"] * (df["Rotational speed [rpm]"] * 2 * np.pi / 60.0)
    
    # Overstrain index = Torque [Nm] * Tool wear [min]
    df["overstrain_index"] = df["Torque [Nm]"] * df["Tool wear [min]"]
    
    # Thermal Dissipation efficiency = Temp difference / Power
    df["thermal_power_ratio"] = df["temp_diff_k"] / (df["power_watts"] / 1000.0 + 1e-5)
    
    return df

def train_and_evaluate():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    
    print(f"Loading dataset from {DATA_PATH}...")
    raw_df = pd.read_csv(DATA_PATH)
    
    # Feature Engineering
    df = engineer_features(raw_df)
    
    feature_cols = [
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
    
    target_col = "Machine failure"
    failure_mode_cols = ["TWF", "HDF", "PWF", "OSF", "RNF"]
    
    X = df[feature_cols].values
    y = df[target_col].values
    
    # Stratified Train (70%) / Val (15%) / Test (15%)
    X_train_full, X_test, y_train_full, y_test, df_train_full, df_test = train_test_split(
        X, y, df, test_size=0.15, random_state=42, stratify=y
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full, y_train_full, test_size=0.1765, random_state=42, stratify=y_train_full
    ) # 0.85 * 0.1765 ~= 0.15 of total
    
    print(f"Data Split -> Train: {len(X_train)} ({sum(y_train)} pos), Val: {len(X_val)} ({sum(y_val)} pos), Test: {len(X_test)} ({sum(y_test)} pos)")
    
    # Standard Scaler fit ONLY on Train fold to prevent leakage
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    results = {}
    
    # -------------------------------------------------------------
    # Model 1: Logistic Regression Baseline (Balanced)
    # -------------------------------------------------------------
    print("\n--- Training Logistic Regression Baseline ---")
    lr = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
    lr.fit(X_train_scaled, y_train)
    
    y_pred_lr = lr.predict(X_test_scaled)
    y_prob_lr = lr.predict_proba(X_test_scaled)[:, 1]
    
    lr_metrics = {
        "model": "Logistic Regression (Baseline)",
        "precision": float(precision_score(y_test, y_pred_lr, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred_lr)),
        "f1": float(f1_score(y_test, y_pred_lr)),
        "roc_auc": float(roc_auc_score(y_test, y_prob_lr)),
        "pr_auc": float(average_precision_score(y_test, y_prob_lr)),
        "brier_score": float(brier_score_loss(y_test, y_prob_lr)),
        "confusion_matrix": confusion_matrix(y_test, y_pred_lr).tolist(),
    }
    results["logistic_regression"] = lr_metrics
    print(f"LR PR-AUC: {lr_metrics['pr_auc']:.4f}, ROC-AUC: {lr_metrics['roc_auc']:.4f}, Recall: {lr_metrics['recall']:.4f}, Precision: {lr_metrics['precision']:.4f}")
    
    # -------------------------------------------------------------
    # Model 2: Random Forest Classifier
    # -------------------------------------------------------------
    print("\n--- Training Random Forest Classifier ---")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    
    y_prob_rf_raw = rf.predict_proba(X_test)[:, 1]
    # Optimal threshold based on validation set
    y_prob_rf_val = rf.predict_proba(X_val)[:, 1]
    best_thresh_rf = 0.5
    best_f1_rf = 0.0
    for t in np.linspace(0.1, 0.9, 81):
        f = f1_score(y_val, (y_prob_rf_val >= t).astype(int))
        if f > best_f1_rf:
            best_f1_rf = f
            best_thresh_rf = t
            
    y_pred_rf = (y_prob_rf_raw >= best_thresh_rf).astype(int)
    
    rf_metrics = {
        "model": "Random Forest",
        "optimal_threshold": float(best_thresh_rf),
        "precision": float(precision_score(y_test, y_pred_rf, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred_rf)),
        "f1": float(f1_score(y_test, y_pred_rf)),
        "roc_auc": float(roc_auc_score(y_test, y_prob_rf_raw)),
        "pr_auc": float(average_precision_score(y_test, y_prob_rf_raw)),
        "brier_score": float(brier_score_loss(y_test, y_prob_rf_raw)),
        "confusion_matrix": confusion_matrix(y_test, y_pred_rf).tolist(),
    }
    results["random_forest"] = rf_metrics
    print(f"RF (thresh={best_thresh_rf:.2f}) PR-AUC: {rf_metrics['pr_auc']:.4f}, ROC-AUC: {rf_metrics['roc_auc']:.4f}, Recall: {rf_metrics['recall']:.4f}, Precision: {rf_metrics['precision']:.4f}, F1: {rf_metrics['f1']:.4f}")
    
    # -------------------------------------------------------------
    # Model 3: XGBoost Classifier (Calibrated)
    # -------------------------------------------------------------
    print("\n--- Training XGBoost Classifier ---")
    scale_pos = (len(y_train) - sum(y_train)) / sum(y_train)
    xgb_clf = xgb.XGBClassifier(
        n_estimators=250,
        max_depth=5,
        learning_rate=0.05,
        scale_pos_weight=scale_pos,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="aucpr"
    )
    xgb_clf.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    
    # Calibrate probability predictions using sigmoid with 3-fold cross-validation
    calibrated_xgb = CalibratedClassifierCV(estimator=xgb_clf, method="sigmoid", cv=3)
    calibrated_xgb.fit(X_train_full, y_train_full)
    
    y_prob_xgb = calibrated_xgb.predict_proba(X_test)[:, 1]
    
    # Find optimal threshold on validation set
    y_prob_val = calibrated_xgb.predict_proba(X_val)[:, 1]
    best_thresh = 0.5
    best_f1 = 0.0
    for t in np.linspace(0.1, 0.9, 81):
        f = f1_score(y_val, (y_prob_val >= t).astype(int))
        if f > best_f1:
            best_f1 = f
            best_thresh = t
            
    y_pred_xgb = (y_prob_xgb >= best_thresh).astype(int)
    
    xgb_metrics = {
        "model": "XGBoost (Calibrated)",
        "optimal_threshold": float(best_thresh),
        "precision": float(precision_score(y_test, y_pred_xgb, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred_xgb)),
        "f1": float(f1_score(y_test, y_pred_xgb)),
        "roc_auc": float(roc_auc_score(y_test, y_prob_xgb)),
        "pr_auc": float(average_precision_score(y_test, y_prob_xgb)),
        "brier_score": float(brier_score_loss(y_test, y_prob_xgb)),
        "confusion_matrix": confusion_matrix(y_test, y_pred_xgb).tolist(),
    }
    results["xgboost"] = xgb_metrics
    print(f"XGB (thresh={best_thresh:.2f}) PR-AUC: {xgb_metrics['pr_auc']:.4f}, ROC-AUC: {xgb_metrics['roc_auc']:.4f}, Recall: {xgb_metrics['recall']:.4f}, Precision: {xgb_metrics['precision']:.4f}, F1: {xgb_metrics['f1']:.4f}")
    
    # -------------------------------------------------------------
    # Model 4: Isolation Forest (Unsupervised Anomaly Detection)
    # -------------------------------------------------------------
    print("\n--- Training Isolation Forest (Unsupervised) ---")
    # Train only on normal operating states from training fold
    X_train_normal = X_train[y_train == 0]
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.035, # matching expected anomaly rate
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_normal)
    
    # Score on test set: negative score means anomaly
    test_scores = iso_forest.score_samples(X_test)
    # Normalize score to 0..1 (where 1 is highest anomaly probability)
    min_score = test_scores.min()
    max_score = test_scores.max()
    norm_anomaly_score = 1.0 - (test_scores - min_score) / (max_score - min_score + 1e-8)
    
    iso_metrics = {
        "model": "Isolation Forest",
        "contamination": 0.035,
        "mean_anomaly_score": float(np.mean(norm_anomaly_score)),
        "max_anomaly_score": float(np.max(norm_anomaly_score)),
        "detected_anomalies_test_count": int(sum(norm_anomaly_score > 0.6)),
    }
    results["isolation_forest"] = iso_metrics
    print(f"Isolation Forest trained on {len(X_train_normal)} normal samples. Test anomalies detected: {iso_metrics['detected_anomalies_test_count']}")
    
    # -------------------------------------------------------------
    # Explainability: SHAP TreeExplainer
    # -------------------------------------------------------------
    print("\n--- Initializing SHAP Explainer ---")
    shap_explainer = shap.TreeExplainer(xgb_clf)
    
    # Extract background representative distribution (K-Means 30 samples)
    background_summary = shap.kmeans(X_train, 30).data
    
    # Compute global feature importance via mean absolute SHAP values on test set
    shap_sample = X_test[:200]
    sample_shap_values = shap_explainer.shap_values(shap_sample)
    mean_abs_shap = np.mean(np.abs(sample_shap_values), axis=0)
    
    feature_importance = [
        {"feature": name, "importance": float(imp)}
        for name, imp in sorted(zip(feature_cols, mean_abs_shap), key=lambda x: x[1], reverse=True)
    ]
    print("Top features by SHAP importance:")
    for item in feature_importance[:5]:
        print(f"  - {item['feature']}: {item['importance']:.4f}")
        
    # -------------------------------------------------------------
    # Multi-label Failure Mode Classifier
    # -------------------------------------------------------------
    print("\n--- Training Multi-Label Failure Mode Sub-classifier ---")
    failure_mode_models = {}
    for mode in failure_mode_cols:
        y_mode = df[mode].values
        clf_mode = RandomForestClassifier(n_estimators=50, max_depth=6, class_weight="balanced", random_state=42)
        clf_mode.fit(X, y_mode)
        failure_mode_models[mode] = clf_mode
    
    # -------------------------------------------------------------
    # Model Artifact Serialization
    # -------------------------------------------------------------
    version = "1.0.0"
    trained_at = datetime.utcnow().isoformat() + "Z"
    
    metadata = {
        "model_version": version,
        "dataset_name": "AI4I 2020 Predictive Maintenance Dataset",
        "trained_at": trained_at,
        "features": feature_cols,
        "optimal_threshold": float(best_thresh),
        "primary_model": "xgboost_calibrated",
        "results": results,
        "feature_importance": feature_importance,
        "failure_modes": failure_mode_cols,
    }
    
    joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.joblib"))
    joblib.dump(lr, os.path.join(ARTIFACTS_DIR, "logistic_regression.joblib"))
    joblib.dump(rf, os.path.join(ARTIFACTS_DIR, "random_forest.joblib"))
    joblib.dump(calibrated_xgb, os.path.join(ARTIFACTS_DIR, "calibrated_xgb.joblib"))
    joblib.dump(xgb_clf, os.path.join(ARTIFACTS_DIR, "xgb_raw.joblib"))
    joblib.dump(iso_forest, os.path.join(ARTIFACTS_DIR, "isolation_forest.joblib"))
    joblib.dump(failure_mode_models, os.path.join(ARTIFACTS_DIR, "failure_modes.joblib"))
    joblib.dump(background_summary, os.path.join(ARTIFACTS_DIR, "shap_background.joblib"))
    
    with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nAll artifacts successfully saved to {ARTIFACTS_DIR}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
