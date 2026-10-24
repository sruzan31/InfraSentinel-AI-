# InfraSentinel AI — Implementation Plan

## 1. Execution Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Project Foundation & Architecture Documentation [IN PROGRESS] │
│ - Monorepo initialization, env setups, dependency manifests           │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: AI / ML Pipeline & Evaluation [NEXT]                          │
│ - Ingest UCI AI4I 2020 dataset, train models, export artifacts & SHAP  │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Backend API & Database Engine                                 │
│ - SQLAlchemy models, migrations, auth, REST endpoints, WebSocket hub   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Frontend Application (Next.js + Tailwind + Framer Motion)     │
│ - Design system, 13 core pages, telemetry charts, SHAP visualizer     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Telemetry Simulator & Real-Time Loop Integration              │
│ - 8 failure/anomaly scenarios, live websocket stream, alert engine     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 6: Incident Management, Maintenance Intelligence & Reports       │
│ - Work order tracking, AI assistant explanations, PDF/CSV export      │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 7: Automated Testing, Containerization & Demo Verification       │
│ - Pytest suite, Jest/frontend tests, Docker Compose, Demo script       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Work Breakdown

### Phase 1: Foundation
1. Create complete monorepo directory skeleton.
2. Configure Python virtual environment with pinned dependencies (`requirements.txt`).
3. Set up Next.js application (`apps/web`) with TypeScript, Tailwind CSS, Lucide, Framer Motion, and Recharts.
4. Set up environment configuration (`.env.example` and local `.env`).

### Phase 2: AI / ML Engine
1. Download UCI AI4I 2020 Predictive Maintenance Dataset (`ai4i2020.csv`).
2. Exploratory Data Analysis & Schema Verification.
3. Feature Engineering:
   - Temperature Difference: `process_temp_k - air_temp_k`
   - Mechanical Power proxy: `torque_nm * (rotational_speed_rpm * 2 * pi / 60)`
   - Strain indicator: `torque_nm * tool_wear_min`
4. Supervised Failure Prediction:
   - Logistic Regression Baseline
   - Random Forest Classifier (balanced weights)
   - XGBoost Classifier (scale_pos_weight tuned)
   - Evaluate PR-AUC, ROC-AUC, Precision, Recall, F1, Confusion Matrix
   - Probability calibration (CalibratedClassifierCV)
5. Unsupervised Anomaly Detection:
   - Isolation Forest trained on healthy operating telemetry
6. Explainability:
   - SHAP TreeExplainer pre-computation and background summary extraction
7. Model Artifact Export:
   - Save serialized models, feature scalers, and evaluation metrics into `ml/artifacts/`.

### Phase 3: Backend Services
1. FastAPI app initialization with CORS, structured exception handlers, and API router.
2. Database connection layer supporting PostgreSQL (primary) and SQLite (seamless development fallback).
3. Database ORM models:
   - `Organization`, `User`, `Equipment`, `Sensor`, `Telemetry`, `Prediction`, `Anomaly`, `Alert`, `Incident`, `MaintenanceRecord`, `ModelVersion`, `AuditLog`.
4. Authentication & Security:
   - JWT token issuance and verification
   - Password hashing
   - RBAC dependency (`require_role`)
5. REST API Endpoints:
   - `/api/v1/auth` (login, register, me, refresh)
   - `/api/v1/equipment` (list, create, detail, update, delete, health)
   - `/api/v1/sensors` (sensor channels per asset)
   - `/api/v1/telemetry` (ingest batch, get history, get latest)
   - `/api/v1/predictions` (trigger inference, history, SHAP explanation)
   - `/api/v1/anomalies` (anomaly stream & timeline)
   - `/api/v1/alerts` (list, filter, acknowledge, rules)
   - `/api/v1/incidents` (list, create, update status, assign, timeline)
   - `/api/v1/maintenance` (priorities, work orders, logs)
   - `/api/v1/models` (active models, metrics, comparisons)
   - `/api/v1/analytics` (fleet health, downtime metrics, trend aggregations)
   - `/api/v1/reports` (structured summary export)
6. WebSocket Telemetry Broadcaster:
   - `/ws/telemetry/{equipment_id}` real-time stream hub.

### Phase 4: Frontend Development
1. Industrial Command Center Design System:
   - Palette tokens, custom glass components, status badges, typography.
2. 13 Complete UI Pages:
   1. **Landing Page**: Enterprise hero, interactive architecture, capabilities preview, CTA.
   2. **Authentication**: Sign in, register, role selector demo toggle.
   3. **Main Dashboard**: Fleet KPI cards, equipment health radar, active alerts list, quick simulator control.
   4. **Equipment Management**: Asset catalog, add equipment modal, operational metrics, telemetry configuration.
   5. **Live Monitoring**: Real-time multi-sensor telemetry charts, anomaly indicators, live status feed.
   6. **AI Prediction Center**: Calibrated failure risk gauge, probability trends, SHAP feature importance plot.
   7. **Anomaly Detection**: Timeline, Isolation Forest anomaly score stream, affected sensor breakdown.
   8. **Alerts Center**: Severity filters (Critical, High, Warning, Info), acknowledgment workflow.
   9. **Incident Management**: Incident board/table, assignment, status transition (Open -> In Progress -> Resolved).
   10. **Maintenance Intelligence**: Recommended inspection checklist, maintenance priority matrix, maintenance log.
   11. **Dataset & Model Management**: Dataset preview, model comparison table (PR-AUC, ROC-AUC, F1), active version toggle.
   12. **Analytics & Reports**: Downtime Pareto charts, MTBF estimates, telemetry trend correlation, report export.
   13. **Settings**: Organization details, user roles, alert threshold configuration.

### Phase 5: Real-Time Telemetry Simulator
1. Build `simulator/engine.py` simulating 8 distinct operational regimes:
   - Normal Steady State
   - Heat Dissipation Failure (gradual thermal runaway)
   - Excessive Vibration / Bearing Degradation
   - Pressure Instability
   - Motor Overload / Power Spike
   - Tool Wear Accumulation
   - Sensor Disconnection (null/flatline)
   - Sudden Mechanical Seizure
2. Control API and Web UI controls (start, pause, scenario select, stream speed, equipment selector).
3. Connect simulator output to backend ingestion -> triggers inference & alert checks -> broadcasts over WebSockets to UI.

### Phase 6: Incident Management & Explainable AI
1. Deterministic and contextual AI maintenance assistant explaining root causes and recommended SOPs.
2. Work order generation from high-severity alerts.
3. Audit logging of all operator actions.

### Phase 7: Testing, Verification & Hackathon Delivery
1. Pytest suite covering auth, models, telemetry ingestion, inference determinism, and alert rules.
2. Dockerfile and docker-compose.yml for one-command deployment.
3. Complete end-to-end hackathon demo run script and user walkthrough guide.
