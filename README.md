# InfraSentinel AI
### Predict Failures. Prevent Disruptions. Protect Infrastructure.

[![CI Pipeline](https://github.com/infrasentinel/infrasentinel-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/infrasentinel/infrasentinel-ai/actions)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

**InfraSentinel AI** is an enterprise-grade AI/ML predictive maintenance, real-time sensor anomaly detection, and automated incident response platform built for critical industrial infrastructure: centrifugal slurry pumps, electric drive motors, boiler feed pumps, and rotating machinery.

Built for **Theme 1: Build the Future — Solve a Real-World Problem.**

---

## 1. Key Capabilities

1. **Dual-Engine AI Reliability Core**:
   - **Supervised Failure Risk Engine**: Calibrated XGBoost & Random Forest estimating machine failure probability (PR-AUC: **0.9471**, ROC-AUC: **0.9886**, Recall: **90.2%**).
   - **Unsupervised Anomaly Engine**: Isolation Forest trained on healthy baseline regimes to detect multi-sensor operational drift and out-of-distribution events without reliance on labels.
2. **Explainable AI (SHAP TreeExplainer)**:
   - Real-time Shapley Additive exPlanations feature attribution identifying the exact physical drivers pushing risk higher (e.g. thermal gradient collapse, speed reduction, excessive vibration).
   - Contextual prescriptive natural language maintenance SOPs.
3. **Multi-Channel Real-Time Telemetry Streaming**:
   - WebSocket broadcast hub streaming process temperatures, air temperatures, differential thermal gradient ($\Delta T$), rotational speed (RPM), torque (Nm), vibration (mm/s), and discharge pressure (bar) at 1 Hz.
4. **Configurable Telemetry Simulator**:
   - Simulates 8 real-world physical operating regimes: Normal Steady State, Heat Dissipation Failure (HDF), Excessive Radial Vibration (> 7.0 mm/s), Hydraulic Cavitation, Motor Power Overload (PWF), Impeller Tool Wear (TWF), Sensor Disconnection, and Mechanical Seizure.
5. **Intelligent Alert & Auto-Escalation Engine**:
   - Configurable rule engine with deduplication suppression window.
   - Automatically escalates CRITICAL alerts into P1 Incident Tickets assigned to reliability engineers.
6. **Full-Lifecycle Incident & Maintenance Management**:
   - Work order logging (technician, actions performed, parts replaced, downtime minutes, cost).
   - Dynamic health score recovery upon maintenance completion.
7. **Enterprise Industrial Dark SaaS Interface**:
   - Tailored industrial design system (#060B16 canvas, glassmorphism cards, Recharts time-series telemetry charts, and radial risk gauges).

---

## 2. Machine Learning Empirical Validation (AI4I 2020 Dataset)

Trained on the **AI4I 2020 Predictive Maintenance Dataset** (UCI Machine Learning Repository, 10,000 operational records, 3.39% failure class rate).

**Zero Data Leakage Validation Strategy**:
- 70% Train, 15% Validation, 15% Test stratified split.
- Standard scalers and encoders fit strictly on the Training split.
- Class imbalance handled via `scale_pos_weight` and `class_weight='balanced_subsample'`.
- Calibrated probability estimates via Sigmoid Cross-Validation (`CalibratedClassifierCV`).

### Model Evaluation Leaderboard (1,500 Holdout Test Records)

| Model Name | Model Type | PR-AUC | ROC-AUC | Precision | Recall | F1 Score | Status |
|---|---|---|---|---|---|---|---|
| **Logistic Regression** | Linear Baseline | 0.4982 | 0.9521 | 0.1801 | **92.16%** | 0.3013 | Baseline |
| **Random Forest** | Ensemble Trees | 0.9391 | 0.9819 | 0.9020 | **90.20%** | 0.9020 | Candidate |
| **XGBoost (Calibrated)** | Gradient Boosted Trees | **0.9471** | **0.9886** | **0.9200** | **90.20%** | **0.9109** | **PRODUCTION (ACTIVE)** |
| **Isolation Forest** | Unsupervised Anomaly | — | — | — | — | — | **ACTIVE (ANOMALY)** |

*Top Contributing Physical Features by SHAP Importance:*
1. `Tool wear [min]` (Cumulative blade/impeller mechanical wear)
2. `thermal_power_ratio` ($\Delta T / \text{Power}$)
3. `Rotational speed [rpm]` (Angular velocity)
4. `power_watts` ($\tau \times \omega$)
5. `temp_diff_k` ($T_{\text{process}} - T_{\text{air}}$)

---

## 3. System Architecture

```
+-------------------------------------------------------------------------------------------------------------+
|                                              PRESENTATION LAYER                                             |
|   Next.js App Router (TypeScript strict, Tailwind CSS, Framer Motion, Lucide, Recharts, Zustand)            |
|   - Real-Time Telemetry Dashboard           - Interactive Incident Command Center                           |
|   - AI Prediction & SHAP Visualizer         - Equipment Health Matrix & Topology                            |
|   - Live Anomaly Timeline & Telemetry Feed  - Model Performance & Calibration Metrics                       |
+-------------------------------------------------------------------------------------------------------------+
                                       ▲ WebSocket / REST APIs (v1)
                                       ▼
+-------------------------------------------------------------------------------------------------------------+
|                                             APPLICATION SERVICES                                            |
|   FastAPI (Python 3.11, Pydantic v2, SQLAlchemy 2.0, JWT Authentication, Role-Based Access Control)         |
|   - /api/v1/auth & /users                   - /api/v1/equipment & /sensors                                  |
|   - /api/v1/telemetry (ingest & query)      - /api/v1/predictions & /anomalies                              |
|   - /api/v1/alerts & /incidents             - /api/v1/maintenance & /analytics                              |
|   - /api/v1/models & /datasets              - /ws/telemetry (Live Broadcast Stream)                         |
+-------------------------------------------------------------------------------------------------------------+
            │                                             │                                      │
            ▼                                             ▼                                      ▼
+-----------------------+                    +-------------------------+            +-------------------------+
|     DATA LAYER        |                    |   AI / ML ENGINE        |            |   TELEMETRY SIMULATOR   |
| PostgreSQL 16         |                    | - XGBoost / Random Forest|           | - Configurable scenarios|
| - Equipment & Sensors |                    | - Isolation Forest      |            | - Normal, Heat, Vib,    |
| - Telemetry Timeseries|                    | - SHAP TreeExplainer    |            |   Overload, Degradation |
| - Predictions & Alerts|                    | - Real-time Inference   |            | - WebSocket / REST push |
| - Incidents & Audits  |                    | - Metric Tracking       |            | - Rate control & jitter |
+-----------------------+                    +-------------------------+            +-------------------------+
```

---

## 4. Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16 (or native SQLite fallback)

### 1. Clone & Set Up Python Virtual Environment
```bash
git clone https://github.com/infrasentinel/infrasentinel-ai.git
cd infrasentinel-ai

python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Prepare AI4I Dataset & Train Models
```bash
# Downloads and validates AI4I 2020 dataset from UCI
python ml/training/fetch_dataset.py

# Trains Baseline, Random Forest, XGBoost, and Isolation Forest
python ml/training/train_models.py
```

### 3. Initialize Database & Seed Assets
```bash
# Creates PostgreSQL schema and seeds 4 equipment assets and demo accounts
python -m services.api.app.core.init_db
```

### 4. Run Automated Test Suite
```bash
PYTHONPATH=. pytest services/api/tests/ -v
```

### 5. Launch Backend & Frontend Servers
**Terminal 1 (FastAPI Backend):**
```bash
uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 (Next.js Frontend):**
```bash
cd apps/web
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 5. Live Hackathon Demonstration Walkthrough

You can execute the entire 15-step Hackathon verification sequence with one command:
```bash
./scripts/run_demo.sh
```

### Demonstration Steps:
1. **Landing Page**: Navigate to `http://localhost:3000` to review the enterprise hero, live beacon, and PR-AUC 0.9471 metric.
2. **Operator Login**: Click "Sign In" and select the one-click demo profile for **Lead Operator** (`operator@infrasentinel.io`).
3. **Equipment Fleet**: View the 4 monitored rotating assets: `PUMP-101`, `MOTOR-204`, `PUMP-305`, and `COMP-402`.
4. **Simulator Engagement**: At the top right, select `PUMP-101` and click **"Stream Live"** or **"Tick"** to stream telemetry.
5. **Abnormal Scenario Injection**: In the scenario dropdown, select **"Thermal Dissipation (HDF)"** or **"Radial Vibration (>7 mm/s)"**.
6. **Anomaly Detection**: Open **Anomaly Timeline** (`/anomalies`) to view the Isolation Forest anomaly score jump past the 0.60 threshold.
7. **Failure Risk & SHAP**: Open **AI Prediction Center** (`/predictions`) to view the calibrated risk gauge escalate to **87%+** and examine the red SHAP bars highlighting the exact thermal/vibration stress factors.
8. **Alert Generation**: Open **Alerts Center** (`/alerts`) to inspect the triggered `TEMP_RUNAWAY` or `VIB_EXCESS` alert.
9. **Incident Escalation**: Open **Incident Response** (`/incidents`) to see the auto-escalated P1 ticket `INC-PUMP-101-0001`.
10. **Technician Workflow**: Transition the ticket to **"IN_PROGRESS"**, then open **Maintenance Intelligence** (`/maintenance`) to log the corrective work order.
11. **Health Recovery**: Observe the equipment health score recover to 100% and export the certified CSV report from **Fleet Analytics** (`/analytics`).

---

## 6. Docker Container Deployment

To launch the complete production stack (PostgreSQL, FastAPI, and Next.js) in containers:
```bash
docker-compose up --build -d
```
- Web Application: `http://localhost:3000`
- API Documentation: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## 7. Safety & Decision-Support Notice

> **Important Operational Disclaimer**: InfraSentinel AI is an intelligent predictive maintenance decision-support and condition-monitoring platform. It provides early warning alerts, risk probabilities, and prescriptive inspection recommendations to certified plant operators. It deliberately does **not** issue direct physical control or automatic shutdown commands to machinery.
