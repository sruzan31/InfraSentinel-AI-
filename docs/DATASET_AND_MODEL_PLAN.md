# InfraSentinel AI — Dataset and Machine Learning Plan

## 1. Selected Dataset: AI4I 2020 Predictive Maintenance Dataset
- **Source**: UCI Machine Learning Repository (Donated by Stephan Matzka, HTW Berlin).
- **Target Application**: Milling machines, industrial rotating pumps, and electric motor drivetrains.
- **Dataset Size**: 10,000 operational records.
- **Licensing**: Creative Commons Attribution 4.0 International (CC BY 4.0) — Permitted for commercial and academic use.

### 1.1 Features Overview
| Feature Name | Type | Physical Unit | Description / Range |
|---|---|---|---|
| `UDI` | Integer | - | Unique record index [1..10000] |
| `Product ID` | Categorical | - | Letter (L/M/H) + variant serial number |
| `Type` | Categorical | - | Equipment quality variant: Low (50%), Medium (30%), High (20%) |
| `Air temperature [K]` | Float | Kelvin | Ambient factory temperature (~295.3 - 304.5 K) |
| `Process temperature [K]`| Float | Kelvin | Equipment internal operating temperature (~305.7 - 313.8 K) |
| `Rotational speed [rpm]` | Integer | RPM | Shaft angular velocity (~1168 - 2886 rpm) |
| `Torque [Nm]` | Float | Newton-meter | Shaft mechanical load torque (~3.8 - 76.6 Nm) |
| `Tool wear [min]` | Integer | Minutes | Cumulative blade/impeller wear (~0 - 253 min) |
| `Machine failure` | Binary | 0 or 1 | Ground truth failure occurrence (339 failures / 3.39% positive class) |

### 1.2 Multi-Label Failure Failure Modes
The dataset includes 5 distinct independent failure mechanisms:
1. **Tool Wear Failure (TWF)**: Impeller/blade exceeds maximum wear threshold (typically 200-240 minutes under heavy load).
2. **Heat Dissipation Failure (HDF)**: Inadequate thermal gradient (process temp minus air temp < 8.6 K at rotational speeds below 1380 rpm).
3. **Power Failure (PWF)**: Motor mechanical power (`Torque * Speed`) out of safe bounds (< 3500 W or > 9000 W).
4. **Overstrain Failure (OSF)**: Product of tool wear and torque exceeds capacity.
5. **Random Failure (RNF)**: Exogenous component failures (0.1% independent probability).

---

## 2. Feature Engineering & Preprocessing

To maximize physical interpretability and model discrimination:
1. **Temperature Difference**: $\Delta T = T_{\text{process}} - T_{\text{air}}$ (critical for thermal dissipation failure detection).
2. **Mechanical Power [Watts]**: $P = \tau \times \left(\frac{2\pi \times \text{RPM}}{60}\right)$ (critical for electrical overload and stall detection).
3. **Overstrain Product**: $\text{Wear} \times \tau$ (mechanical stress accumulation index).
4. **Thermal-Power Ratio**: $\frac{\Delta T}{P + \epsilon}$ (cooling efficiency metric).
5. **Categorical Encoding**: One-Hot / Ordinal encoding for machine quality `Type` (H=2, M=1, L=0).

---

## 3. Class Imbalance & Validation Strategy

- **Imbalance**: Failure rate is ~3.39% (9,661 negative vs 339 positive cases).
- **Leakage Prevention**:
  - Stratified 70/15/15 Split (Train / Validation / Test) keeping the failure ratio identical across splits.
  - Standard scaling and encoders fit strictly on the Training fold, then applied to Validation and Test folds.
- **Imbalance Handling**:
  - For Random Forest: `class_weight='balanced_subsample'`
  - For XGBoost: `scale_pos_weight = (N_neg / N_pos)`
  - Decision threshold optimization via Precision-Recall curve analysis instead of arbitrary 0.5 cutoff.

---

## 4. Candidate Models & Evaluation Metrics

### 4.1 Supervised Models
1. **Baseline**: Logistic Regression with L2 regularization and balanced class weighting.
2. **Random Forest Classifier**: 200 trees, max depth 12, bootstrap sampling.
3. **XGBoost Classifier**: Gradient boosted decision trees with `scale_pos_weight` and early stopping.

### 4.2 Unsupervised Anomaly Model
- **Isolation Forest**: Trained on negative class (healthy operation) with 5% contamination rate to detect out-of-distribution patterns without reliance on labeled failure instances.

### 4.3 Evaluation Metrics
- **Primary Metric**: PR-AUC (Precision-Recall Area Under Curve) — the gold standard for high-consequence industrial anomaly detection.
- **Secondary Metrics**:
  - ROC-AUC
  - Precision @ Optimal Recall (target: > 80% recall with manageable false alarm rate)
  - F1 Score & F2 Score (favoring recall to avoid catastrophic unplanned downtime)
  - Confusion Matrix (True Positives, False Positives, False Negatives, True Negatives)
  - Calibration: Brier Score Loss & Calibrated Probability reliability curve.

---

## 5. Model Explainability & Interpretability

- **SHAP (SHapley Additive exPlanations)**:
  - Employ `shap.TreeExplainer` on the production gradient boosting / random forest model.
  - Compute base value and additive feature contribution vectors for every prediction.
  - Store background summary distribution (K-Means 50 samples) for instant low-latency inference attribution.
- **Operational Rule Explanations**:
  - For real-time sensor streams, explain the top 3 contributing sensor deviations in natural language (e.g. "Process Temperature is 7.2 K above normal operating envelope while Rotational Speed is 320 RPM below baseline").
