from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- Auth & User -----------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "operator"
    org_name: Optional[str] = "Industrial Operations Alpha"

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    org_id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    org_id: Optional[int] = None

# ----------------- Equipment & Sensors -----------------
class SensorCreate(BaseModel):
    name: str
    sensor_type: str
    unit: str
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None
    warning_threshold: Optional[float] = None

class SensorOut(BaseModel):
    id: int
    equipment_id: int
    name: str
    sensor_type: str
    unit: str
    min_threshold: Optional[float]
    max_threshold: Optional[float]
    warning_threshold: Optional[float]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class EquipmentCreate(BaseModel):
    name: str
    code: str
    equipment_type: Optional[str] = "pump"
    quality_type: Optional[str] = "L"
    model_number: Optional[str] = None
    location: Optional[str] = "Main Facility"

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    health_score: Optional[float] = None
    location: Optional[str] = None

class EquipmentOut(BaseModel):
    id: int
    org_id: int
    name: str
    code: str
    equipment_type: str
    quality_type: str
    model_number: Optional[str]
    location: str
    status: str
    health_score: float
    created_at: datetime
    updated_at: datetime
    sensors: Optional[List[SensorOut]] = []

    model_config = ConfigDict(from_attributes=True)

# ----------------- Telemetry -----------------
class TelemetryCreate(BaseModel):
    equipment_id: int
    air_temp_k: float
    process_temp_k: float
    rotational_speed_rpm: float
    torque_nm: float
    tool_wear_min: float
    vibration_mms: Optional[float] = 2.5
    pressure_bar: Optional[float] = 4.0
    scenario: Optional[str] = "normal"
    is_simulated: Optional[bool] = True
    timestamp: Optional[datetime] = None

class TelemetryOut(BaseModel):
    id: int
    equipment_id: int
    timestamp: datetime
    air_temp_k: float
    process_temp_k: float
    rotational_speed_rpm: float
    torque_nm: float
    tool_wear_min: float
    vibration_mms: float
    pressure_bar: float
    scenario: str
    is_simulated: bool

    model_config = ConfigDict(from_attributes=True)

# ----------------- Predictions & Explanations -----------------
class FeatureContributionOut(BaseModel):
    feature: str
    value: float
    baseline: float
    shap_value: float
    impact: str # "INCREASES_RISK", "DECREASES_RISK", "NEUTRAL"
    description: str

class PredictionOut(BaseModel):
    id: Optional[int] = None
    equipment_id: int
    timestamp: datetime
    model_version: str
    failure_risk_probability: float
    risk_category: str # LOW, MEDIUM, HIGH, CRITICAL
    predicted_failure_mode: str
    is_flagged: bool
    feature_contributions: List[FeatureContributionOut] = []
    explanation_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Anomalies -----------------
class AnomalyOut(BaseModel):
    id: Optional[int] = None
    equipment_id: int
    timestamp: datetime
    anomaly_score: float
    is_anomaly: bool
    affected_sensors: Optional[str]
    details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Alerts -----------------
class AlertOut(BaseModel):
    id: int
    equipment_id: int
    timestamp: datetime
    rule_code: str
    severity: str # INFO, WARNING, HIGH, CRITICAL
    title: str
    message: str
    status: str # ACTIVE, ACKNOWLEDGED, RESOLVED, SUPPRESSED
    triggered_value: Optional[str]
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class AlertUpdate(BaseModel):
    status: str # ACKNOWLEDGED, RESOLVED, SUPPRESSED
    acknowledged_by: Optional[str] = None

# ----------------- Incidents -----------------
class IncidentCreate(BaseModel):
    equipment_id: int
    alert_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: Optional[str] = "HIGH"
    priority: Optional[str] = "P2"
    assigned_to_user_id: Optional[int] = None

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None # OPEN, INVESTIGATING, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to_user_id: Optional[int] = None

class IncidentOut(BaseModel):
    id: int
    equipment_id: int
    alert_id: Optional[int]
    incident_number: str
    title: str
    description: Optional[str]
    severity: str
    priority: str
    status: str
    assigned_to_user_id: Optional[int]
    created_at: datetime
    resolved_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

# ----------------- Maintenance -----------------
class MaintenanceRecordCreate(BaseModel):
    equipment_id: int
    incident_id: Optional[int] = None
    maintenance_type: Optional[str] = "PREVENTIVE"
    technician_name: str
    actions_performed: str
    parts_replaced: Optional[str] = None
    downtime_minutes: Optional[int] = 0
    cost: Optional[float] = 0.0

class MaintenanceRecordOut(BaseModel):
    id: int
    equipment_id: int
    incident_id: Optional[int]
    maintenance_type: str
    technician_name: str
    actions_performed: str
    parts_replaced: Optional[str]
    downtime_minutes: int
    cost: float
    performed_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- Model Versions -----------------
class ModelVersionOut(BaseModel):
    id: int
    name: str
    version: str
    algorithm: str
    metrics_json: Dict[str, Any]
    is_active: bool
    trained_at: datetime

    model_config = ConfigDict(from_attributes=True)
