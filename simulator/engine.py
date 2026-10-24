import time
import math
import random
import requests
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("infrasentinel.simulator")

class TelemetrySimulator:
    SCENARIOS = [
        "normal",
        "temp_increase",
        "excessive_vibration",
        "pressure_instability",
        "motor_overload",
        "sensor_disconnection",
        "gradual_deterioration",
        "sudden_abnormal",
    ]

    def __init__(self, api_url: str = "http://localhost:8000/api/v1"):
        self.api_url = api_url
        self.is_running = False
        self.interval = 1.0
        self.current_scenario = "normal"
        self.target_equipment_id = 1
        self.step_count = 0

        # State memories for realistic smooth physics
        self.air_temp = 300.0
        self.process_temp = 310.0
        self.speed_rpm = 1530.0
        self.torque_nm = 40.0
        self.tool_wear = 30.0
        self.vibration = 2.4
        self.pressure = 4.2

    def set_scenario(self, scenario: str):
        if scenario in self.SCENARIOS:
            self.current_scenario = scenario
            logger.info(f"Simulator scenario switched to: {scenario}")

    def generate_reading(self) -> Dict[str, Any]:
        self.step_count += 1
        noise = random.gauss(0, 0.3)

        if self.current_scenario == "normal":
            self.air_temp = 300.0 + random.gauss(0, 0.4)
            self.process_temp = self.air_temp + 10.0 + random.gauss(0, 0.3)
            self.speed_rpm = 1538.0 + random.gauss(0, 25)
            self.torque_nm = 40.0 + random.gauss(0, 2.5)
            self.tool_wear = min(120.0, self.tool_wear + 0.1)
            self.vibration = 2.4 + abs(random.gauss(0, 0.2))
            self.pressure = 4.2 + random.gauss(0, 0.1)

        elif self.current_scenario == "temp_increase":
            # Heat Dissipation Failure (HDF) progression
            self.air_temp = 302.5 + random.gauss(0, 0.3)
            # Process temperature increases, Delta T collapses below 8.6 K, speed slows down
            self.process_temp = self.air_temp + max(5.5, 9.5 - (self.step_count % 30) * 0.18)
            self.speed_rpm = max(1150.0, 1450.0 - (self.step_count % 30) * 12.0)
            self.torque_nm = 48.0 + random.gauss(0, 3.0)
            self.vibration = 3.8 + random.gauss(0, 0.4)
            self.pressure = 4.0 + random.gauss(0, 0.2)

        elif self.current_scenario == "excessive_vibration":
            # Bearing degradation / mechanical imbalance
            self.air_temp = 301.0 + random.gauss(0, 0.4)
            self.process_temp = 312.0 + random.gauss(0, 0.5)
            self.speed_rpm = 1680.0 + math.sin(self.step_count * 0.5) * 80.0
            self.torque_nm = 46.0 + random.gauss(0, 5.0)
            # Severe vibration spike above ISO Zone D limit (> 7 mm/s)
            self.vibration = min(14.5, 6.8 + abs(random.gauss(1.5, 1.2)))
            self.pressure = 3.9 + random.gauss(0, 0.4)

        elif self.current_scenario == "pressure_instability":
            # Cavitation oscillation
            self.air_temp = 300.2 + random.gauss(0, 0.3)
            self.process_temp = 310.8 + random.gauss(0, 0.4)
            self.speed_rpm = 1520.0 + random.gauss(0, 40)
            self.torque_nm = 42.0 + random.gauss(0, 4.0)
            self.vibration = 4.5 + abs(math.sin(self.step_count * 0.8) * 2.2)
            # Pressure drops and violently fluctuates
            self.pressure = max(0.8, 2.8 + math.sin(self.step_count * 0.7) * 2.1)

        elif self.current_scenario == "motor_overload":
            # Power Failure (PWF) / Overstrain (OSF)
            self.air_temp = 303.0 + random.gauss(0, 0.5)
            self.process_temp = 315.5 + random.gauss(0, 0.6)
            self.speed_rpm = 2350.0 + random.gauss(0, 60)
            # Torque spikes high
            self.torque_nm = min(78.0, 68.0 + abs(random.gauss(0, 4.0)))
            self.tool_wear = min(240.0, self.tool_wear + 0.3)
            self.vibration = 5.2 + random.gauss(0, 0.6)
            self.pressure = 6.2 + random.gauss(0, 0.5)

        elif self.current_scenario == "sensor_disconnection":
            # Intermittent flatline
            self.air_temp = 0.0 if (self.step_count % 5 == 0) else 300.0
            self.process_temp = 0.0 if (self.step_count % 5 == 0) else 310.0
            self.speed_rpm = 0.0 if (self.step_count % 5 == 0) else 1500.0
            self.torque_nm = 0.0 if (self.step_count % 5 == 0) else 40.0
            self.vibration = 0.0 if (self.step_count % 5 == 0) else 2.5
            self.pressure = 0.0 if (self.step_count % 5 == 0) else 4.0

        elif self.current_scenario == "gradual_deterioration":
            # Cumulative Tool Wear Failure (TWF)
            self.air_temp = 301.2 + random.gauss(0, 0.3)
            self.process_temp = 313.0 + random.gauss(0, 0.4)
            self.speed_rpm = 1480.0 + random.gauss(0, 30)
            self.torque_nm = 45.0 + (self.tool_wear / 250.0) * 15.0
            self.tool_wear = min(245.0, 180.0 + (self.step_count * 0.8))
            self.vibration = 3.5 + (self.tool_wear / 250.0) * 3.0
            self.pressure = 4.1 + random.gauss(0, 0.2)

        elif self.current_scenario == "sudden_abnormal":
            # Sudden seizure / lockup
            self.air_temp = 304.0 + random.gauss(0, 0.5)
            self.process_temp = 320.0 + random.gauss(0, 0.8)
            self.speed_rpm = 980.0 # severe stall
            self.torque_nm = 76.5 # max torque
            self.tool_wear = 210.0
            self.vibration = 12.5 # violent shaking
            self.pressure = 1.2

        payload = {
            "equipment_id": self.target_equipment_id,
            "air_temp_k": round(self.air_temp, 2),
            "process_temp_k": round(self.process_temp, 2),
            "rotational_speed_rpm": round(self.speed_rpm, 1),
            "torque_nm": round(self.torque_nm, 2),
            "tool_wear_min": round(self.tool_wear, 1),
            "vibration_mms": round(self.vibration, 2),
            "pressure_bar": round(self.pressure, 2),
            "scenario": self.current_scenario,
            "is_simulated": True,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        return payload

    def send_reading(self, payload: Dict[str, Any]) -> bool:
        try:
            resp = requests.post(f"{self.api_url}/telemetry/", json=payload, timeout=2.0)
            return resp.status_code in [200, 201]
        except Exception as e:
            logger.warning(f"Failed to post telemetry to {self.api_url}: {e}")
            return False

    def run_loop(self, max_steps: Optional[int] = None):
        self.is_running = True
        logger.info(f"Telemetry simulator started. Streaming scenario: {self.current_scenario} every {self.interval}s")
        count = 0
        try:
            while self.is_running:
                payload = self.generate_reading()
                ok = self.send_reading(payload)
                count += 1
                if max_steps and count >= max_steps:
                    break
                time.sleep(self.interval)
        except KeyboardInterrupt:
            logger.info("Simulator halted by user.")
        finally:
            self.is_running = False

simulator_engine = TelemetrySimulator()

if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)
    scenario = sys.argv[1] if len(sys.argv) > 1 else "normal"
    simulator_engine.set_scenario(scenario)
    simulator_engine.run_loop()
