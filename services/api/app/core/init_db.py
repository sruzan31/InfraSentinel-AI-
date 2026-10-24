import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .security import hash_password
from ..models.entities import Organization, User, Equipment, Sensor, Telemetry, Prediction, Alert, Incident, MaintenanceRecord

logger = logging.getLogger("infrasentinel.init_db")

def init_db():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Organization
        org = db.query(Organization).first()
        if not org:
            org = Organization(name="Consolidated Industrial Infrastructure Corp", slug="ciic-alpha")
            db.add(org)
            db.flush()
            logger.info("Created default Organization.")

        # 2. Users
        operator = db.query(User).filter(User.email == "operator@infrasentinel.io").first()
        if not operator:
            operator = User(
                org_id=org.id,
                email="operator@infrasentinel.io",
                hashed_password=hash_password("Operator123!"),
                full_name="Alex Mercer (Lead Operator)",
                role="operator",
                is_active=True
            )
            engineer = User(
                org_id=org.id,
                email="engineer@infrasentinel.io",
                hashed_password=hash_password("Engineer123!"),
                full_name="Elena Vance (Reliability Engineer)",
                role="engineer",
                is_active=True
            )
            admin = User(
                org_id=org.id,
                email="admin@infrasentinel.io",
                hashed_password=hash_password("Admin123!"),
                full_name="Marcus Reed (Plant Administrator)",
                role="admin",
                is_active=True
            )
            db.add_all([operator, engineer, admin])
            db.flush()
            logger.info("Created default Users (operator, engineer, admin).")

        # 3. Equipment Assets
        if db.query(Equipment).count() == 0:
            equipments = [
                Equipment(
                    org_id=org.id,
                    name="Centrifugal Slurry Pump #101",
                    code="PUMP-101",
                    equipment_type="pump",
                    quality_type="L",
                    model_number="FLOWSERVE-CPX400",
                    location="Primary Clarifier Bay A",
                    status="OPERATIONAL",
                    health_score=97.5,
                ),
                Equipment(
                    org_id=org.id,
                    name="Heavy Induction Drive Motor #204",
                    code="MOTOR-204",
                    equipment_type="motor",
                    quality_type="M",
                    model_number="SIEMENS-1LA8",
                    location="Boiler Feed Intake Loop",
                    status="OPERATIONAL",
                    health_score=98.8,
                ),
                Equipment(
                    org_id=org.id,
                    name="High-Pressure Boiler Pump #305",
                    code="PUMP-305",
                    equipment_type="pump",
                    quality_type="H",
                    model_number="SULZER-HPT-50",
                    location="Turbine Power Block 2",
                    status="WARNING",
                    health_score=81.2,
                ),
                Equipment(
                    org_id=org.id,
                    name="Rotary Screw Air Compressor #402",
                    code="COMP-402",
                    equipment_type="compressor",
                    quality_type="L",
                    model_number="ATLAS-COPCO-GA75",
                    location="Auxiliary Pneumatics Shed",
                    status="OPERATIONAL",
                    health_score=94.0,
                ),
            ]
            db.add_all(equipments)
            db.flush()

            # Provision sensors and historical seed telemetry for each asset
            now = datetime.utcnow()
            for eq in equipments:
                sensors = [
                    Sensor(equipment_id=eq.id, name="Air Temperature", sensor_type="temperature_air", unit="K", min_threshold=290, max_threshold=310, warning_threshold=305),
                    Sensor(equipment_id=eq.id, name="Process Temperature", sensor_type="temperature_process", unit="K", min_threshold=300, max_threshold=320, warning_threshold=315),
                    Sensor(equipment_id=eq.id, name="Rotational Speed", sensor_type="rotational_speed", unit="rpm", min_threshold=1100, max_threshold=2900, warning_threshold=2600),
                    Sensor(equipment_id=eq.id, name="Shaft Torque", sensor_type="torque", unit="Nm", min_threshold=3.0, max_threshold=80.0, warning_threshold=65.0),
                    Sensor(equipment_id=eq.id, name="Impeller Tool Wear", sensor_type="tool_wear", unit="min", min_threshold=0, max_threshold=250, warning_threshold=200),
                    Sensor(equipment_id=eq.id, name="Casing Radial Vibration", sensor_type="vibration", unit="mm/s", min_threshold=0.5, max_threshold=15.0, warning_threshold=7.0),
                    Sensor(equipment_id=eq.id, name="Discharge Pressure", sensor_type="pressure", unit="bar", min_threshold=1.0, max_threshold=10.0, warning_threshold=7.5),
                ]
                db.add_all(sensors)

                # Seed 15 historical telemetry points per equipment
                for i in range(15, 0, -1):
                    t_time = now - timedelta(seconds=i*2)
                    is_elevated = (eq.code == "PUMP-305" and i < 5)
                    tele = Telemetry(
                        equipment_id=eq.id,
                        timestamp=t_time,
                        air_temp_k=301.2 + (0.5 if is_elevated else 0.0),
                        process_temp_k=311.5 + (2.0 if is_elevated else 0.0),
                        rotational_speed_rpm=1520 - (150 if is_elevated else 0),
                        torque_nm=41.2 + (15.0 if is_elevated else 0.0),
                        tool_wear_min=45 + (160 if is_elevated else 0),
                        vibration_mms=2.4 + (3.5 if is_elevated else 0.0),
                        pressure_bar=4.2,
                        scenario="degradation" if is_elevated else "normal",
                        is_simulated=True
                    )
                    db.add(tele)

            logger.info("Seeded initial Equipment, Sensors, and Telemetry records.")

        db.commit()
    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
