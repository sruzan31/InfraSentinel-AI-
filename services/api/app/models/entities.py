from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from ..core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    equipment = relationship("Equipment", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="operator") # operator, engineer, admin, auditor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    assigned_incidents = relationship("Incident", back_populates="assignee")


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(100), unique=True, index=True, nullable=False)
    equipment_type = Column(String(100), default="pump") # pump, motor, turbine, compressor
    quality_type = Column(String(10), default="L") # L, M, H
    model_number = Column(String(100), nullable=True)
    location = Column(String(255), default="Primary Pump Station")
    status = Column(String(50), default="OPERATIONAL") # OPERATIONAL, WARNING, CRITICAL, MAINTENANCE, OFFLINE
    health_score = Column(Float, default=98.5) # 0 - 100
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="equipment")
    sensors = relationship("Sensor", back_populates="equipment", cascade="all, delete-orphan")
    telemetry = relationship("Telemetry", back_populates="equipment", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="equipment", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="equipment", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="equipment", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="equipment", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="equipment", cascade="all, delete-orphan")


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    sensor_type = Column(String(100), nullable=False) # temperature_air, temperature_process, rotational_speed, torque, tool_wear, vibration, pressure
    unit = Column(String(20), nullable=False) # K, rpm, Nm, min, mm/s, bar
    min_threshold = Column(Float, nullable=True)
    max_threshold = Column(Float, nullable=True)
    warning_threshold = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)

    equipment = relationship("Equipment", back_populates="sensors")


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    air_temp_k = Column(Float, nullable=False)
    process_temp_k = Column(Float, nullable=False)
    rotational_speed_rpm = Column(Float, nullable=False)
    torque_nm = Column(Float, nullable=False)
    tool_wear_min = Column(Float, nullable=False)
    vibration_mms = Column(Float, default=2.5) # Vibration proxy (ISO 10816)
    pressure_bar = Column(Float, default=4.0)   # Hydraulic / pneumatic pressure
    scenario = Column(String(50), default="normal")
    is_simulated = Column(Boolean, default=True)
    raw_payload = Column(JSON, nullable=True)

    equipment = relationship("Equipment", back_populates="telemetry")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    model_version = Column(String(50), default="1.0.0")
    failure_risk_probability = Column(Float, nullable=False) # Calibrated 0.0 to 1.0
    risk_category = Column(String(20), nullable=False)       # LOW, MEDIUM, HIGH, CRITICAL
    predicted_failure_mode = Column(String(50), default="NONE") # NONE, TWF, HDF, PWF, OSF, RNF
    is_flagged = Column(Boolean, default=False)
    feature_importance_json = Column(JSON, nullable=True)
    explanation_summary = Column(Text, nullable=True)

    equipment = relationship("Equipment", back_populates="predictions")


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    anomaly_score = Column(Float, nullable=False) # 0.0 to 1.0 normalized
    is_anomaly = Column(Boolean, default=False)
    affected_sensors = Column(String(255), nullable=True)
    details_json = Column(JSON, nullable=True)

    equipment = relationship("Equipment", back_populates="anomalies")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    rule_code = Column(String(50), nullable=False) # RISK_THRESHOLD, ANOMALY_SPIKE, TEMP_RUNAWAY, VIB_EXCESS, SENSOR_FLATLINE
    severity = Column(String(20), nullable=False)  # INFO, WARNING, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, ACKNOWLEDGED, RESOLVED, SUPPRESSED
    triggered_value = Column(String(100), nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)

    equipment = relationship("Equipment", back_populates="alerts")
    incident = relationship("Incident", back_populates="alert", uselist=False)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    incident_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), default="HIGH")   # LOW, MEDIUM, HIGH, CRITICAL
    priority = Column(String(20), default="P2")     # P1, P2, P3, P4
    status = Column(String(30), default="OPEN")     # OPEN, INVESTIGATING, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    equipment = relationship("Equipment", back_populates="incidents")
    alert = relationship("Alert", back_populates="incident")
    assignee = relationship("User", back_populates="assigned_incidents")
    maintenance_records = relationship("MaintenanceRecord", back_populates="incident")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    maintenance_type = Column(String(50), default="PREVENTIVE") # PREVENTIVE, CORRECTIVE, EMERGENCY, INSPECTION
    technician_name = Column(String(255), nullable=False)
    actions_performed = Column(Text, nullable=False)
    parts_replaced = Column(String(255), nullable=True)
    downtime_minutes = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    performed_at = Column(DateTime, default=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="maintenance_records")
    incident = relationship("Incident", back_populates="maintenance_records")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    metrics_json = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
