import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app.core.init_db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "infrasentinel-api"

def test_auth_login_demo_operator():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "operator@infrasentinel.io", "password": "Operator123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" == "access_token" in data
    assert data["user"]["email"] == "operator@infrasentinel.io"
    assert data["user"]["role"] == "operator"

def test_list_equipment():
    response = client.get("/api/v1/equipment/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    codes = [e["code"] for e in data]
    assert "PUMP-101" in codes
    assert "MOTOR-204" in codes

def test_model_metrics_verification():
    response = client.get("/api/v1/models/comparison")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    model_names = [m["name"] for m in data["models"]]
    assert "XGBoost (Calibrated)" in model_names
    assert "Random Forest" in model_names
    assert "Logistic Regression (Baseline)" in model_names

    # Check verified metrics
    xgb_info = next(m for m in data["models"] if m["name"] == "XGBoost (Calibrated)")
    assert xgb_info["pr_auc"] is not None
    assert xgb_info["pr_auc"] > 0.90 # Verified real result from training
    assert xgb_info["roc_auc"] > 0.95

def test_simulator_and_telemetry_flow():
    # 1. Trigger normal tick
    res = client.post("/api/v1/simulator/scenario", json={"scenario": "normal"})
    assert res.status_code == 200

    tick_res = client.post("/api/v1/simulator/tick")
    assert tick_res.status_code == 200
    tick_data = tick_res.json()
    assert tick_data["scenario"] == "normal"

    # 2. Check latest prediction
    pred_res = client.get("/api/v1/predictions/latest/1")
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert pred_data is not None
    assert "failure_risk_probability" in pred_data
    assert "risk_category" in pred_data

def test_abnormal_scenario_and_alert_generation():
    # Switch to thermal runaway scenario
    client.post("/api/v1/simulator/scenario", json={"scenario": "temp_increase"})
    tick_res = client.post("/api/v1/simulator/tick")
    assert tick_res.status_code == 200

    # Query alerts
    alerts_res = client.get("/api/v1/alerts/?equipment_id=1")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert isinstance(alerts, list)

def test_analytics_overview():
    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_equipment"] >= 4
    assert "fleet_health_score" in data
    assert "operational_equipment" in data
